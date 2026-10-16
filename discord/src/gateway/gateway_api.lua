local websocket = require("websocket")
local json = require("json")
local consts = require("consts")

-- Thin websocket I/O for the gateway: open a connection, send a JSON command,
-- decode an inbound frame. Every protocol decision lives in gateway.protocol;
-- this layer only moves bytes, so it has almost no logic to get wrong.
local M = {}

-- normalize_url: the default gateway url already carries ?v=10&encoding=json, but
-- the per-session resume_gateway_url from READY is bare (e.g.
-- wss://gateway-us-east1-d.discord.gg) and must get the same query, or the
-- resume silently misbehaves. Pure so it is unit-tested.
function M.normalize_url(url: any): string
    local u = (type(url) == "string" and url ~= "") and url or consts.gateway_url()
    if (u :: string):find("?", 1, true) then return u :: string end
    return ((u :: string):gsub("/+$", "")) .. "/?v=10&encoding=json"
end

function M.connect(url: any): (any?, string?)
    local client, err = websocket.connect(M.normalize_url(url), { dial_timeout = 10 })
    if err or not client then return nil, tostring(err or "gateway connect failed") end
    return client, nil
end

-- send a gateway command (a Lua table) as a JSON text frame.
function M.send(client: any, payload: any): string?
    local encoded, enc_err = json.encode(payload)
    if enc_err then return "encode error: " .. tostring(enc_err) end
    local _, err = client:send(encoded :: string)
    if err then return tostring(err) end
    return nil
end

-- decode a received frame's text into a gateway payload table.
function M.decode(frame: any): (any?, string?)
    local raw: any = (type(frame) == "table") and (frame :: { data: any }).data or frame
    if type(raw) ~= "string" then return nil, "non-text frame" end
    local parsed, err = json.decode(raw :: string)
    if err then return nil, tostring(err) end
    return parsed, nil
end

function M.close(client: any, reason: any): (any?, any?)
    return client:close(1000, tostring(reason or "closing"))
end

return M
