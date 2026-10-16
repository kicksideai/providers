local test = require("test")
local funcs = require("funcs")
local security = require("security")
local channel = require("channel")
local time = require("time")
local observer = require("observer")

local function exercise(delay, first_round, last_round)
    local parent_name = "app.suites.discord.soak.parent"
    local registered, err = process.registry.register(parent_name, nil, process.registry.CONSISTENT)
    test.is_nil(err, tostring(err))
    test.is_true(registered)
    local exec = funcs.new():with_actor(security.new_actor("hub_soak_owner", {})):with_scope(security.named_scope("wippy.security:process"))
    local inbox, events = process.inbox(), process.events()
    local connections, workers, stopped = {}, {}, {}
    local hub_pid, hub_exit
    local function call(id, args)
        local result, call_err = exec:call(id, args)
        test.is_nil(call_err, tostring(call_err))
        test.not_nil(result)
        test.is_true(result.success ~= false, tostring(result.error))
        return result
    end
    local function wake()
        local result, wake_err = observer.run({projection = {body = {}}, range = {to_seq = 1}})
        test.is_nil(wake_err, tostring(wake_err))
        test.eq(result.last_seq, 1)
    end
    local function wait_for(condition)
        local timeout = time.after("3s")
        while not condition() do
            local selected = channel.select({inbox:case_receive(), events:case_receive(), timeout:case_receive()})
            test.is_true(selected.channel ~= timeout, "connection workers do not converge within 3s")
            if selected.channel == events and selected.value.from == hub_pid then
                hub_exit = selected.value
                local result = type(hub_exit.result) == "table" and hub_exit.result or {}
                error("soak hub exits: " .. tostring(hub_exit.error or result.error or hub_exit.result))
            end
            if selected.channel == inbox then
                local message = selected.value
                local body = message:payload():data()
                if message:topic() == "soak-ready" then workers[body.id] = body end
                if message:topic() == "soak-stopped" then stopped[body.pid] = true end
            end
        end
    end
    local function create(token)
        local result = call("kickside.connection.registry:register", {provider = "discord", name = "Hub soak connection", auth = {bot_token = token}})
        connections[result.component_id] = true
        return result.component_id
    end
    local ok, failure = pcall(function()
        local ids = {}
        for i = 1, 4 do ids[i] = create("token-" .. tostring(i)) end
        hub_pid, err = process.spawn_monitored("app.suites:hub_soak", "app:processes", {})
        test.is_nil(err, tostring(err))
        wait_for(function() for _, id in ipairs(ids) do if not workers[id] then return false end end; return true end)
        for round = first_round, last_round do
            local id = ids[(round - 1) % #ids + 1]
            local old_pid = workers[id].pid
            local token = "rotated-" .. tostring(round)
            call("kickside.component.binding:update_component_func", {component_id = id, commands = {{type = "SET_CONTEXT", payload = {private_context = {bot_token = token}}}}})
            wake()
            wait_for(function() return workers[id].token == token and workers[id].pid ~= old_pid and stopped[old_pid] end)
            if round % 10 == 0 then
                local crashed = workers[id].pid
                local _, crash_err = process.send(crashed, "crash", {})
                test.is_nil(crash_err, tostring(crash_err))
                wait_for(function() return workers[id].pid ~= crashed and workers[id].token == token end)
            end
            if round % 15 == 0 then
                local removed_pid = workers[id].pid
                call("kickside.connection.registry:delete", {component_id = id})
                connections[id] = nil
                wake()
                wait_for(function() return stopped[removed_pid] end)
                local replacement = create("replacement-" .. tostring(round))
                ids[(round - 1) % #ids + 1] = replacement
                wake()
                wait_for(function() return workers[replacement] ~= nil end)
            end
            time.sleep(delay)
        end
        local previous = {}
        for _, id in ipairs(ids) do previous[id] = workers[id].pid end
        for _ = 1, 30 do wake() end
        local quiet = time.after("100ms")
        while true do
            local selected = channel.select({inbox:case_receive(), events:case_receive(), quiet:case_receive()})
            if selected.channel == quiet then break end
            test.is_true(selected.channel ~= events, "hub exits during redundant wakes")
            local message = selected.value
            local body = message:payload():data()
            if message:topic() == "soak-ready" then workers[body.id] = body end
            if message:topic() == "soak-stopped" then stopped[body.pid] = true end
        end
        for id, pid in pairs(previous) do test.eq(workers[id].pid, pid); test.is_nil(stopped[pid]) end
    end)
    if hub_pid and not hub_exit then
        process.cancel(hub_pid)
        local timeout = time.after("3s")
        while not hub_exit do
            local selected = channel.select({events:case_receive(), inbox:case_receive(), timeout:case_receive()})
            test.is_true(selected.channel ~= timeout, "soak hub does not finish cancellation within 3s")
            if selected.channel == events and selected.value.from == hub_pid then hub_exit = selected.value end
        end
    end
    for id in pairs(connections) do call("kickside.connection.registry:delete", {component_id = id}) end
    local _, unregister_err = process.registry.unregister(parent_name, process.registry.CONSISTENT)
    test.is_nil(unregister_err, tostring(unregister_err))
    test.is_true(ok, tostring(failure))
end

local function define_tests()
    test.describe("Discord native connection churn", function()
        for segment = 0, 5 do
            test.it("keeps live workers aligned through connection lifecycle segment " .. tostring(segment + 1), function()
                exercise("0s", segment * 10 + 1, segment * 10 + 10)
            end)
        end
    end)
end
return {run = test.run_cases(define_tests), soak = function() exercise("1s", 1, 60) end}
