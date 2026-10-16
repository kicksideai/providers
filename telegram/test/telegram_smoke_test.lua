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
    test.describe("kickside.telegram packaging", function()
        test.it("publishes a connection + reply_provider binding", function()
            local binding = get("kickside.telegram.connection:telegram_connection")
            local m = meta(binding)
            test.eq(m.provider, "telegram")
            test.not_nil(m.credential_schema)

            local keys = field_keys(m.credential_schema)
            test.eq(keys["bot_token"], "password")
            test.eq(keys["default_chat_id"], "text")
            test.eq(m.reply.max_length, 4096)

            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local has_connection = false
            local has_reply = false
            for _, c in ipairs(contracts) do
                if c.contract == "kickside.connection:connection" then has_connection = true end
                if c.contract == "kickside.connection:reply_provider" then has_reply = true end
            end
            test.eq(has_connection, true)
            test.eq(has_reply, true)
        end)

        test.it("declares a content writable port and requires references for delete", function()
            local binding = get("kickside.telegram.sink:message_sink")
            test.eq(meta(binding).delivery, "at_most_once")
            test.eq(meta(binding).input_shape, "content")
            local contracts = value(binding, "contracts")
            test.eq(contracts[1].contract, "kickside.data:writable")
            test.eq(contracts[1].methods.write, "kickside.telegram.sink:message_write")
            local port = get("kickside.telegram.sink:chat_message")
            test.eq(value(port, "binding"), "kickside.telegram.sink:message_sink")
            test.is_true(value(port, "operations").delete.requires_dest_ref)
        end)

        test.it("publishes the inbound adapter", function()
            get("kickside.telegram.inbound:receive_message")
            get("kickside.telegram.inbound:receive_channel_message")
            get("kickside.telegram.inbound:normalize_message")
            local fetcher = get("kickside.telegram.inbound:attachment_fetcher")
            test.eq(meta(fetcher).type, "attachment.fetcher")
            test.eq(value(fetcher, "provider"), "telegram")
            test.eq(value(fetcher, "fetch_func"), "kickside.telegram.inbound:fetch_attachment")
        end)

        test.it("publishes the agent traits", function()
            get("kickside.telegram.traits:telegram_reader")
            get("kickside.telegram.traits:telegram_operator")
            get("kickside.telegram.traits:telegram_manager")
        end)

        test.it("publishes the supervised polling service", function()
            get("kickside.telegram.polling:polling.service")
            get("kickside.telegram.polling:worker")
            get("kickside.telegram.polling:dm_dispatch_proc")
            get("kickside.telegram.polling:channel_dispatch_proc")
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection" },
                { "contract", "kickside/contract" },
                { "dm", "kickside/dm" },
                { "channel", "kickside/channel" },
            }) do
                local dep = get("kickside.telegram:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)

        test.it("binds polling startup to the host database without a provider default", function()
            local requirement = get("kickside.telegram.polling:target_db")
            test.is_nil(value(requirement, "default"))
            local targets = value(requirement, "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.telegram.polling:polling.service")
            test.eq(targets[1].path, ".lifecycle.depends_on +=")
        end)

        test.it("waits for the configured application database", function()
            local lifecycle = value(get("kickside.telegram.polling:polling.service"), "lifecycle") or {}
            test.eq(#lifecycle.depends_on, 2)
            test.eq(lifecycle.depends_on[1], "wippy.bootloader:bootloader.service")
            test.eq(lifecycle.depends_on[2], "app:db")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
