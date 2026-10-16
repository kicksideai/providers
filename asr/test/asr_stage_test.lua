local test = require("test")
local stage = require("stage")

type TranscribeRequest = {
    audio: string,
    mime: string,
    language: string,
    timeout_ms: integer,
}

type TranscriptMetadata = {
    converter: string,
    conversion: boolean,
    filename: string?,
    original_filename: string?,
    original_mime_type: string?,
    source_mime: string?,
    original_upload_id: string?,
    original_storage_id: string?,
    original_storage_path: string?,
    original_size: number?,
    source: string?,
    source_url: string?,
    external_id: string?,
    source_ref: string?,
}

type PersistCall = {
    upload_id: string,
    text: string,
    metadata: TranscriptMetadata,
}

type StorageStat = { size: integer }

type StorageHandle = {
    stat: (StorageHandle, string) -> (StorageStat?, string?),
    readfile: (StorageHandle, string) -> (string?, string?),
}

type ReadAudio = (string, string, integer) -> (string?, string?, string?)
type Transcribe = (TranscribeRequest) -> (string?, string?, boolean?)
type Persist = (string, string, string, TranscriptMetadata) -> (boolean, string?)
type GetStorage = (string) -> (StorageHandle?, string?)

type StageDeps = {
    read: ReadAudio | false,
    transcribe: Transcribe,
    persist: Persist,
    get_storage: GetStorage?,
    max_bytes: integer?,
    max_transcript_bytes: integer?,
}

type StageOverrides = {
    read: ReadAudio | false | nil,
    transcribe: Transcribe?,
    max_bytes: integer?,
    max_transcript_bytes: integer?,
}

type StageCalls = {
    transcribed: {TranscribeRequest},
    reads: integer,
    stats: integer,
    persisted: {PersistCall},
}

local function define_tests()
    test.describe("ASR upload stage", function()
        local function deps(overrides: StageOverrides?): (StageDeps, StageCalls)
            local calls: StageCalls = { transcribed = {}, reads = 0, stats = 0, persisted = {} }
            local base: StageDeps = {
                read = function(_storage_id: string, _storage_path: string, _max_bytes: integer): (string?, string?, string?)
                    calls.reads = calls.reads + 1
                    return "OggS-bytes", nil
                end,
                transcribe = function(request: TranscribeRequest): (string?, string?, boolean?)
                    calls.transcribed[#calls.transcribed + 1] = request
                    return "  Проверка распознавания.  ", nil
                end,
                persist = function(upload_id: string, storage_id: string, text: string, upload_metadata: TranscriptMetadata): (boolean, string?)
                    calls.persisted[#calls.persisted + 1] = { upload_id = upload_id, text = text, metadata = upload_metadata }
                    return true, nil
                end,
            }
            for key, value in pairs(overrides or {}) do base[key] = value end
            return base, calls
        end

        local function audio(over)
            local params = {
                upload_id = "up-1",
                mime_type = "audio/ogg",
                storage_id = "app:temp_fs",
                storage_path = "uploads/up-1.oga",
                size = 4200,
            }
            for key, value in pairs(over or {}) do params[key] = value end
            return params
        end

        test.it("transcribes an audio upload and stores the text as its content", function()
            local set: StageDeps, calls: StageCalls = deps()
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.eq(result.metadata.asr_bytes, #"Проверка распознавания.")
            test.eq(#calls.transcribed, 1)
            test.eq(calls.transcribed[1].audio, "OggS-bytes")
            test.eq(calls.transcribed[1].mime, "audio/ogg")
            test.eq(#calls.persisted, 1)
            test.eq(calls.persisted[1].upload_id, "up-1")
            test.eq(calls.persisted[1].text, "Проверка распознавания.")
        end)

        test.it("leaves everything that is not audio alone, without reading it", function()
            local set: StageDeps, calls: StageCalls = deps()
            local result = stage.run(audio({ mime_type = "application/pdf" }), set)

            test.eq(result.success, true)
            test.is_nil(result.metadata)
            test.eq(calls.reads, 0)
            test.eq(#calls.transcribed, 0)
        end)

        test.it("skips a clip larger than the configured cap", function()
            local set: StageDeps, calls: StageCalls = deps()
            local result = stage.run(audio({ size = 25 * 1024 * 1024 + 1 }), set)

            test.eq(result.success, true)
            test.eq(calls.reads, 0)
            test.eq(#calls.transcribed, 0)
            test.eq(result.metadata.asr_error, "too_large")
        end)

        test.it("caps on the bytes it read, not on the size it was told", function()
            local set: StageDeps, calls: StageCalls = deps({
                max_bytes = 10,
                read = function(_storage_id: string, _storage_path: string, _max_bytes: integer): (string?, string?, string?) return string.rep("x", 11), nil end,
            })
            local result = stage.run(audio({ size = 10 }), set)

            test.eq(result.success, true)
            test.eq(#calls.transcribed, 0)
            test.eq(result.metadata.asr_error, "too_large")
        end)

        test.it("stats an oversized object before reading it", function()
            local set: StageDeps, calls: StageCalls = deps({
                max_bytes = 10,
                read = false,
            })
            set.get_storage = function(_storage_id: string): (StorageHandle?, string?)
                return {
                    stat = function(_self: StorageHandle, _path: string): (StorageStat?, string?)
                        calls.stats = calls.stats + 1
                        return { size = 11 }, nil
                    end,
                    readfile = function(_self: StorageHandle, _path: string): (string?, string?)
                        calls.reads = calls.reads + 1
                        return "this must not be read", nil
                    end,
                }, nil
            end
            local result = stage.run(audio({ size = 1 }), set)

            test.eq(result.success, true)
            test.eq(calls.stats, 1)
            test.eq(calls.reads, 0)
            test.eq(#calls.transcribed, 0)
            test.eq(result.metadata.asr_error, "too_large")
        end)

        test.it("rejects a storage object that changes after its size check", function()
            local set: StageDeps, calls: StageCalls = deps({
                max_bytes = 10,
                read = false,
            })
            set.get_storage = function(_storage_id: string): (StorageHandle?, string?)
                return {
                    stat = function(_self: StorageHandle, _path: string): (StorageStat?, string?)
                        calls.stats = calls.stats + 1
                        return { size = 10 }, nil
                    end,
                    readfile = function(_self: StorageHandle, _path: string): (string?, string?)
                        calls.reads = calls.reads + 1
                        return string.rep("x", 11), nil
                    end,
                }, nil
            end
            local result = stage.run(audio({ size = 1 }), set)

            test.eq(result.success, true)
            test.eq(calls.stats, 1)
            test.eq(calls.reads, 1)
            test.eq(#calls.transcribed, 0)
            test.eq(result.metadata.asr_error, "too_large")
        end)

        test.it("carries canonical upload provenance onto the transcript", function()
            local set: StageDeps, calls: StageCalls = deps()
            stage.run(audio({ metadata = {
                filename = "voice.oga",
                original_mime_type = "audio/ogg",
                source = "telegram",
                source_url = "https://example.test/voice",
                external_id = "message-42",
                source_ref = "opaque-file-ref",
            } }), set)

            test.eq(calls.persisted[1].metadata.filename, "voice.oga")
            test.eq(calls.persisted[1].metadata.original_filename, "voice.oga")
            test.eq(calls.persisted[1].metadata.original_mime_type, "audio/ogg")
            test.eq(calls.persisted[1].metadata.source_mime, "audio/ogg")
            test.eq(calls.persisted[1].metadata.original_upload_id, "up-1")
            test.eq(calls.persisted[1].metadata.original_storage_id, "app:temp_fs")
            test.eq(calls.persisted[1].metadata.original_storage_path, "uploads/up-1.oga")
            test.eq(calls.persisted[1].metadata.original_size, 4200)
            test.eq(calls.persisted[1].metadata.source, "telegram")
            test.eq(calls.persisted[1].metadata.source_url, "https://example.test/voice")
            test.eq(calls.persisted[1].metadata.external_id, "message-42")
            test.eq(calls.persisted[1].metadata.source_ref, "opaque-file-ref")
            test.eq(calls.persisted[1].metadata.converter, "asr")
            test.is_true(calls.persisted[1].metadata.conversion)
        end)

        test.it("stays a no-op when no transcriber is bound", function()
            local set: StageDeps, calls: StageCalls = deps({ transcribe = function(_request: TranscribeRequest): (string?, string?, boolean?) return nil, nil end })
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.eq(#calls.persisted, 0)
        end)

        test.it("records a stable transcription failure code without leaking the provider error", function()
            local secret = "upstream API token=never-return-this"
            local set: StageDeps, calls: StageCalls = deps({ transcribe = function(_request: TranscribeRequest): (string?, string?, boolean?) return nil, secret end })
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.eq(result.metadata.asr_error, "transcription_failed")
            test.is_false(tostring(result.metadata.asr_error):find(secret, 1, true) ~= nil)
            test.eq(#calls.persisted, 0)
        end)

        test.it("never fails the upload when the stored audio cannot be read", function()
            local secret = "storage credential=secret"
            local set: StageDeps, calls: StageCalls = deps({ read = function(_storage_id: string, _storage_path: string, _max_bytes: integer): (string?, string?, string?) return nil, secret, secret end })
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.eq(#calls.transcribed, 0)
            test.eq(result.metadata.asr_error, "storage_read_failed")
            test.is_false(tostring(result.metadata.asr_error):find(secret, 1, true) ~= nil)
        end)

        test.it("does not persist a transcript over the output cap", function()
            local set: StageDeps, calls: StageCalls = deps({
                max_transcript_bytes = 10,
                transcribe = function(_request: TranscribeRequest): (string?, string?, boolean?) return string.rep("x", 11), nil end,
            })
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.eq(result.metadata.asr_error, "transcript_too_large")
            test.eq(#calls.persisted, 0)
        end)

        test.it("writes nothing for a clip with no speech in it", function()
            local set: StageDeps, calls: StageCalls = deps({ transcribe = function(_request: TranscribeRequest): (string?, string?, boolean?) return "   \n  ", nil end })
            local result = stage.run(audio(), set)

            test.eq(result.success, true)
            test.is_false(result.metadata.asr_error)
            test.eq(#calls.persisted, 0)
        end)

        test.it("no-ops on malformed params rather than failing the upload", function()
            test.eq(stage.run(nil, {}).success, true)
            test.eq(stage.run({ mime_type = "audio/ogg" }, {}).success, true)
        end)

        test.it("reads speech by mime family, not by extension", function()
            test.is_true(stage.is_transcribable("audio/ogg"))
            test.is_true(stage.is_transcribable("AUDIO/MPEG"))
            test.is_true(stage.is_transcribable("audio/webm"))
            test.is_true(stage.is_transcribable("video/mp4"))
            test.is_false(stage.is_transcribable("application/ogg"))
            test.is_false(stage.is_transcribable("image/png"))
            test.is_false(stage.is_transcribable(nil))
        end)

        test.it("transcribes a video note, where the speech also lives", function()
            local set: StageDeps, calls: StageCalls = deps()
            local result = stage.run(audio({ mime_type = "video/mp4" }), set)

            test.eq(result.success, true)
            test.eq(#calls.transcribed, 1)
            test.eq(calls.transcribed[1].mime, "video/mp4")
        end)

        test.it("says why a clip over the cap has no transcript, instead of nothing", function()
            local set: StageDeps, calls: StageCalls = deps()
            local result = stage.run(audio({ mime_type = "video/mp4", size = 40 * 1024 * 1024 }), set)

            test.eq(result.success, true)
            test.eq(result.metadata.asr_error, "too_large")
            test.eq(calls.reads, 0)
            test.eq(#calls.transcribed, 0)
        end)

        test.it("clears the previous attempt's reason when a retry succeeds", function()
            local set: StageDeps = deps()
            local result = stage.run(audio(), set)

            -- The pipeline merges metadata key by key and deletes nothing, so a
            -- cleared marker has to be written. False, not "": an empty string is
            -- truthy in Lua and a reader testing the field would fire on it.
            test.is_false(result.metadata.asr_error)
        end)

        test.it("passes on that the transcriber handled only part of the clip", function()
            local set: StageDeps = deps({
                transcribe = function(_request: TranscribeRequest): (string?, string?, boolean?)
                    return "Первые двадцать пять секунд.", nil, true
                end,
            })
            local result = stage.run(audio({ mime_type = "video/mp4" }), set)

            test.is_true(result.metadata.asr_truncated)
        end)

        test.it("says nothing about truncation when the whole clip was heard", function()
            local set: StageDeps = deps()
            local result = stage.run(audio(), set)

            test.is_false(result.metadata.asr_truncated)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
