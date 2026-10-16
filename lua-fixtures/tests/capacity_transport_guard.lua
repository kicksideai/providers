local test = require("test")
local funcs = require("funcs")
local component = require("component")
local sql = require("sql")
local time = require("time")
local M = {}
local function conn(id)
    return {component_id = id, mode = "credential", header = "Bearer test", token = "test", bot_token = "test", api_key = "test",
        base_url = "https://fixture.test", authorization = "Bearer test", deployment = "cloud",
        get_access_token = function() return {success = true, access_token = "test"}, nil end,
        get_info = function() return {component_id = id}, nil end}
end

local function with_connections(body): any
    local service, service_err = component.get_service()
    test.is_nil(service_err)
    if not service then error(service_err) end
    local ids = {}
    local function create()
        local result, err = service:register({impl_id = "app:capacity_connection", meta = {class = "connection"}, private_context = {}})
        test.is_nil(err)
        test.is_true(result.success)
        ids[#ids + 1] = result.component_id
        return result.component_id
    end
    body(create)
    local db = assert(sql.get("app:db"))
    for _, id in ipairs(ids) do
        for _, name in ipairs({"kickside_component_access", "kickside_component_meta", "kickside_components"}) do
            test.is_nil(select(2, db:execute("DELETE FROM " .. name .. " WHERE component_id=$1", {id})))
        end
    end
    db:release()
    return true
end

function M.scope(namespace: string)
    for _, method in ipairs({"get_status", "delete"}) do
        local result, err = funcs.call(namespace .. ":" .. method, {})
        test.is_nil(result)
        test.is_true(errors.is(err, errors.INTERNAL))
        test.eq(err:message(), "component_id not in scope")
    end
end

function M.run(invoke, fixture): any
  return with_connections(function(create)
    fixture.calls = 0
    local shared, independent = create(), create()
    local began = time.now():unix_nano() // 1000000
    local first, first_err = invoke(conn(shared))
    test.is_nil(first_err)
    test.is_false(first.success)
    test.eq(first.status_code, 429)
    test.is_nil(first.kind)
    test.eq(first.retry_after_ms, 2000)
    test.eq(fixture.calls, 1, "connection capacity performs one outbound request without a local retry")
    local held, held_err = invoke(conn(shared))
    test.is_nil(held)
    test.eq(held_err:kind(), errors.RATE_LIMITED)
    test.eq(held_err:details().code, "connection_capacity_wait")
    test.ok(held_err:details().retry_at_ms >= began + 2000)
    test.eq(fixture.calls, 1, "shared floor prevents another outbound request")
    local free, free_err = invoke(conn(independent))
    test.is_nil(free_err)
    test.eq(free.status_code, 429)
    test.is_nil(free.kind)
    test.eq(fixture.calls, 2, "independent connection reaches its outbound boundary")
  end)
end

function M.unreachable(invoke, fixture): any
    return with_connections(function(create)
        fixture.calls = 0
        fixture.unreachable = true
        local result, err = invoke(conn(create()))
        fixture.unreachable = false
        test.is_nil(result)
        test.eq(err:kind(), errors.UNAVAILABLE)
        test.is_true(err:retryable())
        test.eq(fixture.calls, 1)
    end)
end
return M
