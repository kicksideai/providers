local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: any? }
type StatusRenderResult = { success: boolean, rendered: boolean?, error: any? }
-- A discovered resource. Slack conversations are flat (no guild layer), so every
-- row is a selectable postable target; there is nothing to drill or nest.
type ResourceRow = { type: string, id: string, name: string, selectable: boolean?, is_private: boolean?, is_im: boolean? }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string? }

local trim = base.trim
local component_id = base.component_id

local function trim_text(value: any): string
    local text = trim(tostring(value or ""))
    if type(text) ~= "string" then return "" end
    return text
end

local function open(): (types.Conn?, error?)
    local id, err = component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

local function bot_details(data: any): any
    data = type(data) == "table" and data or {}
    return {
        team = data.team,
        team_id = data.team_id,
        user = data.user,
        user_id = data.user_id,
        bot_id = data.bot_id,
    }
end

-- A failed Slack answer: Slack's error code, HTTP status and body.
local function slack_failure(result: any, extra: any?): any
    local out: any = { success = false, error = result.error, status_code = result.status_code, details = result.data }
    for key, value in pairs(extra or {}) do out[key] = value end
    return out
end

function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if err then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if request_err then return nil, request_err end
    if not result.success then return slack_failure(result) end
    return { success = true, details = result.data }
end

function M.get_status(args: any): (StatusResult?, error?)
    local conn, err = open()
    if err then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if request_err then return nil, request_err end
    if not result.success then return slack_failure(result, { status = "error" }) end
    return { success = true, status = "ok", details = bot_details(result.data) }
end

-- One Slack conversation -> a resource row, or nil to skip (archived). Channels,
-- private channels, group DMs and 1:1 DMs are all selectable postable targets; an
-- IM has no name, so fall back to its id.
local function channel_resource(channel: any): ResourceRow?
    if type(channel) ~= "table" then return nil end
    local id = trim_text(channel.id)
    if id == "" then return nil end
    if channel.is_archived == true then return nil end
    local name = trim_text(channel.name)
    if name == "" then name = id end
    return {
        type = "slack_channel",
        id = id,
        name = name,
        selectable = true,
        is_private = channel.is_private == true,
        is_im = channel.is_im == true,
    }
end

function M.discover_resources(args: any): (DiscoverResult?, error?)
    args = type(args) == "table" and args or {}
    local conn, err = open()
    if err then return nil, err end

    local result, request_err = transport.list_conversations(conn, { limit = 1000 })
    if request_err then return nil, request_err end
    if not result.success then return slack_failure(result) end

    local resources: { ResourceRow } = {}
    local channels = type(result.data) == "table" and (result.data :: any).channels or nil
    if type(channels) == "table" then
        for _, channel in ipairs(channels :: { any }) do
            local row = channel_resource(channel)
            if row then resources[#resources + 1] = row end
        end
    end
    return { success = true, resources = resources }
end

-- reply_payload(content) -> (text, thread_ts, err). Accepts a bare string or a
-- table carrying text/content and an optional thread_ts (to reply in a thread).
local function reply_payload(content: any): (string, string, string?)
    if type(content) == "table" then
        local text = trim_text((content :: any).text)
        if text == "" then text = trim_text((content :: any).content) end
        if text == "" then return "", "", "content.text is required" end
        local thread_ts = trim_text((content :: any).thread_ts)
        return text, thread_ts, nil
    end
    local text = tostring(content or "")
    if text == "" then return "", "", "content is required" end
    return text, "", nil
end

function M.send_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local channel_id = trim_text(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end

    local text, thread_ts, perr = reply_payload(args.content)
    if perr then return { success = false, error = perr } end
    if #text > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Slack message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    local payload: { [string]: any } = { text = text }
    if thread_ts ~= "" then payload.thread_ts = thread_ts end
    return transport.send_reply({ channel_id = channel_id, payload = payload,
        reply_proof = args.reply_proof, outbound = args.outbound }) :: SimpleResult
end

function M.update_reply(args: any): SimpleResult
    args = type(args) == "table" and args or {}
    local channel_id = trim_text(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end
    local message_ref = trim_text(args.message_ref)
    if message_ref == "" then return { success = false, error = "message_ref is required" } end

    local text, _thread_ts, perr = reply_payload(args.content)
    if perr then return { success = false, error = perr } end
    if #text > types.MESSAGE_MAX_LENGTH then
        return { success = false, error = "Slack message exceeds " .. tostring(types.MESSAGE_MAX_LENGTH) .. " characters" }
    end

    if args.reply_proof ~= nil then
        return { success = false, error = (errors.new({ message = "Slack reply updates require a separately admitted operation",
            kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
    end
    return transport.update_reply({ channel_id = channel_id, message_ref = message_ref, text = text }) :: SimpleResult
end

-- Slack's Web API exposes no bot-visible native status indicator (typing is
-- RTM-only, assistant status is scoped to app DMs), so status requests succeed
-- without rendering and callers keep their own progress surface.
function M.send_status(args: any): StatusRenderResult
    args = type(args) == "table" and args or {}
    local channel_id = trim_text(args.resource_id)
    if channel_id == "" then return { success = false, error = "resource_id is required" } end
    if args.reply_proof ~= nil then
        return { success = false, error = (errors.new({ message = "Slack status requires a separately admitted operation",
            kind = errors.PERMISSION_DENIED, retryable = false }) :: error) }
    end
    return { success = true, rendered = false }
end

function M.delete(_args: any): ({ success: boolean }?, error?)
    return base.delete()
end

-- Test seams: the pure request/response shaping that the proper flow rests on,
-- exposed so it is unit-tested without a live component context or Slack API.
M._reply_payload = reply_payload
M._channel_resource = channel_resource
M._bot_details = bot_details

return M
