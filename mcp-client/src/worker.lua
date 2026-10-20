local channel = require("channel")
local time = require("time")
local json = require("json")
local component = require("component")
local client = require("client")
local error_envelope = require("error_envelope")

local function load_config(component_id: string): (any?, error?)
    local rows, err = component.list_system({ component_ids = { component_id }, include = { private_context = true }, limit = 1 })
    if err then return nil, errors.wrap(err, "MCP connection read failed") end
    if not rows or not rows[1] then return nil, errors.new({ kind = errors.NOT_FOUND, message = "connection not found" }) end
    return rows[1].private_context or {}, nil
end

local function main(args: any)
    local component_id = tostring(args and args.component_id or "")
    if component_id == "" then return end
    local session, fingerprint = nil, ""
    local inbox, events, idle = process.inbox(), process.events(), time.after("10m")
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive(), idle:case_receive() })
        if selected.channel == idle then break end
        if selected.channel == events then
            if selected.value.kind == process.event.CANCEL then break end
        else
            local req = selected.value:payload():data()
            local cfg, call_err = req.connection_config, nil
            if not cfg then cfg, call_err = load_config(component_id) end
            local result
            if cfg then
                local encoded = json.encode(cfg) or ""
                if not session or encoded ~= fingerprint then
                    if session then client.close(session) end
                    session, call_err = client.new(cfg)
                    fingerprint = encoded
                end
                if session and not call_err then
                    if req.operation == "list_tools" then
                        result, call_err = client.list_tools(session, req.args.cursor)
                    elseif req.operation == "call_tool" then result, call_err = client.call_tool(session, req.args.name, req.args.arguments or {})
                    else call_err = errors.new({ kind = errors.INVALID, message = "unknown MCP operation" }) end
                end
            end
            if call_err and session then client.close(session); session = nil end
            process.send(tostring(req.reply_pid), tostring(req.reply_topic), {
                result = result, error = call_err and error_envelope.encode(call_err) or nil,
            })
            idle = time.after("10m")
        end
    end
    if session then client.close(session) end
end

return { main = main }
