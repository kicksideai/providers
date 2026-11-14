-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local contract = require("contract")
local security = require("security")
local uuid = require("uuid")
local store = require("store")
local materializer = require("materializer")
local models = require("models")
local kb_answer = require("kb_answer")

local function define_tests()
    test.describe("analysis availability through engine descriptors", function()
        for _, kind in ipairs({ "document", "wiki" }) do
            test.it("retrieves, analyzes and preserves model errors for " .. kind, function()
                local id = uuid.v7()
                local name = "analysis-" .. id
                local configured = "class:" .. name
                local function card(classes: any, provider_model: string)
                    local _, err = models.upsert_card({ name = name, class = classes,
                        provider_id = "app.analysis:provider", provider_model = provider_model,
                        capabilities = { "generate", "structured_output", "embed" },
                        dimensions = 512, max_tokens = 4096, output_tokens = 1024 })
                    test.is_nil(err)
                end
                local ok, failure = pcall(function()
                    card({}, "available")
                    local _, create_err = store.create_store(id, name, { analysis_model = configured },
                        { kb_type = kind, is_graph = kind == "wiki" })
                    test.is_nil(create_err)
                    local descriptor, descriptor_err = registry.get("kickside.kb10:engine_" .. kind)
                    test.is_nil(descriptor_err)
                    local definition, definition_err = contract.get("kickside.contract:queryable")
                    test.is_nil(definition_err)
                    local engine, open_err = definition:with_actor(security.new_actor("analysis-test", {}))
                        :with_scope(security.named_scope("wippy.security:process"))
                        :open(descriptor.meta.query_binding, { component_id = id })
                    test.is_nil(open_err)
                    local function ask_unavailable()
                        local previous = kb_answer._kb_search
                        kb_answer._kb_search = {
                            config = function()
                                local row, err = store.get_store(id)
                                return row and row.config, descriptor.meta, err
                            end,
                            query = function(_, opts) return engine:query(opts) end,
                        }
                        local asked, result, err = pcall(kb_answer.ask, id, { query = "reference" })
                        kb_answer._kb_search = previous
                        if not asked then error(result) end
                        test.is_nil(result)
                        test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
                        test.contains(tostring(err), "No models found for class: " .. name)
                    end
                    local empty, empty_err = engine:query({ query = "reference" })
                    test.is_nil(empty_err)
                    test.eq(empty.count, 0)
                    test.eq(empty.retrieval.analysis.reason, "no_models_for_class")
                    ask_unavailable()
                    local lineage = { external_source = "test", external_id = "reference", external_version = "1",
                        thread_event_id = uuid.v7(), thread_event_seq = 1,
                        source_ref = { external_source = "test", external_id = "reference", external_version = "1" } }
                    lineage.source_ref.thread_event_id = lineage.thread_event_id
                    lineage.source_ref.thread_event_seq = lineage.thread_event_seq
                    local vector = {}
                    for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
                    local children = {}
                    for _, node_type in ipairs({ "summary", "chunk" }) do
                        children[#children + 1] = { node = { node_type = node_type, content = "Reference passage",
                            content_type = "text/plain", metadata = lineage }, embedding = vector }
                    end
                    local _, seed_err = materializer.replace_document(materializer, { store_id = id,
                        document = { node_type = "document", content = "Reference passage", content_type = "text/plain", metadata = lineage },
                        children = children })
                    test.is_nil(seed_err)
                    local result, err = engine:query({ query = "reference" })
                    test.is_nil(err)
                    test.is_true(result.success)
                    test.eq(result.items[1].content, "Reference passage")
                    test.eq(result.retrieval.strategy, "plain")
                    test.eq(result.retrieval.analysis.status, "unavailable")
                    test.eq(result.retrieval.analysis.model, configured)
                    ask_unavailable()
                    card({ name }, "available")
                    result, err = engine:query({ query = "reference" })
                    test.is_nil(err)
                    test.is_true(result.success)
                    test.eq(result.items[1].content, "Reference passage")
                    test.is_nil(result.retrieval)
                    card({ name }, "unavailable")
                    for _, identifier in ipairs({ configured, name, "missing-" .. id }) do
                        local _, update_err = store.update_config(id, { analysis_model = identifier })
                        test.is_nil(update_err)
                        result, err = engine:query({ query = "reference" })
                        test.is_nil(result)
                        test.not_nil(err)
                        test.contains(tostring(err), "document analysis failed")
                    end
                end)
                local _, delete_err = store.delete_store(id)
                test.is_nil(delete_err)
                local _, card_err = models.delete_card(name)
                test.is_nil(card_err)
                if not ok then error(failure) end
            end)
        end
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
