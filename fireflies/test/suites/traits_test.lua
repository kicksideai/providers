local test = require("test")
local json = require("json")
local registry = require("registry")
local reader = require("reader")
local fixture = require("fixture")

local GET_TOOL = "kickside.fireflies.traits:get_tool"

local function get_entry(id: string): any
    local entries, err = registry.find({ [".id"] = id })
    test.is_nil(err)
    test.not_nil(entries, id .. " lookup failed")
    test.eq(#entries, 1, id .. " should resolve once")
    return entries[1]
end

local function decode_schema(entry: any): any
    test.not_nil(entry.meta, entry.id .. " missing meta")
    test.eq(entry.meta.type, "tool")
    test.not_nil(entry.meta.input_schema, entry.id .. " missing input_schema")
    local schema, err = json.decode(tostring(entry.meta.input_schema))
    test.is_nil(err)
    test.eq(schema.type, "object")
    test.eq(schema.additionalProperties, false)
    return schema
end

local function enum_contains(enum: any, value: string): boolean
    for _, item in ipairs(enum or {}) do
        if item == value then return true end
    end
    return false
end

local function define_tests()
    test.describe("Fireflies traits", function()
        test.it("publishes the read tool with a model-facing schema", function()
            local schema = decode_schema(get_entry(GET_TOOL))
            test.not_nil(schema.properties.action.enum)
            test.eq(schema.required[1], "action")
        end)

        test.it("advertises the documented Fireflies read actions", function()
            local enum = decode_schema(get_entry(GET_TOOL)).properties.action.enum
            for _, action in ipairs({ "get_user", "list_transcripts", "get_transcript", "get_transcript_text" }) do
                test.is_true(enum_contains(enum, action), "missing read action " .. action)
            end
        end)

        test.it("lists transcripts with participant identities and a skip cursor", function()
            local result: any = reader.handler({ action = "list_transcripts", limit = 1 })
            test.eq(result.count, 1)
            test.eq(result.transcripts[1].id, "meeting-1")
            test.eq(result.transcripts[1].participants[1], "organizer@example.com")
            test.eq(result.transcripts[1].participants[2], "attendee@example.com")
            test.eq(result.next_skip, 1)
        end)

        test.it("lists every field Fireflies answers for a transcript", function()
            local row: any = (reader.handler({ action = "list_transcripts" }) :: any).transcripts[1]
            test.eq(row.dateString, "2025-06-01T10:00:00.000Z")
            test.is_false(row.is_live)
            test.eq(row.speakers[1].name, "Ada")
            test.eq(row.meeting_attendees[1].email, "attendee@example.com")
        end)

        test.it("fails with the typed transport error and returns the Fireflies rejection", function()
            fixture.failure = errors.new({ kind = errors.UNAVAILABLE, message = "provider unreachable" })
            local result, err = reader.handler({ action = "list_transcripts" })
            fixture.failure = nil
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            fixture.rejection = { success = false, error = "Invalid API key", status_code = 200,
                data = { errors = { { message = "Invalid API key", code = "auth_failed" } } } }
            local rejected: any = reader.handler({ action = "list_transcripts" })
            fixture.rejection = nil
            test.is_false(rejected.success)
            test.eq(rejected.error, "Invalid API key")
            test.eq(rejected.data.errors[1].code, "auth_failed")
        end)

        test.it("returns the complete transcript summary and attendees", function()
            local result: any, err = reader.handler({ action = "get_transcript", transcript_id = "meeting-1" })
            test.is_nil(err)
            test.eq(result.summary.overview, string.rep("x", 3000))
            test.eq(result.summary.action_items, "Follow up")
            test.eq(result.meeting_attendees[2].email, "attendee@example.com")
        end)

        test.it("returns every transcript sentence with its speaker", function()
            local result: any, err = reader.handler({ action = "get_transcript_text", transcript_id = "meeting-1" })
            test.is_nil(err)
            test.eq(#result.sentences, 3)
            test.eq(result.sentences[1].speaker_name, "Ada")
            test.eq(result.sentences[1].text, "éOne")
        end)

        test.it("returns an error for a missing transcript id", function()
            local result: any = reader.handler({ action = "get_transcript" })
            test.is_false(result.success)
            test.eq(result.error, "transcript_id required")
        end)

        test.it("keeps connection selection out of the model-facing schema", function()
            local schema_text = tostring(get_entry(GET_TOOL).meta.input_schema or "")
            test.is_nil(schema_text:find("component_id", 1, true), "exposes component_id")
            test.is_nil(schema_text:find("connection_id", 1, true), "exposes connection_id")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
