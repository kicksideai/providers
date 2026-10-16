local test = require("test")
local funcs = require("funcs")

local EXTRACTOR_REF = "kickside.kb10.injection:content_extractor"

local function call(event)
    return funcs.call(EXTRACTOR_REF, { event = event })
end

local function define_tests()
    test.describe("content extractor", function()
        test.it("rejects upserts without natural external identity", function()
            local result, err = call({
                id = "evt-transient",
                seq = 1,
                type = "kickside.knowledge.events:content.upserted",
                body = {
                    content = "same source, different transport event",
                    metadata = {},
                },
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.error, "content event missing external_id")
            test.eq(#result.documents, 0)
        end)

        test.it("propagates delete external version into delete records", function()
            local result, err = call({
                id = "evt-delete",
                seq = 2,
                type = "kickside.knowledge.events:content.deleted",
                external = {
                    external_source = "knowledge.kb",
                    external_id = "doc-1",
                    external_version = "v2",
                },
                body = {
                    metadata = { actor_id = "user-1" },
                    source_ref = { kind = "manual", external_id = "doc-1", external_version = "v2" },
                },
            })

            test.is_nil(err)
            test.not_nil(result)
            test.eq(#result.documents, 0)
            test.eq(#result.deletes, 1)
            test.eq(result.deletes[1].external_id, "doc-1")
            test.eq(result.deletes[1].external_version, "v2")
            test.eq(result.deletes[1].metadata.external_version, "v2")
            test.eq(result.deletes[1].user_id, "user-1")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
