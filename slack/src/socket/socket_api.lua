local http_client = require("http_client")
local websocket = require("websocket")
local json = require("json")
local consts = require("consts")

-- Thin Socket Mode I/O: mint a wss url via apps.connections.open, open the
-- websocket, send a JSON command, decode an inbound frame. Every protocol
-- decision lives in socket.protocol; this layer only moves bytes.
local M = {}

-- open_url(app_token) -> (wss_url, err). Calls apps.connections.open with the
-- app-level token in the Authorization header (Slack rejects it as a POST
-- parameter) and returns the fresh, single-use websocket url.
function M.open_url(app_token: string): (string?, string?)
    local response, err = http_client.request("POST", consts.open_url(), {
        headers = {
            ["Authorization"] = "Bearer " .. app_token,
            ["Content-Type"] = "application/x-www-form-urlencoded",
            ["Accept"] = "application/json",
        },
        body = "",
    })
    if err then return nil, tostring(err) end
    local raw = response and (response :: any).body or nil
    if type(raw) ~= "string" or (raw :: string) == "" then return nil, "apps.connections.open returned no body" end
    local parsed, derr = json.decode(raw :: string)
    if derr then return nil, tostring(derr) end
    if type(parsed) ~= "table" or (parsed :: any).ok ~= true then
        local code = type(parsed) == "table" and (parsed :: any).error or nil
        return nil, tostring(code or "apps.connections.open failed")
    end
    local url = (parsed :: any).url
    if type(url) ~= "string" or (url :: string) == "" then return nil, "apps.connections.open returned no url" end
    return url :: string, nil
end

function M.connect(url: string): (any?, string?)
    local client, err = websocket.connect(url, { dial_timeout = 10 })
    if err or not client then return nil, tostring(err or "socket connect failed") end
    return client, nil
end

-- send a command (a Lua table) as a JSON text frame.
function M.send(client: any, payload: any): string?
    local encoded, enc_err = json.encode(payload)
    if enc_err then return "encode error: " .. tostring(enc_err) end
    local _, err = client:send(encoded :: string)
    if err then return tostring(err) end
    return nil
end

-- decode a received frame's text into an envelope table.
function M.decode(frame: any): (any?, string?)
    local raw: any = (type(frame) == "table") and (frame :: { data: any }).data or frame
    if type(raw) ~= "string" then return nil, "non-text frame" end
    local parsed, err = json.decode(raw :: string)
    if err then return nil, tostring(err) end
    return parsed, nil
end

function M.close(client: any, reason: any)
    pcall(function() client:close(1000, tostring(reason or "closing")) end)
end

return M
