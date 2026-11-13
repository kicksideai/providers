local function main(args)
    if args.fail then error("gateway worker fixture failure") end
    local parent, parent_err = process.registry.lookup("app.suites.discord.supervisor.parent", process.registry.CONSISTENT)
    if parent_err or not parent then error(tostring(parent_err or "supervisor parent unavailable")) end
    local _, err = process.send(parent, "worker-ready", {})
    if err then error(tostring(err)) end
    local events = process.events()
    while true do
        local event, ok = events:receive()
        if not ok or event.kind == process.event.CANCEL then return end
    end
end
return { main = main }
