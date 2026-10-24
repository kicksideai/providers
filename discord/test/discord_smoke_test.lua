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
    test.describe("kickside.discord packaging", function()
        test.it("registers kickside.discord.source:messages_source with schema and connection authority", function()
            local binding = get("kickside.discord.source:messages_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.discord.source:pull_messages")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.discord.source:channel_messages")
            test.eq(value(port, "binding"), "kickside.discord.source:messages_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.discord.source:pull_keys")
        end)
        test.it("loads CH's channel writable with declared delivery", function()
            local binding = get("kickside.channel.sink:channel_sink")
            local m = meta(binding)
            test.eq(m.delivery, "at_most_once")
            test.eq(m.input_shape, "content")
            local contracts: any = value(binding, "contracts")
        end)
        test.it("publishes a connection + reply_provider binding", function()
            local binding = get("kickside.discord.connection:discord_connection")
            local m = meta(binding)
            test.eq(m.provider, "discord")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "bot_token")
            test.eq(m.credential_schema.fields[1].type, "password")

            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local has_connection = false
            local has_reply = false
            for _, c in ipairs(contracts) do
                if c.contract == "kickside.connection:connection" then has_connection = true end
                if c.contract == "kickside.connection:reply_provider" then
                    has_reply = true
                    test.eq(type(c.methods.send_reply), "string")
                    test.eq(type(c.methods.update_reply), "string")
                    test.eq(type(c.methods.send_status), "string")
                end
            end
            test.eq(has_connection, true)
            test.eq(has_reply, true)
        end)

        test.it("publishes the inbound adapter", function()
            get("kickside.discord.inbound:receive_message")
            get("kickside.discord.inbound:normalize_message")
        end)

        test.it("publishes the polled channel-messages source with reconcile support", function()
            local binding = get("kickside.discord.source:messages_source")
            local m = meta(binding)
            test.eq(m.provider, "discord")
            test.eq(m.title, "Discord Messages")

            local port = get("kickside.discord.source:channel_messages")
            test.eq(meta(port).type, "kickside.automation.port")
            test.eq(meta(port).title, "Discord Messages")
            test.eq(value(port, "binding"), "kickside.discord.source:messages_source")
            test.eq(value(port, "reconcile").pull_keys, "kickside.discord.source:pull_keys")
            test.eq(value(port, "config_schema").connection_id.picker, "kickside-connection-trait-picker")
            test.eq(value(port, "config_schema").channel_id.required, true)
            test.not_nil(value(port, "output_schema"))

            local contracts: any = value(binding, "contracts")
            test.eq(contracts[1].contract, "kickside.data:pullable")
            test.eq(contracts[1].methods.pull, "kickside.discord.source:pull_messages")
            get("kickside.discord.source:pull_keys")
        end)

        test.it("publishes the channel-message sink with upsert + dest_ref-keyed delete", function()
            local binding = get("kickside.discord.sink:message_sink")
            local m = meta(binding)
            test.eq(m.provider, "discord")
            test.eq(m.title, "Send Discord Message")
            test.eq(m.delivery, "at_most_once")
            test.eq(m.input_shape, "content")

            local port = get("kickside.discord.sink:channel_message")
            test.eq(meta(port).type, "kickside.automation.port")
            test.eq(meta(port).title, "Send Discord Message")
            test.eq(value(port, "binding"), "kickside.discord.sink:message_sink")
            test.not_nil(value(port, "operations").upsert)
            test.eq(value(port, "operations").delete.requires_dest_ref, true)
            test.not_nil(value(port, "input_schema"))
            test.eq(value(port, "config_schema").connection_id.picker, "kickside-connection-trait-picker")

            local contracts: any = value(binding, "contracts")
            test.eq(contracts[1].contract, "kickside.data:writable")
            test.eq(contracts[1].methods.write, "kickside.discord.sink:message_write")
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
                { "dm", "kickside/dm" },
                { "channel", "kickside/channel" },
            }) do
                local dep = get("kickside.discord:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)

        test.it("observes committed connection lifecycle changes through a durable projection", function()
            local binding = get("kickside.discord.connection:discord_connection")
            local projections = meta(binding).projections
            test.not_nil(projections, "Discord has no connection lifecycle observer")
            test.eq(#projections, 1)
            test.eq(projections[1].on, "lifecycle")
            test.eq(projections[1].worker_ref, "func://kickside.discord.gateway:lifecycle_reconcile")
            test.eq(#projections[1].events.input, 3)
            test.eq(meta(get("kickside.discord.gateway:lifecycle_reconcile")).type, "projection.worker")
        end)

        test.it("binds service startup to the host database without a provider default", function()
            local requirement = get("kickside.discord.gateway:target_db")
            test.is_nil(value(requirement, "default"))
            local targets = value(requirement, "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.discord.gateway:gateway.service")
            test.eq(targets[1].path, ".lifecycle.depends_on +=")
        end)

        test.it("waits for the configured application database", function()
            local lifecycle = value(get("kickside.discord.gateway:gateway.service"), "lifecycle") or {}
            test.eq(#lifecycle.depends_on, 2)
            test.eq(lifecycle.depends_on[1], "wippy.bootloader:bootloader.service")
            test.eq(lifecycle.depends_on[2], "app:db")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
