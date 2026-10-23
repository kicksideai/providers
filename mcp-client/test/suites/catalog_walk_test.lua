local test = require("test")
local json = require("json")
local client = require("client")
local connection = require("connection")
local base = require("base")
local broker = require("broker")
local builder = require("builder")
local component = require("component")
local catalog = require("catalog")
local time = require("time")
local registry = require("registry")
local function define()
    test.describe("MCP complete catalog discovery", function()
        test.it("stops an A-B-A cursor cycle before requesting another page", function()
            local calls = 0
            client._set_http_client_for_test({request = function(_, _, options)
                local payload = json.decode(options.body)
                if payload.method == "notifications/initialized" then
                    return {status_code = 202, headers = {}, body = ""}
                end
                local result
                if payload.method == "initialize" then
                    result = {protocolVersion = "2025-11-25", capabilities = {}}
                else
                    calls = calls + 1
                    if calls > 4 then
                        return nil, "bounded review probe stopped the cycling server"
                    end
                    result = {tools = {}, nextCursor = payload.params.cursor == "a" and "b" or "a"}
                end
                return {status_code = 200, headers = {}, body = json.encode({jsonrpc = "2.0", id = payload.id, result = result})}
            end})
            local session = assert(client.new({endpoint_url = "https://fixture.example/mcp"}))
            local old_id, old_request = base.component_id, broker.request
            base.component_id = function() return "cycle-probe" end
            broker.request = function(_, _, args) return client.list_tools(session, args.cursor) end
            local ok, result, err = pcall(connection.test_connection, {})
            base.component_id, broker.request = old_id, old_request
            client._set_http_client_for_test(nil)
            test.is_true(ok, tostring(result))
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code,"MCP_CURSOR_CYCLE")
            test.eq(calls, 3, "a cursor cycle must stop at A-B-A; the probe caps requests to prevent a hang")
        end)
        test.it("fails trait construction on a cursor cycle without exposing partial tools", function()
            local calls=0
            local original=component.open
            component.open=function()
                return {list_tools=function(_, args)
                    calls=calls+1
                    if calls>4 then return nil,errors.new({kind=errors.INTERNAL,message="bounded fixture stop"}) end
                    return {tools={{name="echo",inputSchema={type="object"}}},next_cursor=args.cursor=="a" and "b" or "a"},nil
                end},nil
            end
            local ok, result=pcall(builder.execute,"Prompt",{connection_id="cycle-fixture"})
            component.open=original
            test.is_true(ok,tostring(result)); test.is_nil(result.tools)
            test.contains(result.prompt,"repeated a catalog cursor"); test.eq(calls,3)
        end)
        test.it("retains valid large catalogs and isolates cursor history to each walk", function()
            for _=1,2 do
                local count=0
                local err=catalog.each_page(function(cursor)
                    local page=cursor and tonumber(cursor) or 1
                    return {tools={{name="tool_" .. page}},next_cursor=page<300 and tostring(page+1) or nil},nil
                end,function(page) count=count+#page.tools end)
                test.is_nil(err,tostring(err)); test.eq(count,300)
            end
        end)
        test.it("enforces a total discovery deadline even if cursors keep changing", function()
            local calls=0
            local err=catalog.each_page(function()
                calls=calls+1
                return {tools={},next_cursor=tostring(calls)},nil
            end,function() end,time.now():add(-time.SECOND))
            test.is_true(errors.is(err,errors.TIMEOUT),tostring(err)); test.eq(calls,0)
        end)
        test.it("preserves typed transport failures", function()
            local failure=errors.new({kind=errors.UNAVAILABLE,message="server unavailable",retryable=true})
            local err=catalog.each_page(function() return nil,failure end,function() error("no partial page") end)
            test.eq(err,failure)
        end)
        test.it("does not import another module's OAuth persistence repository", function()
            local entry=assert(registry.get("kickside.mcp_client.oauth:config"))
            local imports=entry.data.imports or {}
            test.is_nil(imports.oauth_read_repo)
            for _, id in pairs(imports) do test.is_nil((tostring(id):find("kickside.oauth.persist:",1,true))) end
        end)
    end)
end
return {run = test.run_cases(define)}
