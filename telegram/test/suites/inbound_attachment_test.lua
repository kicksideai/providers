local test = require("test")
local inbound = require("implementation")
local fetch = require("fetch")
local fetch_func = require("fetch_func")

local function with_transport(stub: any, body: () -> ()): ()
    local saved = fetch._transport
    fetch._transport = stub
    local ok, err = pcall(body)
    fetch._transport = saved
    if not ok then error(err) end
end

local function transport(overrides: any?): any
    local base = {
        connect = function() return { bot_token = "t" }, nil end,
        get_file = function() return { success = true, data = { file_path = "voice/file_5.oga", file_size = 10 } } end,
        download_file = function() return { success = true, data = "OggS-bytes" } end,
    }
    for key, value in pairs(overrides or {}) do base[key] = value end
    return base
end

local function define_tests()
    test.describe("Telegram inbound attachments", function()
        test.it("carries an opaque ref without a URL or token", function()
            local list = inbound._message_attachments({
                voice = { file_id = "AA", mime_type = "audio/ogg", file_size = 4200 },
            })
            test.eq(#list, 1)
            test.eq(list[1].ref, "AA")
            test.is_nil(list[1].url)
            test.eq(list[1].filename, "voice.oga")
            test.eq(list[1].mime, "audio/ogg")
            test.eq(list[1].size, 4200)
        end)

        test.it("preserves mixed message files as opaque references with their media defaults", function()
            local list = inbound._message_attachments({
                voice = { file_id = "voice-ref" },
                audio = { file_id = "audio-ref", file_name = "song.mp3" },
                video_note = { file_id = "note-ref" },
                video = { file_id = "video-ref" },
                document = { file_id = "doc-ref", file_name = "brief.txt", mime_type = "text/plain" },
                photo = { { file_id = "small", width = 1, height = 2 }, { file_id = "large", width = 20, height = 10 } },
            })
            test.eq(#list, 6)
            for index, expected in ipairs({
                { ref = "voice-ref", mime = "audio/ogg", filename = "voice.oga" },
                { ref = "audio-ref", mime = "audio/mpeg", filename = "song.mp3" },
                { ref = "note-ref", mime = "video/mp4", filename = "video_note.mp4" },
                { ref = "video-ref", mime = "video/mp4", filename = "video.mp4" },
                { ref = "doc-ref", mime = "text/plain", filename = "brief.txt" },
                { ref = "large", mime = "image/jpeg", filename = "photo.jpg" },
            }) do
                test.eq(list[index].ref, expected.ref)
                test.eq(list[index].mime, expected.mime)
                test.eq(list[index].filename, expected.filename)
                test.is_nil(list[index].url)
            end
        end)

        test.it("uses safe defaults and normalizes untrusted metadata", function()
            local note = inbound._message_attachments({ video_note = { file_id = "BB", file_size = -7 } })
            test.eq(note[1].filename, "video_note.mp4")
            test.eq(note[1].mime, "video/mp4")
            test.eq(note[1].size, 0)

            local doc = inbound._message_attachments({
                document = { file_id = "CC", file_name = "../bad\nname.pdf", mime_type = "bad\rtype" },
            })
            test.eq(doc[1].filename, ".._bad_name.pdf")
            test.eq(doc[1].mime, "application/octet-stream")

            local malformed = inbound._message_attachments({
                document = { file_id = "DD", file_name = string.rep("x", 256), mime_type = 42 },
            })
            test.eq(malformed[1].filename, "document")
            test.eq(malformed[1].mime, "application/octet-stream")
        end)

        test.it("keeps ordinary document metadata", function()
            local list = inbound._message_attachments({
                document = { file_id = "CC", file_name = "spec.pdf", mime_type = "application/pdf" },
            })
            test.eq(list[1].filename, "spec.pdf")
            test.eq(list[1].mime, "application/pdf")
        end)

        test.it("counts an animation once when Telegram duplicates it as a document", function()
            local list = inbound._message_attachments({
                animation = { file_id = "anim", mime_type = "video/mp4" },
                document = { file_id = "anim-doc", mime_type = "video/mp4" },
            })
            test.eq(#list, 1)
            test.eq(list[1].ref, "anim")
        end)

        test.it("selects the largest photo independent of order", function()
            local list = inbound._message_attachments({ photo = {
                { file_id = "original", width = 1280, height = 960 },
                { file_id = "thumb", width = 90, height = 67 },
            } })
            test.eq(#list, 1)
            test.eq(list[1].ref, "original")
            test.eq(list[1].filename, "photo.jpg")
        end)

        test.it("derives sticker formats from Telegram flags", function()
            test.eq(inbound._message_attachments({ sticker = { file_id = "S1" } })[1].mime, "image/webp")
            test.eq(inbound._message_attachments({ sticker = { file_id = "S2", is_animated = true } })[1].mime, "application/x-tgsticker")
            test.eq(inbound._message_attachments({ sticker = { file_id = "S3", is_video = true } })[1].mime, "video/webm")
        end)

        test.it("ignores malformed refs and messages without files", function()
            test.eq(#inbound._message_attachments({ voice = { file_id = "bad\nref" } }), 0)
            test.eq(#inbound._message_attachments({ voice = { file_id = 123 } }), 0)
            test.eq(#inbound._message_attachments({ text = "hi" }), 0)
            test.eq(#inbound._message_attachments(nil), 0)
        end)
    end)

    test.describe("Telegram attachment fetch", function()
        test.it("resolves a ref with the stamped component and returns only bytes", function()
            local asked: any = {}
            with_transport(transport({
                connect = function(component_id)
                    asked.component_id = component_id
                    return { bot_token = "private" }, nil
                end,
                get_file = function(_conn, ref)
                    asked.ref = ref
                    return { success = true, data = { file_path = "voice/file_5.oga", file_size = 10 } }
                end,
            }), function()
                local result = fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" })
                test.eq(result.bytes, "OggS-bytes")
                test.is_nil(result.error)
                test.eq(asked.component_id, "cmp-1")
                test.eq(asked.ref, "AA")
                test.is_nil(result.url)
            end)
        end)

        test.it("allows only the unambiguous default when no component is stamped", function()
            local asked = "unset"
            with_transport(transport({ connect = function(component_id)
                asked = component_id
                return { bot_token = "t" }, nil
            end }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA" }).bytes, "OggS-bytes")
                test.eq(asked, "")
            end)

            with_transport(transport({ connect = function()
                return nil, "no Telegram connection selected; configure the trait connection when there is no single default"
            end }), function()
                local result = fetch.fetch_attachment({ ref = "AA" })
                test.is_nil(result.bytes)
                test.is_true(result.error:find("no Telegram connection selected", 1, true) ~= nil)
            end)
        end)

        test.it("rejects malformed refs before touching a connection", function()
            local calls = 0
            with_transport(transport({ connect = function()
                calls = calls + 1
                return { bot_token = "t" }, nil
            end }), function()
                test.eq(fetch.fetch_attachment({ ref = "" }).error, "no attachment ref")
                test.eq(fetch.fetch_attachment({ ref = "bad\nref" }).error, "invalid attachment ref")
                test.eq(fetch.fetch_attachment({ ref = string.rep("x", fetch.MAX_REF_BYTES + 1) }).error, "invalid attachment ref")
                test.eq(calls, 0)
            end)
        end)

        test.it("reports getFile, missing path, and download failures", function()
            with_transport(transport({ get_file = function() return { success = false, error = "file expired" } end }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" }).error, "file expired")
            end)
            with_transport(transport({ get_file = function() return { success = true, data = {} } end }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" }).error, "Telegram returned no file_path")
            end)
            with_transport(transport({ download_file = function() return { success = false, error = "download failed" } end }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" }).error, "download failed")
            end)
        end)

        test.it("returns typed getFile and download failures through the fetch function", function()
            local get_failure = errors.new({ kind = errors.UNAVAILABLE, message = "Telegram getFile transport reset" })
            with_transport(transport({ get_file = function() return nil, get_failure end }), function()
                local value, err = fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" })
                test.is_nil(value)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.contains(tostring(err), "getFile transport reset")

                local forwarded, forwarded_err = fetch_func.fetch_attachment({ ref = "AA", component_id = "cmp-1" })
                test.is_nil(forwarded)
                test.is_true(errors.is(forwarded_err, errors.UNAVAILABLE))
                test.contains(tostring(forwarded_err), "getFile transport reset")
            end)

            local download_failure = errors.new({ kind = errors.UNAVAILABLE, message = "Telegram download transport reset" })
            with_transport(transport({ download_file = function() return nil, download_failure end }), function()
                local value, err = fetch.fetch_attachment({ ref = "AA", component_id = "cmp-1" })
                test.is_nil(value)
                test.is_true(errors.is(err, errors.UNAVAILABLE))
                test.contains(tostring(err), "download transport reset")
            end)
        end)

        test.it("enforces the byte cap before and after download", function()
            local downloads = 0
            with_transport(transport({
                get_file = function() return { success = true, data = { file_path = "file", file_size = fetch.MAX_BYTES + 1 } } end,
                download_file = function() downloads = downloads + 1; return { success = true, data = "x" } end,
            }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA" }).error, "attachment too large")
                test.eq(downloads, 0)
            end)
            with_transport(transport({
                download_file = function() return { success = true, data = string.rep("x", fetch.MAX_BYTES + 1) } end,
            }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA" }).error, "attachment too large")
            end)
            with_transport(transport({ download_file = function() return { success = true, data = "" } end }), function()
                test.eq(fetch.fetch_attachment({ ref = "AA" }).error, "Telegram download returned no bytes")
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
