local capacity_http = require("capacity_http")
-- Shared pull implementation behind the SimpleFIN data sources. Three
-- contract.binding ports (transactions, balances, holdings) declare their own
-- pullable method; each thin adapter calls M.pull with a fixed shape so all
-- three catalog rows share this one core.
--
-- Stateless: the engine owns the cursor and passes it in; we answer one page of
-- at most `limit` items and the cursor that continues it. The bridge answers a
-- whole window at once, so a page is a deterministic slice (sorted by account,
-- time, id) at `offset` inside the current window or snapshot.
--
-- transactions cursor = { phase, from | since, offset }.
--   backfill: walk [from, from + 31d) windows from config.backfill_since (default
--             90 days back) until the window reaches now.
--   live:     re-read from `since` (now - 7d overlap) every tick. Late-posting and
--             pending-to-posted changes re-deliver under a changed dedup_key; the
--             engine drops what it has already accepted.
-- balances / holdings cursor = { tick, offset }: a complete snapshot per tick,
--   delivered as complete coverage so what disappeared (a sold position, a
--   closed account) reconciles away downstream.

local ctx = require("ctx")
local transport = require("transport")
local protocol = require("protocol")

local M = {}

type Opts = { shape: string? }
type Deps = { transport: any?, component_id: string?, now: number? }

local DAY = 86400
M.BACKFILL_WINDOW = 31 * DAY
M.DEFAULT_BACKFILL = 90 * DAY
M.LIVE_OVERLAP = 7 * DAY
M.RATE_LIMIT_RETRY_MS = 60000
M.DEFAULT_LIMIT = 200
M.MAX_LIMIT = 1000
M.PROVIDER = "simplefin"
M.SCOPE_KEY = "global"

M.SHAPE_TRANSACTIONS = "transactions"
M.SHAPE_BALANCES = "balances"
M.SHAPE_HOLDINGS = "holdings"

local function err(code: string, message: string, scope: string, retry_after_ms: number?): any
    local out: any = { success = false, error = { code = code, message = message, retriable = true, scope = scope } }
    if retry_after_ms ~= nil then out.retry_after_ms = retry_after_ms end
    return out
end

-- A failed transport Result as a typed, scoped DataError.
local function provider_failure(result: any): any
    local message = tostring((type(result) == "table" and result.error) or "request failed")
    local code = type(result) == "table" and result.code or nil
    if code == "auth_expired" or code == "invalid_config" then
        return capacity_http.carry(err(code, message, "connection"), result)
    end
    if code == "rate_limited" then
        return capacity_http.carry(err(code, message, "provider", tonumber(result.retry_after_ms) or M.RATE_LIMIT_RETRY_MS), result)
    end
    return capacity_http.carry(err("provider_error", message, "provider"), result)
end

local function page_limit(req: any): number
    local limit = tonumber(req.limit) or M.DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > M.MAX_LIMIT then limit = M.MAX_LIMIT end
    return math.floor(limit)
end

local function account_context(account: any): any
    return {
        provider = M.PROVIDER,
        account_id = account.id,
        account_name = account.name,
        account_currency = account.currency,
        institution = account.institution,
    }
end

local function merge(base: any, extra: any): any
    local out: { [string]: any } = {}
    for k, v in pairs(extra) do out[k] = v end
    for k, v in pairs(base) do out[k] = v end
    return out
end

M.transaction_key = function(account_id: string, id: string): string
    return "simplefin:tx:" .. account_id .. ":" .. id
end

M.transaction_dedup = function(tx: any): string
    return M.transaction_key(tostring(tx.account_id), tostring(tx.id))
        .. ":" .. tostring(tx.posted_epoch or 0)
        .. ":" .. tostring(tx.amount or "")
        .. ":" .. (tx.pending and "pending" or "posted")
end

M.account_key = function(account_id: string): string
    return "simplefin:account:" .. account_id
end

M.holding_key = function(account_id: string, id: string): string
    return "simplefin:holding:" .. account_id .. ":" .. id
end

-- A deterministic order so an offset means the same rows on a re-fetch.
local function ordered(items: { any }): { any }
    table.sort(items, function(x: any, y: any): boolean
        if x.sort_account ~= y.sort_account then return x.sort_account < y.sort_account end
        if x.sort_time ~= y.sort_time then return x.sort_time < y.sort_time end
        return x.item_key < y.item_key
    end)
    return items
end

local function transaction_items(set: any): { any }
    local items: { any } = {}
    for _, account in ipairs(set.accounts :: { any }) do
        local context = account_context(account)
        for _, tx in ipairs(account.transactions :: { any }) do
            items[#items + 1] = {
                item_key = M.transaction_key(tostring(account.id), tostring(tx.id)),
                dedup_key = M.transaction_dedup(tx),
                op = "upsert",
                occurred_at = tx.posted_at,
                payload = merge(tx, context),
                sort_account = tostring(account.id),
                sort_time = tonumber(tx.posted_epoch) or 0,
            }
        end
    end
    return ordered(items)
end

local function balance_items(set: any): { any }
    local items: { any } = {}
    for _, account in ipairs(set.accounts :: { any }) do
        local key = M.account_key(tostring(account.id))
        items[#items + 1] = {
            item_key = key,
            dedup_key = key .. ":" .. tostring(account.balance_epoch or 0) .. ":" .. tostring(account.balance or "")
                .. ":" .. tostring(account.available_balance or ""),
            op = "upsert",
            occurred_at = account.balance_at,
            payload = {
                provider = M.PROVIDER,
                id = account.id,
                name = account.name,
                currency = account.currency,
                balance = account.balance,
                balance_minor = account.balance_minor,
                available_balance = account.available_balance,
                available_minor = account.available_minor,
                balance_at = account.balance_at,
                balance_epoch = account.balance_epoch,
                institution = account.institution,
                holdings_count = #(account.holdings :: { any }),
            },
            sort_account = tostring(account.id),
            sort_time = 0,
        }
    end
    return ordered(items)
end

local function holding_items(set: any): { any }
    local items: { any } = {}
    for _, account in ipairs(set.accounts :: { any }) do
        local context = account_context(account)
        for _, holding in ipairs(account.holdings :: { any }) do
            local key = M.holding_key(tostring(account.id), tostring(holding.id))
            items[#items + 1] = {
                item_key = key,
                dedup_key = key .. ":" .. tostring(holding.quantity or "") .. ":" .. tostring(holding.market_value or "")
                    .. ":" .. tostring(holding.cost_basis or "") .. ":" .. tostring(holding.as_of_epoch or 0),
                op = "upsert",
                occurred_at = account.balance_at,
                payload = merge(holding, context),
                sort_account = tostring(account.id),
                sort_time = 0,
            }
        end
    end
    return ordered(items)
end

-- The page at `offset`, stripped of its ordering helpers.
local function slice(items: { any }, offset: number, limit: number): ({ any }, boolean)
    local page: { any } = {}
    for i = offset + 1, math.min(#items, offset + limit) do
        local item = items[i]
        item.sort_account = nil
        item.sort_time = nil
        page[#page + 1] = item
    end
    return page, (offset + limit) < #items
end

type Window = { phase: string, from: number, to: number?, offset: number, next_cursor: any, has_more: boolean }

type KeyWindow = { window: Window, scope_key: string, pass_key: string }

-- Resolve the delivery window from the cursor. `next_cursor` continues past
-- this window; paging inside the window is the caller's business.
function M.window(cursor: any, config: any, now: number): Window
    local c: any = type(cursor) == "table" and cursor or {}
    local cfg: any = type(config) == "table" and config or {}
    local since = protocol.to_epoch(cfg.backfill_since) or (now - M.DEFAULT_BACKFILL)
    local offset = tonumber(c.offset) or 0
    if c.phase == "live" then
        local from = tonumber(c.since) or (now - M.LIVE_OVERLAP)
        return { phase = "live", from = from, to = nil, offset = offset, next_cursor = { phase = "live", since = now - M.LIVE_OVERLAP }, has_more = false }
    end
    local from = tonumber(c.from) or since
    local to = from + M.BACKFILL_WINDOW
    if to >= now then
        return { phase = "backfill", from = from, to = nil, offset = offset, next_cursor = { phase = "live", since = now - M.LIVE_OVERLAP }, has_more = false }
    end
    return { phase = "backfill", from = from, to = to, offset = offset, next_cursor = { phase = "backfill", from = to }, has_more = true }
end

-- The cursor that continues inside the same window.
local function same_window(window: Window, offset: number): any
    if window.phase == "live" then
        return { phase = "live", since = window.from, offset = offset }
    end
    return { phase = "backfill", from = window.from, offset = offset }
end

local function reconcile_boundary(config: any, cursor: any, now: number): (number?, string?, any?)
    local cfg: any = type(config) == "table" and config or {}
    local c: any = type(cursor) == "table" and cursor or {}
    if type(c.scope_key) == "string" and type(c.from) == "number" then
        return c.from, c.scope_key, nil
    end

    if cfg.since ~= nil then
        if type(cfg.since) ~= "string" or protocol.to_epoch(cfg.since) == nil then
            return nil, nil, err("invalid_request", "pull_keys.since must be an RFC3339 timestamp", "flow")
        end
        local since = protocol.to_epoch(cfg.since) :: number
        local scope_key = "simplefin:transactions:" .. tostring(since)
        return since, scope_key, nil
    end

    if cfg.last_days ~= nil then
        local days = tonumber(cfg.last_days)
        if type(cfg.last_days) ~= "number" or days == nil or days <= 0 or days ~= math.floor(days) then
            return nil, nil, err("invalid_request", "pull_keys.last_days must be a positive integer", "flow")
        end
        local since = now - days * DAY
        local scope_key = "simplefin:transactions:" .. tostring(since)
        return since, scope_key, nil
    end

    return nil, nil, err("invalid_request", "pull_keys requires a reconcile boundary in since or last_days", "flow")
end

local function reconcile_window(cursor: any, config: any, now: number): (KeyWindow?, any?)
    local from, scope_key, boundary_error = reconcile_boundary(config, cursor, now)
    if boundary_error then return nil, boundary_error end
    local c: any = type(cursor) == "table" and cursor or {}
    local offset = tonumber(c.offset) or 0
    local start = tonumber(c.from) or (from :: number)
    local end_at = start + M.BACKFILL_WINDOW
    local has_more = end_at < now
    local window: Window = {
        phase = "backfill",
        from = start,
        to = has_more and end_at or nil,
        offset = offset,
        next_cursor = has_more
            and { phase = "backfill", from = end_at, scope_key = scope_key }
            or { phase = "complete", scope_key = scope_key },
        has_more = has_more,
    }
    return { window = window, scope_key = scope_key :: string, pass_key = scope_key :: string }, nil
end

local function resolve(deps: Deps): (any, string?, number)
    local tp = deps.transport or transport
    local component_id = deps.component_id or (ctx.get("component_id") :: string)
    local now = tonumber(deps.now) or os.time()
    return tp, component_id, now
end

local function transactions_page(tp: any, conn: any, req: any, now: number, keys_only: boolean): (any?, error?)
    local config = type(req.config) == "table" and req.config or {}
    local include_pending = (config :: any).include_pending ~= false
    local limit = page_limit(req)
    local window = M.window(req.cursor, config, now)
    local result, request_err = tp.accounts(conn, {
        start_date = window.from,
        end_date = window.to,
        pending = include_pending,
    })
    if request_err then return nil, request_err end
    if not result or not result.success then return provider_failure(result) end
    local page, more_here = slice(transaction_items(result.data), window.offset, limit)
    local next_cursor = more_here and same_window(window, window.offset + limit) or window.next_cursor
    local has_more = more_here or window.has_more
    if keys_only then
        local keys: { any } = {}
        for _, item in ipairs(page) do
            keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
        end
        local out: any = { success = true, keys = keys, next_cursor = next_cursor, has_more = has_more }
        if has_more and #keys == 0 then out.retry_after_ms = 0 end
        return out
    end
    local out: any = { success = true, items = page, next_cursor = next_cursor, has_more = has_more }
    if has_more and #page == 0 then
        -- An empty backfill window still has more windows behind it; the contract
        -- asks for a retry hint whenever has_more rides on an empty page.
        out.retry_after_ms = 0
    end
    return out
end

local function reconcile_keys_page(tp: any, conn: any, req: any, now: number): (any?, error?)
    local resolved, resolve_error = reconcile_window(req.cursor, req.config, now)
    if resolve_error then return resolve_error end
    local key_window = resolved :: KeyWindow
    local window = key_window.window
    local config = type(req.config) == "table" and req.config or {}
    local result, request_err = tp.accounts(conn, {
        start_date = window.from,
        end_date = window.to,
        pending = config.include_pending ~= false,
    })
    if request_err then return nil, request_err end
    if not result or not result.success then return provider_failure(result) end
    local page, more_here = slice(transaction_items(result.data), window.offset, page_limit(req))
    local next_cursor = more_here and {
        phase = "backfill", from = window.from, offset = window.offset + page_limit(req), scope_key = key_window.scope_key,
    } or window.next_cursor
    local has_more = more_here or window.has_more
    local out: any = {
        success = true,
        keys = {},
        next_cursor = next_cursor,
        has_more = has_more,
        coverage = {
            mode = "complete", scope_key = key_window.scope_key, pass_key = key_window.pass_key, final = not has_more,
        },
    }
    for _, item in ipairs(page) do
        out.keys[#out.keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
    end
    if has_more and #out.keys == 0 then out.retry_after_ms = 0 end
    return out
end

local function snapshot_page(tp: any, conn: any, req: any, shape: string, now: number): (any?, error?)
    local cursor: any = type(req.cursor) == "table" and req.cursor or {}
    local offset = tonumber(cursor.offset) or 0
    local tick = tonumber(cursor.tick) or 0
    if offset == 0 then tick = tick + 1 end
    local limit = page_limit(req)
    local result, request_err = tp.snapshot(conn, now)
    if request_err then return nil, request_err end
    if not result or not result.success then return provider_failure(result) end
    local all = shape == M.SHAPE_HOLDINGS and holding_items(result.data) or balance_items(result.data)
    local page, has_more = slice(all, offset, limit)
    local out: any = {
        success = true,
        items = page,
        next_cursor = has_more and { tick = tick, offset = offset + limit } or { tick = tick, offset = 0 },
        has_more = has_more,
        coverage = { mode = "complete", pass_key = tostring(tick), scope_key = M.SCOPE_KEY, final = not has_more },
    }
    if has_more and #page == 0 then out.retry_after_ms = 0 end
    return out
end

function M.pull(req: any, opts: any?, deps: any?): (any?, error?)
    req = type(req) == "table" and req or {}
    local shape = (type(opts) == "table" and (opts :: Opts).shape) or M.SHAPE_TRANSACTIONS
    local tp, component_id, now = resolve((type(deps) == "table" and deps or {}) :: Deps)
    local conn, cerr = tp.connect(component_id)
    if cerr then return nil, cerr end
    if not conn then return err("auth_expired", "no connection", "connection") end
    if shape == M.SHAPE_BALANCES or shape == M.SHAPE_HOLDINGS then
        return snapshot_page(tp, conn, req, shape, now)
    end
    return transactions_page(tp, conn, req, now, false)
end

-- Keys-only transaction enumeration for Data Sync reconcile.
function M.pull_keys(req: any, _opts: any?, deps: any?): (any?, error?)
    req = type(req) == "table" and req or {}
    local shape = type(_opts) == "table" and (_opts :: Opts).shape or M.SHAPE_TRANSACTIONS
    local d: Deps = (type(deps) == "table" and deps or {}) :: Deps
    if (d.component_id == nil or d.component_id == "") and type(req.component_id) == "string" then
        d = { transport = d.transport, component_id = req.component_id, now = d.now }
    end
    local tp, component_id, now = resolve(d)
    if shape ~= M.SHAPE_BALANCES and shape ~= M.SHAPE_HOLDINGS and shape ~= M.SHAPE_TRANSACTIONS then
        return err("invalid_request", "unsupported reconcile source shape", "flow")
    end
    if shape == M.SHAPE_TRANSACTIONS then
        local _, boundary_error = reconcile_window(req.cursor, req.config, now)
        if boundary_error then return boundary_error end
    end
    local conn, cerr = tp.connect(component_id)
    if cerr then return nil, cerr end
    if not conn then return err("auth_expired", "no connection", "connection") end
    if shape == M.SHAPE_BALANCES or shape == M.SHAPE_HOLDINGS then
        local page, page_err = snapshot_page(tp, conn, req, shape, now)
        if page_err then return nil, page_err end
        if page.success ~= true then return page end
        local keys: { any } = {}
        for _, item in ipairs(page.items) do
            keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
        end
        return { success = true, keys = keys, next_cursor = page.next_cursor,
            has_more = page.has_more, coverage = page.coverage }
    end
    return reconcile_keys_page(tp, conn, req, now)
end

return M
