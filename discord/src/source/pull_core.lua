-- Shared pull implementation behind the Discord channel-messages data source.
-- The contract.binding port declares its pullable method; the thin adapters call
-- M.pull / M.pull_keys so the catalog row and the reconcile listing share one core.
--
-- Stateless: the engine owns the cursor and passes it in; we return the next page
-- + next_cursor. Cursor = { after, edit_hw }.
--   after:   last delivered message snowflake. Snowflakes are time-ordered, so
--            `after` is the exact forward-pagination anchor -- backfill walks the
--            channel from its start (or from config.backfill_since projected onto
--            the snowflake timeline) and live ticks resume from the same anchor.
--   edit_hw: high-water mark over edited_timestamp of delivered items. Once the
--            forward drain is caught up, one newest-window scan re-emits messages
--            whose edited_timestamp moved past the mark (op upsert with the new
--            source_version), so edits inside the window converge downstream.
--
-- Identity: item_key == dedup_key == discord:message:<channel_id>:<message id>.
-- The key is stable across edits; the changed content travels as source_version
-- (edited_timestamp, else timestamp -- bytewise-monotonic ISO within one message),
-- which the engine passes through to the sink as metadata.source_version.
--
-- Snowflake ids exceed the double integer range, so all id math stays in string
-- space (length-then-lexicographic compare, long multiplication for the
-- backfill_since boundary). A 429 is returned as a rate_limited DataError with
-- retry_after_ms so the engine reschedules past the wait; nothing sleeps here.

local ctx = require("ctx")
local data_error = require("data_error")
local transport = require("transport")

local M = {}

type Deps = {
    transport: any?,
    component_id: string?,
}

type Cursor = {
    after: string,
    edit_hw: string,
}

local MAX_LIMIT = 100
local DEFAULT_LIMIT = 50

-- First millisecond of the Discord snowflake timeline (2015-01-01T00:00:00Z).
local DISCORD_EPOCH_MS = 1420070400000

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- Numeric order over decimal snowflake strings: shorter means smaller, equal
-- length falls back to lexicographic.
local function snowflake_lt(a: string, b: string): boolean
    if #a ~= #b then return #a < #b end
    return a < b
end
M.snowflake_lt = snowflake_lt

-- Decimal-string multiplication by a small factor. The product exceeds 2^53, so
-- the result is assembled digit by digit; every intermediate stays well inside
-- the exact double range.
local function mul_dec(dec: string, factor: number): string
    local digits: { number } = {}
    local carry = 0
    for i = #dec, 1, -1 do
        local v = (tonumber(dec:sub(i, i)) :: number) * factor + carry
        digits[#digits + 1] = v % 10
        carry = math.floor(v / 10)
    end
    while carry > 0 do
        digits[#digits + 1] = carry % 10
        carry = math.floor(carry / 10)
    end
    local out: { string } = {}
    for i = #digits, 1, -1 do out[#out + 1] = tostring(digits[i]) end
    local joined = table.concat(out)
    return joined == "" and "0" or joined
end

-- UTC epoch (seconds) from civil components, timezone-independent (os.time reads
-- its table as local time). Hinnant's days-from-civil.
local function utc_epoch(y: number, m: number, d: number, hh: number, mm: number, ss: number): number
    local yy = (m <= 2) and (y - 1) or y
    local era = math.floor((yy >= 0 and yy or (yy - 399)) / 400)
    local yoe = yy - era * 400
    local mp = (m > 2) and (m - 3) or (m + 9)
    local doy = math.floor((153 * mp + 2) / 5) + d - 1
    local doe = yoe * 365 + math.floor(yoe / 4) - math.floor(yoe / 100) + doy
    local days = era * 146097 + doe - 719468
    return days * 86400 + hh * 3600 + mm * 60 + ss
end

-- Project an ISO instant onto the snowflake timeline: the smallest id minted at
-- that millisecond, so `after` includes everything from the instant onward.
-- Returns nil on an unparseable value; instants before the Discord epoch clamp
-- to "0" (the whole channel).
local function snowflake_floor(iso: string): string?
    local y, mo, d, h, mi, s = iso:match("(%d+)-(%d+)-(%d+)T(%d+):(%d+):(%d+)")
    if not y then return nil end
    local ms = utc_epoch(tonumber(y) :: number, tonumber(mo) :: number, tonumber(d) :: number,
        tonumber(h) :: number, tonumber(mi) :: number, tonumber(s) :: number) * 1000
    local delta = ms - DISCORD_EPOCH_MS
    if delta <= 0 then return "0" end
    -- (delta << 22): the timestamp occupies the top bits of the snowflake.
    return mul_dec(string.format("%.0f", delta), 4194304)
end
M.snowflake_floor = snowflake_floor

-- The per-message version: edit time when the message was edited, else the
-- create time. ISO strings from one provider compare bytewise-monotonically.
local function message_version(msg: any): string
    local edited = (msg :: any).edited_timestamp
    if type(edited) == "string" and edited ~= "" then return edited end
    return tostring((msg :: any).timestamp or "")
end

local function message_key(channel_id: string, id: string): string
    return "discord:message:" .. channel_id .. ":" .. id
end

local function to_item(channel_id: string, msg: any): any
    local id = tostring((msg :: any).id)
    local author = type((msg :: any).author) == "table" and ((msg :: any).author :: any) or {}
    local attachments: { string } = {}
    for _, a in ipairs(type((msg :: any).attachments) == "table" and ((msg :: any).attachments :: { any }) or {}) do
        if type(a) == "table" and type((a :: any).url) == "string" then
            attachments[#attachments + 1] = (a :: any).url
        end
    end
    return {
        item_key = message_key(channel_id, id),
        dedup_key = message_key(channel_id, id),
        op = "upsert",
        source_version = message_version(msg),
        occurred_at = (msg :: any).timestamp,
        payload = {
            id = id,
            channel_id = channel_id,
            author = { id = tostring(author.id or ""), name = tostring(author.global_name or author.username or "") },
            content = (msg :: any).content,
            timestamp = (msg :: any).timestamp,
            edited_timestamp = (msg :: any).edited_timestamp,
            attachments = attachments,
            message_type = tonumber((msg :: any).type) or 0,
        },
    }
end

local function sort_ascending(list: { any }): ()
    table.sort(list, function(a: any, b: any): boolean
        return snowflake_lt(tostring((a :: any).id), tostring((b :: any).id))
    end)
end

type Request = {
    channel_id: string,
    cursor: Cursor,
    limit: number,
    conn: any,
    tp: any,
}

-- Normalize the pull/pull_keys request; returns nil + a failure envelope when the
-- config or connection cannot serve it.
local function prepare(req: any, deps: Deps): (Request?, any)
    local config = type(req.config) == "table" and req.config or {}
    local channel_id = trim((config :: any).channel_id)
    if channel_id == "" then return nil, data_error.invalid_config("source config.channel_id is required") end

    local raw = type(req.cursor) == "table" and (req.cursor :: any) or nil
    local cursor: Cursor
    if raw then
        cursor = { after = tostring(raw.after or "0"), edit_hw = tostring(raw.edit_hw or "") }
    else
        -- New engine generation: backfill from the channel start, or from the
        -- flow's backfill_since boundary projected onto the snowflake timeline.
        local after = "0"
        local since = trim((config :: any).backfill_since)
        if since ~= "" then
            local floor = snowflake_floor(since)
            if not floor then return nil, data_error.invalid_config("backfill_since is not an ISO instant: " .. since) end
            after = floor :: string
        end
        cursor = { after = after, edit_hw = "" }
    end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end

    local tp = deps.transport or transport
    local component_id = deps.component_id or (ctx.get("component_id") :: string)
    local conn, cerr = tp.connect(component_id)
    if cerr or not conn then return nil, data_error.connection(tostring(cerr or "no connection")) end

    return { channel_id = channel_id, cursor = cursor, limit = limit, conn = conn, tp = tp }, nil
end

-- One forward page strictly after the anchor. Returns the raw ascending list.
local function forward_page(r: Request): ({ any }?, any)
    local res = r.tp.list_channel_messages(r.conn, r.channel_id, { limit = r.limit, after = r.cursor.after })
    if type(res) ~= "table" or not (res :: any).success then
        return nil, data_error.from_result(res, "list messages")
    end
    local list = type((res :: any).data) == "table" and ((res :: any).data :: { any }) or {}
    sort_ascending(list)
    return list, nil
end

function M.pull(req: any, deps: Deps?): any
    req = type(req) == "table" and req or {}
    local r, perr = prepare(req, type(deps) == "table" and (deps :: Deps) or {})
    if perr or not r then return perr end
    local rq = r :: Request

    local list, ferr = forward_page(rq)
    if ferr or not list then return ferr end

    local items: { any } = {}
    local after = rq.cursor.after
    -- base_hw gates the edit scan below; next_hw is what the cursor carries
    -- forward. Freshly drained messages seed next_hw with their current edit
    -- version so the scan never re-emits content the drain already delivered.
    local base_hw = rq.cursor.edit_hw
    local next_hw = base_hw
    for _, msg in ipairs(list :: { any }) do
        local item = to_item(rq.channel_id, msg)
        items[#items + 1] = item
        local id = tostring((msg :: any).id)
        if snowflake_lt(after, id) then after = id end
        local edited = (msg :: any).edited_timestamp
        if type(edited) == "string" and edited > next_hw then next_hw = edited end
    end

    if #(list :: { any }) >= rq.limit then
        -- Full page: still draining forward. The edit scan waits until the drain
        -- is caught up so backfill stays one request per page.
        return { success = true, items = items, next_cursor = { after = after, edit_hw = next_hw }, has_more = true }
    end

    -- Caught up: one newest-window scan converges edits. Messages at or below the
    -- pre-drain anchor whose edited_timestamp moved past the high-water mark
    -- re-emit as upserts with the new source_version; newer ids either shipped in
    -- the drain above or stay for the next tick's anchor.
    local scan = rq.tp.list_channel_messages(rq.conn, rq.channel_id, { limit = rq.limit })
    if type(scan) ~= "table" or not (scan :: any).success then
        return data_error.from_result(scan, "scan messages")
    end
    local window = type((scan :: any).data) == "table" and ((scan :: any).data :: { any }) or {}
    sort_ascending(window)
    for _, msg in ipairs(window) do
        local id = tostring((msg :: any).id)
        local edited = (msg :: any).edited_timestamp
        if not snowflake_lt(rq.cursor.after, id) and type(edited) == "string" and edited > base_hw then
            items[#items + 1] = to_item(rq.channel_id, msg)
            if edited > next_hw then next_hw = edited end
        end
    end

    return { success = true, items = items, next_cursor = { after = after, edit_hw = next_hw }, has_more = false }
end

-- Keys-only enumeration for Data Sync reconcile: the engine unions pages until
-- has_more=false and deletes sink keys that vanished from the channel. Keys use
-- the same stable identity as pull, so an edited message never reads as deleted.
function M.pull_keys(req: any, deps: Deps?): any
    req = type(req) == "table" and req or {}
    local r, perr = prepare(req, type(deps) == "table" and (deps :: Deps) or {})
    if perr or not r then return perr end
    local rq = r :: Request

    local list, ferr = forward_page(rq)
    if ferr or not list then return ferr end

    local keys: { any } = {}
    local after = rq.cursor.after
    for _, msg in ipairs(list :: { any }) do
        local id = tostring((msg :: any).id)
        local key = message_key(rq.channel_id, id)
        keys[#keys + 1] = { item_key = key, dedup_key = key }
        if snowflake_lt(after, id) then after = id end
    end

    return {
        success = true,
        keys = keys,
        next_cursor = { after = after, edit_hw = rq.cursor.edit_hw },
        has_more = #(list :: { any }) >= rq.limit,
    }
end

return M
