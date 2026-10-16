local test = require("test")
local funcs = require("funcs")
local fs = require("fs")
local upload_record_repo = require("upload_record_repo")
local artifact_parts_repo = require("artifact_parts_repo")

-- Nothing in this path decodes the audio: the stage reads bytes and the bound
-- transcriber reports how many it was handed, which is what makes the assertion
-- prove the bytes travelled rather than a placeholder.
local AUDIO = "OggS" .. string.rep("\0", 60)
local UPLOAD_ID = "11111111-1111-4111-8111-111111111111"
local STORAGE_ID = "app:temp_fs"
local STORAGE_PATH = "asr-test-voice.oga"
local EXPECTED = "heard " .. tostring(#AUDIO) .. " bytes of audio/ogg"

local function define_tests()
    test.describe("ASR against a real upload", function()
        test.it("reads the stored audio and writes the transcript as the upload's content", function()
            local storage = fs.get(STORAGE_ID)
            test.not_nil(storage, "the harness storage is missing")
            local _, write_err = storage:writefile(STORAGE_PATH, AUDIO)
            test.is_nil(write_err)

            local upload, create_err = upload_record_repo.create(
                UPLOAD_ID, "asr-test-user", #AUDIO, "audio/ogg",
                STORAGE_ID, STORAGE_PATH, "generic", { source = "asr-test" }
            )
            test.is_nil(create_err)
            test.not_nil(upload, "the upload row was not created")

            local result, call_err = funcs.call("kickside.asr:stage", {
                upload_id = UPLOAD_ID,
                mime_type = "audio/ogg",
                storage_id = STORAGE_ID,
                storage_path = STORAGE_PATH,
                size = #AUDIO,
            })
            test.is_nil(call_err)
            test.eq(result.success, true)
            test.eq(result.metadata.asr_bytes, #EXPECTED)

            local primary, primary_err = artifact_parts_repo.read_primary_content(UPLOAD_ID)
            test.is_nil(primary_err)
            test.not_nil(primary, "the upload has no primary content")
            test.eq(primary.content, EXPECTED)

            -- The shape is what makes the transcript readable downstream: anything
            -- else and read_primary_content, knowledge ingest and the file tools
            -- stop seeing it.
            local artifact, artifact_err = artifact_parts_repo.get_primary_content_artifact(UPLOAD_ID)
            test.is_nil(artifact_err)
            test.eq(tostring((artifact :: any).kind), "markdown")
            test.eq(tostring((artifact :: any).role), "primary")
            test.eq(tostring((artifact :: any).mime_type), "text/markdown")
        end)
        test.it("replaces a video transcript on retry while clearing failure and truncation markers", function()
            local upload_id = "22222222-2222-4222-8222-222222222222"
            local storage_path = "asr-test-video.webm"
            local storage, storage_err = fs.get(STORAGE_ID)
            test.is_nil(storage_err)
            test.not_nil(storage)
            local _, write_err = storage:writefile(storage_path, AUDIO)
            test.is_nil(write_err)
            local _, create_err = upload_record_repo.create(
                upload_id, "asr-test-user", #AUDIO, "video/webm",
                STORAGE_ID, storage_path, "generic", { filename = "video.webm" }
            )
            test.is_nil(create_err)
            local params = {
                upload_id = upload_id, mime_type = "video/webm",
                storage_id = STORAGE_ID, storage_path = storage_path,
                size = #AUDIO, metadata = { filename = "video.webm", asr_error = "too_large", asr_truncated = true },
            }
            local first, first_err = funcs.call("kickside.asr:stage", params)
            test.is_nil(first_err)
            test.is_false(first.metadata.asr_error)
            test.is_false(first.metadata.asr_truncated)
            local initial, initial_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
            test.is_nil(initial_err)
            test.eq(initial.metadata.filename, "video.webm")
            local next_audio = AUDIO .. "more speech"
            local _, rewrite_err = storage:writefile(storage_path, next_audio)
            test.is_nil(rewrite_err)
            params.size = #next_audio
            local second, second_err = funcs.call("kickside.asr:stage", params)
            test.is_nil(second_err)
            test.is_false(second.metadata.asr_error)
            test.is_false(second.metadata.asr_truncated)
            local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
            test.is_nil(primary_err)
            test.eq(primary.content, "heard " .. tostring(#next_audio) .. " bytes of video/webm")
            local final, final_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
            test.is_nil(final_err)
            test.eq(final.artifact_id, initial.artifact_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
