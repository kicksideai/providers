local channel = require("channel")
local logger = require("logger")
local log = logger:named("mcp_client.supervisor")
local NAME, WORKER, HOST = "kickside.mcp_client:supervisor.service", "kickside.mcp_client:worker", "app:processes"

local function worker_key(component_id: string, isolation_key: string): string
    return component_id .. "\0" .. isolation_key
end

local function main(_args: any)
    -- Callers on every node address the supervisor by its entry id.
    local registered, reg_err = process.registry.register(NAME, nil, process.registry.CONSISTENT)
    if not registered then error("register MCP supervisor: " .. tostring(reg_err)) end
    local workers, pids = {}, {}
    local inbox, events = process.inbox(), process.events()
    log:info("MCP client supervisor ready")
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive() })
        if selected.channel == inbox then
            local message = selected.value
            if message:topic() == "request" then
                local req = message:payload():data()
                local k = worker_key(tostring(req.component_id or ""), tostring(req.isolation_key or ""))
                local pid = workers[k]
                local spawn_err
                if not pid then
                    pid, spawn_err = process.spawn_monitored(WORKER, HOST, { component_id = req.component_id, isolation_key = req.isolation_key })
                    if pid then process.link(pid); workers[k] = pid; pids[pid] = k end
                end
                if pid then
                    process.send(pid, "request", { operation = req.operation, args = req.args, connection_config = req.connection_config, reply_pid = message:from(), reply_topic = req.reply_topic })
                else
                    process.send(tostring(message:from()), tostring(req.reply_topic), { error = {
                        kind = errors.UNAVAILABLE, message = "could not start MCP worker: " .. tostring(spawn_err), retryable = true,
                    } })
                end
            end
        else
            local event = selected.value
            if event.kind == process.event.CANCEL then
                for _, pid in pairs(workers) do process.cancel(pid) end
                return
            end
            local dead = event.from
            local k = dead and pids[dead]
            if k then workers[k] = nil; pids[dead] = nil end
        end
    end
end

return { main = main, worker_key = worker_key }
