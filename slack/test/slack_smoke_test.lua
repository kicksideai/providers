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

local function field_keys(schema: any): any
    local keys: any = {}
    if type(schema) == "table" and type(schema.fields) == "table" then
        for _, f in ipairs(schema.fields) do keys[tostring(f.key)] = tostring(f.type) end
    end
    return keys
end

local function define_tests()
    test.describe("kickside.slack packaging", function()
        test.it("publishes a connection + reply_provider binding with a dual-token schema", function()
            local binding = get("kickside.slack.connection:slack_connection")
            local m = meta(binding)
            test.eq(m.provider, "slack")
            test.not_nil(m.credential_schema)

            local keys = field_keys(m.credential_schema)
            test.eq(keys["bot_token"], "password")
            test.eq(keys["app_token"], "password")

            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local has_connection = false
            local has_reply = false
            local has_channel_context = false
            for _, c in ipairs(contracts) do
                if c.contract == "kickside.connection:connection" then has_connection = true end
                if c.contract == "kickside.connection:reply_provider" then has_reply = true end
                if c.contract == "kickside.connection:channel_context" then has_channel_context = true end
            end
            test.eq(has_connection, true)
            test.eq(has_reply, true)
            test.eq(has_channel_context, false)
        end)

        test.it("publishes the inbound adapter", function()
            get("kickside.slack.inbound:receive_message")
            get("kickside.slack.inbound:receive_channel_message")
            get("kickside.slack.inbound:normalize_message")
        end)

        test.it("publishes the agent traits", function()
            get("kickside.slack.traits:slack_reader")
            get("kickside.slack.traits:slack_operator")
            get("kickside.slack.traits:slack_manager")
        end)

        test.it("publishes the supervised socket service", function()
            get("kickside.slack.socket:socket.service")
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
                { "dm", "kickside/dm" },
                { "channel", "kickside/channel" },
            }) do
                local dep = get("kickside.slack:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)

        test.it("binds service startup to the host database without a provider default", function()
            local requirement = get("kickside.slack.socket:target_db")
            test.is_nil(value(requirement, "default"))
            local targets = value(requirement, "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.slack.socket:socket.service")
            test.eq(targets[1].path, ".lifecycle.depends_on +=")
        end)

        test.it("waits for the configured application database", function()
            local lifecycle = value(get("kickside.slack.socket:socket.service"), "lifecycle") or {}
            test.eq(#lifecycle.depends_on, 2)
            test.eq(lifecycle.depends_on[1], "wippy.bootloader:bootloader.service")
            test.eq(lifecycle.depends_on[2], "app:db")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
