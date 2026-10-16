local test = require("test")
local json = require("json")
local protocol = require("protocol")
local client = require("client")
local surface = require("surface")
local reconnect = require("reconnect")
local registry = require("registry")
local process = require("process")
local invoke_tool = require("invoke_tool")
local mcp_connection = require("mcp_connection")
local base = require("base")
local broker = require("broker")

local SUPERVISOR = "kickside.mcp_client:supervisor.service"

local function response(id: number, result: any, headers: any?): any
    return {
        status_code = 200,
        headers = headers or {},
        body = json.encode({ jsonrpc = "2.0", id = id, result = result }),
    }
end

local function fake(sequence: { any }): any
    local index = 0
    return {
        request = function(method: string, _url: string, options: any): (any?, string?)
            index = index + 1
            local next_value = sequence[index]
            if type(next_value) == "function" then return next_value(method, options) end
            return next_value, nil
        end,
        count = function(): number return index end,
    }
end

local function run()
    test.describe("kickside MCP client", function()
        test.it("lists compact tools, pages them, and returns explicitly requested schemas", function()
            local old_id, old_request = base.component_id, broker.request
            base.component_id = function() return "connection-1" end
            broker.request = function(_, _, args)
                if args.cursor == "page-2" then return {tools = {{name = "b", title = "Beta", outputSchema = {type = "object"}}}} end
                return {tools = {{name = "a", title = "Alpha", description = "Full description", inputSchema = {type = "object"}}}, next_cursor = "page-2"}
            end
            local first: any, err = mcp_connection.list_tools({})
            local last: any = mcp_connection.list_tools({cursor = first and first.next_cursor, fields = {"outputSchema"}})
            local full: any = mcp_connection.list_tools({fields = {"*"}})
            local discovery: any = mcp_connection.discover_resources({cursor = "page-2"})
            base.component_id, broker.request = old_id, old_request
            test.is_nil(err)
            test.eq(first.tools[1].name, "a")
            test.is_nil(first.tools[1].description)
            test.is_nil(first.tools[1].inputSchema)
            test.eq(first.next_cursor, "page-2")
            test.eq(last.tools[1].name, "b")
            test.eq(last.tools[1].outputSchema.type, "object")
            test.is_nil(last.next_cursor)
            test.eq(full.tools[1].inputSchema.type, "object")
            test.eq(discovery.resources[1].id, "b")
            test.is_nil(discovery.resources[1].description)
        end)

        test.it("starts the unprivileged local MCP supervisor", function()
            local sent, send_err = process.send(SUPERVISOR, "health_probe", { probe=true })
            test.is_nil(send_err)
            test.is_true(sent)
        end)

        test.it("registers the supervisor under its entry id for callers on any node", function()
            local pid, err = process.registry.lookup(SUPERVISOR, process.registry.CONSISTENT)
            test.is_nil(err)
            test.not_nil(pid)
        end)

        test.it("declares sortable names for every view component", function()
            for _, id in ipairs({ "kickside.mcp_client:connect_view", "kickside.mcp_client:picker_view" }) do
                local entry, err = registry.get(id)
                test.is_nil(err)
                test.not_nil(entry)
                test.eq(entry.meta.type, "view.component")
                test.is_true(type(entry.meta.name) == "string" and entry.meta.name ~= "")
            end
        end)

        test.it("fails client calls with typed errors", function()
            local _, config_err = client.validate_config({ endpoint_url = "ftp://example.test" })
            test.is_true(errors.is(config_err, errors.INVALID))

            client._set_http_client_for_test(fake({ { status_code = 500, headers = {}, body = "" } }))
            local session, http_err = client.new({ endpoint_url = "https://example.test/mcp" })
            client._set_http_client_for_test(nil)
            test.is_nil(session)
            test.is_true(errors.is(http_err, errors.UNAVAILABLE))
            test.eq(http_err:details().status_code, 500)

            local _, rpc_err = protocol.unwrap({ jsonrpc = "2.0", id = 3, error = { code = -32601, message = "method not found" } }, 3)
            test.is_true(errors.is(rpc_err, errors.UNAVAILABLE))
            test.eq(rpc_err:details().rpc_code, -32601)
            local _, empty_err = protocol.decode_body("")
            test.is_true(errors.is(empty_err, errors.UNAVAILABLE))
        end)

        test.it("forwards the typed component error from base operations", function()
            for _, method in ipairs({ "get_status", "delete" }) do
                local result, err = (mcp_connection :: any)[method]({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
            end
        end)

        test.it("decodes JSON and Streamable HTTP SSE responses", function()
            local direct = protocol.decode_body(json.encode({ jsonrpc = "2.0", id = 1, result = { ok = true } }))
            test.is_true(direct.result.ok)
            local sse = protocol.decode_body("event: message\ndata: {\"jsonrpc\":\"2.0\",\"id\":2,\"result\":{\"ok\":true}}\n\n")
            test.eq(sse.id, 2)
            test.is_true(sse.result.ok)
        end)

        test.it("uses an isolated MCP session for tool discovery", function()
            local seen_session = false
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }, { ["mcp-session-id"] = "session-a" }),
                { status_code = 202, headers = {}, body = "" },
                function(_method: string, options: any): (any?, string?)
                    seen_session = options.headers["Mcp-Session-Id"] == "session-a"
                    return response(2, { tools = { { name = "echo", inputSchema = { type = "object" } } } }), nil
                end,
                { status_code = 204, headers = {}, body = "" },
            })
            client._set_http_client_for_test(transport)
            local session, session_err = client.new({ endpoint_url = "https://example.test/mcp", bearer_token = "secret" })
            test.is_nil(session_err)
            local tools, err = client.list_tools(session)
            test.is_nil(err)
            test.eq(#tools.tools, 1)
            test.is_true(seen_session)
            client.close(session)
            test.eq(transport.count(), 4)
            client._set_http_client_for_test(nil)
        end)

        test.it("builds stable collision-free tools without serializing credentials", function()
            local generated, err = surface.build("component-user-a", {
                { name = "read-file", description = "Read", inputSchema = { type = "object", properties = { path = { type = "string" } } } },
                { name = "read_file", description = "Read another", inputSchema = { type = "object" } },
                { name = "ignored", inputSchema = { type = "object" } },
            }, { selected_tools = { "read-file", "read_file" }, tool_prefix = "remote" })
            test.is_nil(err)
            test.eq(#generated, 2)
            test.eq(generated[1].alias, "remote_read_file")
            test.eq(generated[2].alias, "remote_read_file_2")
            test.eq(generated[1].context.connection_id, "component-user-a")
            test.eq(generated[1].context.remote_tool_name, "read-file")
            test.is_nil(generated[1].context.bearer_token)
            test.eq(generated[1].schema.properties.path.type, "string")
        end)

        test.it("paginates complete tool catalogs", function()
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { tools = { { name = "one" } }, nextCursor = "page-2" }),
                function(_method: string, options: any): (any?, string?)
                    local payload = json.decode(options.body :: string)
                    test.eq(payload.params.cursor, "page-2")
                    return response(3, { tools = { { name = "two" } } }), nil
                end,
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local tools, err = client.list_tools(session)
            test.is_nil(err)
            test.eq(#tools.tools, 1)
            test.eq(tools.next_cursor, "page-2")
            local last, last_err = client.list_tools(session, tools.next_cursor)
            test.is_nil(last_err)
            test.eq(last.tools[1].name, "two")
            test.is_nil(last.next_cursor)
            client._set_http_client_for_test(nil)
        end)

        test.it("rejects a repeated catalog cursor without another request", function()
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { tools = { { name = "one" } }, nextCursor = "again" }),
                response(3, { tools = { { name = "two" } }, nextCursor = "again" }),
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local first, first_err = client.list_tools(session)
            test.is_nil(first_err)
            local tools, err = client.list_tools(session, first.next_cursor)
            test.is_nil(tools)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(err:message(), "repeated")
            test.eq(transport.count(), 4)
            client._set_http_client_for_test(nil)
        end)

        test.it("returns native catalog pages without aggregating their content", function()
            local huge = string.rep("x", 140000)
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { tools = { { name = "one", description = huge } }, nextCursor = "page-2" }),
                response(3, { tools = { { name = "two", description = huge } }, nextCursor = "page-3" }),
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local tools, err = client.list_tools(session)
            test.is_nil(err)
            test.eq(tools.tools[1].description, huge)
            test.eq(tools.next_cursor, "page-2")
            test.eq(transport.count(), 3)
            local second, second_err = client.list_tools(session, tools.next_cursor)
            test.is_nil(second_err)
            test.eq(second.tools[1].description, huge)
            test.eq(second.next_cursor, "page-3")
            client._set_http_client_for_test(nil)
        end)

        test.it("reinitializes once when a server expires its session", function()
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }, { ["Mcp-Session-Id"] = "old" }),
                { status_code = 202, headers = {}, body = "" },
                { status_code = 404, headers = {}, body = "" },
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }, { ["Mcp-Session-Id"] = "new" }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { content = { { type = "text", text = "ok" } } }),
                { status_code = 204, headers = {}, body = "" },
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local result, err = client.call_tool(session, "echo", { value = "x" })
            test.is_nil(err)
            test.eq(result.content[1].text, "ok")
            test.eq(session.session_id, "new")
            client.close(session)
            client._set_http_client_for_test(nil)
        end)

        test.it("rejects non-http endpoints", function()
            local cfg, err = client.validate_config({ endpoint_url = "stdio://server" })
            test.is_nil(cfg)
            test.not_nil(err)
        end)

        test.it("validates supported auth modes and blocks transport header overrides", function()
            local bearer, berr = client.validate_config({ endpoint_url = "https://example.test/mcp", auth_type = "bearer", bearer_token = "token" })
            test.is_nil(berr)
            test.eq(bearer.auth_type, "bearer")
            local keyed, kerr = client.validate_config({ endpoint_url = "https://example.test/mcp", auth_type = "header", header_name = "X-API-Key", header_value = "secret" })
            test.is_nil(kerr)
            test.eq(keyed.header_name, "X-API-Key")
            local blocked, blocked_err = client.validate_config({ endpoint_url = "https://example.test/mcp", auth_type = "header", header_name = "Mcp-Session-Id", header_value = "evil" })
            test.is_nil(blocked)
            test.not_nil(blocked_err)
        end)

        test.it("allows an explicit empty tool allow-list", function()
            local generated, err = surface.build("component-a", { { name = "danger", inputSchema = { type = "object" } } }, { selected_tools = {}, tool_prefix = "mcp" })
            test.is_nil(err)
            test.eq(#generated, 0)
        end)

        test.it("reconnect returns the connection catalog count across all pages", function()
            local old_id, old_request = base.component_id, broker.request
            base.component_id = function() return "component-a" end
            broker.request = function(id, operation, args)
                test.eq(id, "component-a")
                test.eq(operation, "list_tools")
                if args.cursor == "page-2" then return {tools = {{name = "last"}}} end
                return {tools = {{name = "first"}}, next_cursor = "page-2"}
            end
            local result, err = reconnect.reconnect_connection(
                {set_meta = function() return true end},
                {test_connection = function() return mcp_connection.test_connection({}) end},
                {update = function() return {success = true} end},
                "component-a", {}, {endpoint_url = "https://example.test/mcp"}, nil)
            base.component_id, broker.request = old_id, old_request
            test.is_nil(err)
            test.eq(result.details.tool_count, 2)
        end)

        test.it("does not claim restoration when a failed probe rollback also fails", function()
            local writes = 0
            local service = {
                update = function(_self: any, request: any): (any?, string?)
                    writes = writes + 1
                    test.eq(request.component_id, "component-a")
                    if writes == 1 then return { success = true }, nil end
                    return nil, "storage unavailable"
                end,
            }
            local tools, err, status = reconnect.reconnect_connection(
                { set_meta = function(): (boolean, string?) return true, nil end },
                { test_connection = function(): (any?, string?) return nil, "unauthorized" end },
                service,
                "component-a",
                { endpoint_url = "https://old.example/mcp" },
                { endpoint_url = "https://new.example/mcp" },
                nil
            )
            test.is_nil(tools)
            test.eq(status, 500)
            test.is_true(string.find(err, "could not be restored", 1, true) ~= nil)
            test.is_true(string.find(err, "storage unavailable", 1, true) ~= nil)
            test.is_true(string.find(err, "unauthorized", 1, true) ~= nil)
            test.eq(writes, 2)
        end)

        test.it("restores credentials and fails when the connection title cannot be updated", function()
            local contexts: { any } = {}
            local service = {
                update = function(_self: any, request: any): (any?, string?)
                    contexts[#contexts + 1] = request.commands[1].payload.private_context
                    return { success = true }, nil
                end,
            }
            local tools, err, status = reconnect.reconnect_connection(
                { set_meta = function(): (boolean, string?) return false, "metadata store unavailable" end },
                { test_connection = function(): (any?, string?) return {success = true, details = {tool_count = 1}}, nil end },
                service,
                "component-a",
                { endpoint_url = "https://old.example/mcp" },
                { endpoint_url = "https://new.example/mcp" },
                "Renamed connection"
            )
            test.is_nil(tools)
            test.eq(status, 500)
            test.is_true(string.find(err, "previous connection was restored", 1, true) ~= nil)
            test.is_true(string.find(err, "metadata store unavailable", 1, true) ~= nil)
            test.eq(#contexts, 2)
            local first = contexts[1] or {}
            local second = contexts[2] or {}
            test.eq(first.endpoint_url, "https://new.example/mcp")
            test.eq(second.endpoint_url, "https://old.example/mcp")
        end)
        test.it("encodes tools/call arguments as an object even with no arguments", function()
            local seen_body = nil
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                function(_method: string, options: any): (any?, string?)
                    seen_body = options.body
                    return response(2, { content = { { type = "text", text = "ok" } } }), nil
                end,
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local result, err = client.call_tool(session, "noop", {})
            test.is_nil(err)
            test.not_nil(result)
            test.is_true(string.find(tostring(seen_body), "\"arguments\":{}", 1, true) ~= nil)
            local array_arguments = string.find(tostring(seen_body), "\"arguments\":[]", 1, true)
            test.is_nil(array_arguments)
            client._set_http_client_for_test(nil)
        end)

        test.it("does not cap tool catalogs at a fixed tool count", function()
            local many_tools: { any } = {}
            for i = 1, 80 do many_tools[i] = { name = "tool_" .. i, inputSchema = { type = "object" } } end
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { tools = many_tools }),
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local tools, err = client.list_tools(session)
            test.is_nil(err)
            test.eq(#tools.tools, 80)
            client._set_http_client_for_test(nil)
        end)

        test.it("decodes an SSE data line beyond 64 KiB without truncation", function()
            local big = string.rep("x", 140000)
            local payload = json.encode({ jsonrpc = "2.0", id = 9, result = { blob = big } })
            local sse = "event: message\ndata: " .. tostring(payload) .. "\n\n"
            local decoded, err = protocol.decode_body(sse)
            test.is_nil(err)
            test.not_nil(decoded)
            test.eq(decoded.id, 9)
            test.eq(#decoded.result.blob, 140000)
        end)

        test.it("preserves an oversized text result without a local continuation", function()
            local big_text = string.rep("y", 1200000)
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { content = { { type = "text", text = big_text } } }),
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local result, err = client.call_tool(session, "dump", {})
            test.is_nil(err)
            test.not_nil(result)
            test.eq(#result.content[1].text, #big_text)
            test.eq(result.content[1].text:sub(-32), big_text:sub(-32))
            local encoded = json.encode(result)
            test.is_true(#tostring(encoded) > 1024 * 1024)
            client._set_http_client_for_test(nil)
        end)

        test.it("preserves an oversized non-text result without a local continuation", function()
            local big_blob = string.rep("z", 1200000)
            local transport = fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { content = { { type = "image", data = big_blob, mimeType = "image/png" } } }),
            })
            client._set_http_client_for_test(transport)
            local session = client.new({ endpoint_url = "https://example.test/mcp" })
            local result, err = client.call_tool(session, "dump", {})
            test.is_nil(err)
            test.eq(result.content[1].data, big_blob)
            client._set_http_client_for_test(nil)
        end)

        test.it("preserves large tool detail inside one native catalog page", function()
            client._set_http_client_for_test(fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { tools = { { name = "huge", description = string.rep("x", 270000) } } }),
            }))
            local session, init_err = client.new({ endpoint_url = "https://example.test/mcp" })
            test.is_nil(init_err)
            local tools, err = client.list_tools(session)
            client._set_http_client_for_test(nil)
            test.is_nil(err)
            test.eq(tools.tools[1].description, string.rep("x", 270000))
        end)

        test.it("preserves mixed oversized content without a local continuation", function()
            client._set_http_client_for_test(fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { content = {
                    { type = "text", text = "receipt" },
                    { type = "image", data = string.rep("x", 1200000), mimeType = "image/png" },
                } }),
            }))
            local session, init_err = client.new({ endpoint_url = "https://example.test/mcp" })
            test.is_nil(init_err)
            local result, err = client.call_tool(session, "mixed", {})
            client._set_http_client_for_test(nil)
            test.is_nil(err)
            test.eq(result.content[1].text, "receipt")
            test.eq(#result.content[2].data, 1200000)
        end)

        test.it("preserves a remote MCP error result across the component call boundary", function()
            client._set_http_client_for_test(fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { isError = true, content = { { type = "text", text = "Northwind packing station is unavailable" } } }),
            }))
            local session, init_err = client.new({ endpoint_url = "https://example.test/mcp" })
            test.is_nil(init_err)
            local result, err = client.call_tool(session, "packing", {})
            client._set_http_client_for_test(nil)
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "Northwind packing station is unavailable")
            test.is_true(result.isError)
            test.contains(result.content[1].text, "packing station")
        end)

        test.it("fails test_connection and discover_resources with the typed component error", function()
            for _, method in ipairs({ "test_connection", "discover_resources" }) do
                local result, err = (mcp_connection :: any)[method]({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
            end
        end)

        test.it("invoke_tool preserves the published connection failure return", function()
            local failure = errors.new({ kind = errors.NOT_FOUND, message = "component not found" })
            local result, err = invoke_tool.invoke("conn-1", "remote_tool", {}, function(_id: string, _access: integer, _contract: string?): (any?, any?) return nil, failure end)
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("invoke_tool fails an unbound tool instance with a typed error", function()
            local open = function(_id: string, _access: integer, _contract: string?): (any?, any?) return nil, nil end
            local _, no_connection = invoke_tool.invoke("", "remote_tool", {}, open)
            local _, no_name = invoke_tool.invoke("conn-1", "", {}, open)
            test.is_true(errors.is(no_connection, errors.INTERNAL))
            test.is_true(errors.is(no_name, errors.INTERNAL))
        end)

        test.it("invoke_tool preserves the published failed call return", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "MCP HTTP 500", details = { status_code = 500 } })
            local fake_instance = { call_tool = function(): (any?, error?) return nil, failure end }
            local result, err = invoke_tool.invoke("conn-1", "remote_tool", {}, function(_id: string, _access: integer, _contract: string?): (any?, any?) return fake_instance, nil end)
            test.is_nil(result)
            test.eq(err, failure)
        end)

        test.it("invoke_tool passes a remote tool's domain error through as its result", function()
            local outcome = { success = false, isError = true, error = "station closed",
                content = { { type = "text", text = "station closed" } } }
            local instance = { call_tool = function(): (any?, error?) return outcome, nil end }
            local result, err = invoke_tool.invoke("conn-1", "remote_tool", {}, function() return instance, nil end)
            test.is_nil(err)
            test.eq(result, outcome)
        end)

        test.it("invoke_tool passes a successful remote result through unchanged", function()
            local fake_instance = { call_tool = function(): (any?, string?) return { content = { { type = "text", text = "ok" } } }, nil end }
            local result, err = invoke_tool.invoke("conn-1", "remote_tool", {}, function(_id: string, _access: integer, _contract: string?): (any?, any?) return fake_instance, nil end)
            test.is_nil(err)
            test.is_nil(result.isError)
            test.eq(result.content[1].text, "ok")
        end)
        test.it("preserves escaped multibyte text without a local continuation", function()
            local big_text = string.rep('☃\n"\\', 240000)
            client._set_http_client_for_test(fake({
                response(1, { protocolVersion = protocol.DEFAULT_VERSION, capabilities = {} }),
                { status_code = 202, headers = {}, body = "" },
                response(2, { content = { { type = "text", text = big_text }, { type = "text", text = "receipt" } } }),
            }))
            local session, init_err = client.new({ endpoint_url = "https://example.test/mcp" })
            test.is_nil(init_err)
            local result, err = client.call_tool(session, "escaped", {})
            client._set_http_client_for_test(nil)
            test.is_nil(err)
            test.eq(#result.content[1].text, #big_text)
            test.eq(result.content[1].text:sub(-32), big_text:sub(-32))
            local encoded, encode_err = json.encode(result)
            test.is_nil(encode_err)
            test.is_true(#encoded > 1024 * 1024)
            local decoded, decode_err = json.decode(encoded)
            test.is_nil(decode_err)
            test.eq(decoded.content[1].text, result.content[1].text)
            test.eq(result.content[2].type, "text")
        end)

        test.it("invoke_tool fails with only the typed error when the transport also returns data", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "MCP reply is incomplete" })
            local instance = { call_tool = function(): (any?, error?) return { content = {} }, failure end }
            local result, err = invoke_tool.invoke("conn-1", "remote_tool", {}, function() return instance, nil end)
            test.is_nil(result)
            test.eq(err, failure)
        end)

    end)
end

local run_cases = test.run_cases(run)
return { run = function(options: any): any return run_cases(options) end }
