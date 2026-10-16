local connection = require("connection")
local process = require("process")
local channel = require("channel")
local logger = require("logger")
local env = require("env")
local component = require("component")
local notifier = require("notifier")
local registry = require("registry")
local health = require("health")

local function construct(dependencies: any): any
    local process = dependencies.process or process
    local channel = dependencies.channel or channel
    local component = dependencies.component or component
    local health = dependencies.health or health
    local env = dependencies.env or env
    local notifier = dependencies.notifier or notifier
    -- Discord gateway hub: the supervisor that turns each installed Discord
    -- connection into a live per-connection gateway worker. A connection gets a
    -- worker regardless of any responder: DM coverage comes from the connection's
    -- transport, and channel coverage is resolved per message by
    -- kickside.channel:receive (via runtime_reader). The hub owns no routing -- it
    -- only manages worker lifecycle.
    --
    -- It enumerates connections with the trusted system component read (no actor
    -- scoping), reading each connection's bot token straight from its private
    -- context. Reconcile runs at startup, on worker death and committed
    -- connection lifecycle changes. The service restarts failed scans.
    local log = logger:named("discord.gateway.hub")

    local WORKER_ID = "kickside.discord.gateway:worker"
    local CONNECTION_PROVIDER = "discord"

    -- Host the hub spawns its per-connection workers on; env-overridable, defaults to
    -- the app process host (the service runs there too).
    local function worker_host(): string
        local h = env.get("KICKSIDE_DISCORD_PROC_HOST")
        if type(h) == "string" and h ~= "" then return h end
        local service, err = registry.get("kickside.discord.gateway:gateway.service")
        local data = type(service) == "table" and service.data or nil
        local host = type(data) == "table" and data.host or nil
        if err or type(host) ~= "string" or host == "" then
            error("kickside.discord.gateway:process_host was not linked")
        end
        return host
    end

    local trim = connection.trim

    -- Every Discord connection with its bot token, read directly from the component
    -- store (trusted system read, no actor scoping).
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
        local options_ok, options_err = process.set_options({ trap_links = true })
        if not options_ok then error("Discord gateway supervision failed: " .. tostring(options_err)) end
        local host = worker_host()

        local events_ch = process.events()
        local inbox = process.inbox()
        local registered, reg_err = notifier.register()
        if not registered then error("Discord gateway registration failed: " .. tostring(reg_err)) end

        -- workers: { [conn_id] = { pid, token } } ; pids: { [pid] = conn_id }
        local workers: any = {}
        local pids: any = {}

        local function spawn_for(conn_id: string, token: string): error?
            local pid, serr = process.spawn_monitored(WORKER_ID, host, {
                token = token,
                component_id = conn_id,
                host = host,
            })
            if not pid then
                local _, health_err = health.report(conn_id, "gateway_worker_spawn_failed", serr)
                log:warn("worker spawn failed", { connection = conn_id, error = serr, health_error = health_err })
                return errors.wrap(serr, "Discord gateway worker spawn failed")
            end
            process.link(pid)
            workers[conn_id] = { pid = pid, token = token }
            pids[pid] = conn_id
            log:info("discord gateway worker spawned", { connection = conn_id })
            return nil
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

            local failure: any = nil
            local conns: { any } = {}
            for _, row in ipairs(rows) do
                local conn_id = trim((row :: any).component_id)
                local pctx = type((row :: any).private_context) == "table" and (row :: any).private_context or {}
                local token = trim((pctx :: any).bot_token or (pctx :: any).token)
                if conn_id ~= "" and token ~= "" then
                    table.insert(conns, { id = conn_id, token = token })
                else
                    if conn_id ~= "" then
                        local ok, health_err = health.report(conn_id, "bot_token_missing", "Discord connection has no bot token")
                        if not ok then
                            failure = health_err
                            log:warn("connection health unavailable", { connection = conn_id, error = health_err })
                        end
                    end
                    log:warn("skip connection; no bot token", { connection = conn_id })
                end
            end

            local plan = connection.plan_workers(workers, conns)
            for _, c in ipairs(plan.stop) do
                log:info("stopping worker; connection removed", { connection = c })
                drop_worker(c :: string)
            end
            for _, c in ipairs(plan.restart) do
                local id = (c :: any).id :: string
                log:info("restarting worker; bot token rotated", { connection = id })
                drop_worker(id)
                local spawn_err = spawn_for(id, (c :: any).token :: string)
                if spawn_err then failure = spawn_err end
            end
            for _, c in ipairs(plan.start) do
                local spawn_err = spawn_for((c :: any).id :: string, (c :: any).token :: string)
                if spawn_err then failure = spawn_err end
            end
            if failure then error(failure) end
        end

        reconcile()
        log:info("discord gateway hub started")

        while true do
            local result = channel.select({ events_ch:case_receive(), inbox:case_receive() })
            if result.channel == inbox then
                reconcile()
            elseif result.channel == events_ch then
                local event = result.value
                local kind = type(event) == "table" and (event :: any).kind or nil
                if kind == process.event.CANCEL or kind == process.event.OUTDATED then
                    log:info("discord gateway hub stopping")
                    for _, w in pairs(workers :: any) do process.cancel(w.pid :: string) end
                    return
                elseif kind == process.event.EXIT or kind == process.event.LINK_DOWN then
                    local dead_pid = type(event) == "table" and (event :: any).from or nil
                    local conn_id = dead_pid and pids[dead_pid] or nil
                    if conn_id then
                        local result = type((event :: any).result) == "table" and (event :: any).result or {}
                        local cause = result.error or "Discord gateway worker exits before cancellation"
                        log:warn("worker down; respawning", { connection = conn_id, error = tostring(cause) })
                        local reported, health_err = health.report(conn_id, "gateway_worker_failed", cause)
                        if not reported then error("Discord health write failed: " .. tostring(health_err)) end
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
