local function main(args)
    local parent, err = process.registry.lookup("app.suites.discord.soak.parent", process.registry.CONSISTENT)
    if err then error(err) end
    local _, send_err = process.send(parent, "soak-ready", {id = args.component_id, token = args.token, pid = process.pid()})
    if send_err then error(send_err) end
    local inbox, events = process.inbox(), process.events()
    while true do
        local selected = require("channel").select({inbox:case_receive(), events:case_receive()})
        if selected.channel == inbox then error("soak worker failure") end
        if selected.value.kind == process.event.CANCEL or selected.value.kind == process.event.LINK_DOWN then
            local _, stop_err = process.send(parent, "soak-stopped", {id = args.component_id, pid = process.pid()})
            if stop_err then error(stop_err) end
            return
        end
    end
end
return {main = main}
