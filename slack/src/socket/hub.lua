local connection = require("connection")
local channel = require("channel")
local logger = require("logger")
local env = require("env")
local component = require("component")
local consts = require("consts")
local registry = require("registry")

-- Slack socket hub: the supervisor that turns each installed Slack connection
-- into a live per-connection Socket Mode worker. A connection gets a worker
-- regardless of any responder: DM coverage comes from the connection's transport,
-- and channel coverage is resolved per message by kickside.channel:receive. The
-- hub owns no routing -- it only manages worker lifecycle.
--
-- It enumerates connections with the trusted system component read (no actor
-- scoping), reading each connection's app-level token straight from its private
-- context. The worker uses that app token to open the socket; the bot token it
-- needs per message is re-resolved by the inbound transport from the connection
-- id, so a rotated bot token is picked up without a restart -- only a rotated app
-- token forces a respawn. Reconcile runs on startup, worker death and lifecycle wakes.
local function construct(dependencies: any): any
    local process = dependencies.process or process
    local channel = dependencies.channel or channel
    local component = dependencies.component or component
    local env = dependencies.env or env
    local log = logger:named("slack.socket.hub")

    local WORKER_ID = "kickside.slack.socket:worker"
    local CONNECTION_PROVIDER = "slack"

    -- Host the hub spawns its per-connection workers on; env-overridable, defaults to
    -- the app process host (the service runs there too).
    local function worker_host(): string
        local h = env.get("KICKSIDE_SLACK_PROC_HOST")
        if type(h) == "string" and h ~= "" then return h end
        local service, err = registry.get("kickside.slack.socket:socket.service")
        local data = type(service) == "table" and service.data or nil
        local host = type(data) == "table" and data.host or nil
        if err or type(host) ~= "string" or host == "" then
            error("kickside.slack.socket:process_host was not linked")
        end
        return host
    end

    local trim = connection.trim

    -- Every Slack connection with its app-level token, read directly from the
    -- component store (trusted system read, no actor scoping).
    local function list_connections(): ({ any }?, error?)
        local rows, err = component.list_system({
            meta = { class = "connection", provider = CONNECTION_PROVIDER },
            include = { private_context = true, meta = true },
        })
        if err then return nil, err end
        return rows :: { any }, nil
    end

    local function main(args: any)
        args = type(args) == "table" and args or {}
        local host = worker_host()
        local options_ok, options_err = process.set_options({trap_links = true})
        if not options_ok then error(options_err) end
        local events_ch, inbox = process.events(), process.inbox()
        local registered, reg_err = process.registry.register(consts.HUB_NAME, nil, process.registry.CONSISTENT)
        if not registered then error(reg_err) end

        -- workers: { [conn_id] = { pid, token } } ; pids: { [pid] = conn_id }
        local workers: any = {}
        local pids: any = {}

        local function spawn_for(conn_id: string, token: string)
            local pid, serr = process.spawn_monitored(WORKER_ID, host, {
                app_token = token,
                component_id = conn_id,
                host = host,
            })
            if not pid then
                log:warn("worker spawn failed", { connection = conn_id, error = serr })
                error(serr)
            end
            process.link(pid)
            workers[conn_id] = { pid = pid, token = token }
            pids[pid] = conn_id
            log:info("slack socket worker spawned", { connection = conn_id })
        end

        -- Stop a running worker and forget it, so the next spawn re-tracks it cleanly.
        local function drop_worker(conn_id: string)
            local w = (workers :: any)[conn_id]
            if not w then return end
            process.cancel(w.pid :: string)
            pids[w.pid] = nil
            workers[conn_id] = nil
        end

        local function reconcile()
            local rows, cerr = list_connections()
            if cerr then error(cerr) end

            local conns: { any } = {}
            for _, row in ipairs(rows) do
                local conn_id = trim((row :: any).component_id)
                local pctx = type((row :: any).private_context) == "table" and (row :: any).private_context or {}
                local token = trim((pctx :: any).app_token)
                if conn_id ~= "" and token ~= "" then
                    table.insert(conns, { id = conn_id, token = token })
                else
                    log:warn("skip connection; no app token (Socket Mode disabled)", { connection = conn_id })
                end
            end

            local plan = connection.plan_workers(workers, conns)
            for _, c in ipairs(plan.stop) do
                log:info("stopping worker; connection removed", { connection = c })
                drop_worker(c :: string)
            end
            for _, c in ipairs(plan.restart) do
                local id = (c :: any).id :: string
                log:info("restarting worker; app token rotated", { connection = id })
                drop_worker(id)
                spawn_for(id, (c :: any).token :: string)
            end
            for _, c in ipairs(plan.start) do
                spawn_for((c :: any).id :: string, (c :: any).token :: string)
            end
            return true
        end

        reconcile()
        log:info("slack socket hub started")

        while true do
            local result = channel.select({ events_ch:case_receive(), inbox:case_receive() })
            if result.channel == inbox then
                reconcile()
            elseif result.channel == events_ch then
                local event = result.value
                local kind = type(event) == "table" and (event :: any).kind or nil
                if kind == process.event.CANCEL or kind == process.event.OUTDATED then
                    log:info("slack socket hub stopping")
                    for _, w in pairs(workers :: any) do process.cancel(w.pid :: string) end
                    return
                elseif kind == process.event.EXIT or kind == process.event.LINK_DOWN then
                    -- process events carry the dead pid in `from`.
                    local dead_pid = type(event) == "table" and (event :: any).from or nil
                    local conn_id = dead_pid and pids[dead_pid] or nil
                    if conn_id then
                        log:warn("worker down; respawning", { connection = conn_id })
                        pids[dead_pid] = nil
                        workers[conn_id] = nil
                        reconcile()
                    end
                end

            end
        end
    end

    return { main = main, _plan_reconcile = connection.plan_workers }
end
local M = construct({})
M.new = construct
return M
