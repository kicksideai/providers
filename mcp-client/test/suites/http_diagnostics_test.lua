local test = require("test")
local json = require("json")
local client = require("client")
local protocol = require("protocol")

local function call(result: any): (any?, any?)
    client._set_http_client_for_test({ request = function(_, _, options)
        local request = json.decode(options.body)
        if request.method == "notifications/initialized" then return { status_code = 202, body = "" } end
        return { status_code = 200, body = json.encode({ jsonrpc = "2.0", id = request.id,
            result = request.method == "initialize" and { protocolVersion = protocol.DEFAULT_VERSION } or result }) }
    end })
    local session, err = client.new({ endpoint_url = "https://example.test/mcp" })
    if err then client._set_http_client_for_test(nil) return nil, err end
    local value, failure = client.call_tool(session, "dispatch", {})
    client._set_http_client_for_test(nil)
    return value, failure
end

return { run = test.run_cases(function()
    test.describe("Remote MCP tool diagnostics", function()
        test.it("returns a remote tool error as a domain outcome carrying its content", function()
            local diagnostic = "Packing station is unavailable"
            local guidance = "Use session_info and find_traits to discover and activate tools."
            local result, err = call({ isError = true, content = {
                { type = "text", text = diagnostic }, { type = "text", text = guidance },
            } })
            test.is_nil(err)
            test.is_false(result.success)
            test.is_true(result.isError)
            test.eq(result.error, diagnostic .. "\n" .. guidance)
            test.eq(result.content[1].text, diagnostic)
            test.eq(result.content[2].text, guidance)
        end)
        test.it("returns structured diagnostics when no text block is present", function()
            local result, err = call({ isError = true, content = {}, structuredContent = { reason = "dispatch closed" } })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.structuredContent.reason, "dispatch closed")
            test.eq(result.error, "remote MCP tool returned an error")
        end)
        test.it("returns the default diagnosis for an empty remote error", function()
            local result, err = call({ isError = true, content = {} })
            test.is_nil(err)
            test.is_false(result.success)
            test.eq(result.error, "remote MCP tool returned an error")
        end)
    end)
end) }
