local test = require("test")
local registry = require("registry")

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function define_tests()
    test.describe("kickside.fireflies packaging", function()
        test.it("registers kickside.fireflies.source:transcripts_source with schema and connection authority", function()
            local binding = get("kickside.fireflies.source:transcripts_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.fireflies.source:pull_transcripts")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.fireflies.source:transcripts")
            test.eq(value(port, "binding"), "kickside.fireflies.source:transcripts_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.fireflies.source:pull_keys")
        end)
        test.it("registers kickside.fireflies.source:meetings_source with schema and connection authority", function()
            local binding = get("kickside.fireflies.source:meetings_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.fireflies.source:pull_meetings")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.fireflies.source:meetings")
            test.eq(value(port, "binding"), "kickside.fireflies.source:meetings_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.fireflies.source:pull_keys")
        end)
        test.it("declares title-only record write delivery and connection authority", function()
            local binding = get("kickside.fireflies.writer:record_writer")
            test.eq(meta(binding).delivery, "at_most_once")
            test.eq(meta(binding).input_shape, "record")
            local contracts: any = value(binding, "contracts")
            test.is_nil(contracts[1].context_required,
                "record_writers.open resolves the caller's accessible connection after opening")
            test.eq(contracts[1].methods.update_record, "kickside.fireflies.writer:update_record")
        end)
        test.it("publishes a schema-declared credential connection binding", function()
            local binding = get("kickside.fireflies.connection:fireflies_connection")
            local m = meta(binding)
            test.eq(m.provider, "fireflies")
            test.eq(m.group, "Meetings")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "api_key")
            test.eq(m.credential_schema.fields[1].type, "password")
        end)

        test.it("binds the connection + deletable contracts", function()
            local contracts = value(get("kickside.fireflies.connection:fireflies_connection"), "contracts")
            test.not_nil(contracts, "binding has no contracts")
            local seen: { [string]: boolean } = {}
            for _, c in ipairs(contracts or {}) do seen[tostring((c :: any).contract)] = true end
            test.is_true(seen["kickside.connection:connection"], "missing connection contract")
            test.is_true(seen["kickside.contract:deletable"], "missing deletable contract")
        end)

        test.it("publishes the reader trait wired to the generic picker + tool", function()
            local trait = get("kickside.fireflies.traits:reader")
            local m = meta(trait)
            test.eq(m.type, "agent.trait")
            test.eq(m.provider, "fireflies")
            test.eq(m.web_component, "kickside-connection-trait-picker")
            local tools = value(trait, "tools")
            test.not_nil(tools, "trait has no tools")
            test.eq(tools[1], "kickside.fireflies.traits:get_tool")
        end)

        test.it("publishes the FirefliesRead read tool", function()
            local m = meta(get("kickside.fireflies.traits:get_tool"))
            test.eq(m.type, "tool")
            test.eq(m.llm_alias, "FirefliesRead")
        end)

        -- The write-back seam is two entries and nothing else: a binding that
        -- implements the platform capability and an announcement saying which
        -- system it serves. A caller finds the second and opens the first, so an
        -- announcement that lost its binding, or a binding that stopped
        -- implementing the contract, is a writer nobody can reach.
        test.it("publishes the record writer and the announcement that finds it", function()
            local describe = get("kickside.fireflies.writer:describe")
            test.eq(value(describe, "method"), "describe")
            local update = get("kickside.fireflies.writer:update_record")
            test.eq(value(update, "method"), "update_record")

            local contracts = value(get("kickside.fireflies.writer:record_writer"), "contracts")
            test.not_nil(contracts, "the record writer binding has no contracts")
            local methods: any = nil
            for _, c in ipairs(contracts or {}) do
                if tostring((c :: any).contract) == "kickside.data.records:external_record_writer" then
                    methods = (c :: any).methods
                end
            end
            test.not_nil(methods, "the binding does not implement the write-back contract")
            test.eq(methods.describe, "kickside.fireflies.writer:describe")
            test.eq(methods.update_record, "kickside.fireflies.writer:update_record")

            local announcement = get("kickside.fireflies.writer:writer.fireflies")
            local m = meta(announcement)
            test.eq(m.type, "kickside.data.record_writer")
            test.eq(m.system, "fireflies")
            test.eq(value(announcement, "binding"), "kickside.fireflies.writer:record_writer")
        end)

        test.it("declares direct package dependencies in production", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
            }) do
                local dep = get("kickside.fireflies:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
