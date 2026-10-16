local capacity_http = require("capacity_http")
-- Shared pull implementation behind the Fireflies data sources. Two contract.binding
-- ports (transcripts, meetings) declare their own pullable method; each thin adapter
-- calls M.pull with a fixed shape policy so both catalog rows share this one core.
--
-- Stateless: the engine owns the cursor and passes it in; we return the next page +
-- next_cursor. Cursor = { phase, skip, hw, titles, title_dates }. The list is newest-first.
--   backfill: walk skip until the page is short or crosses config.backfill_since.
--   live: re-read the newest page, emit transcripts newer than the high-water
--         mark (hw = epoch of the newest item ever delivered), and inspect the
--         recent window for title changes before advancing hw.
--
-- shape: "event" (list metadata only -- cheap) or "transcript" (also fetch each
-- transcript's structured detail -- summary/overview/action_items/keywords/topics/
-- attendees -- plus the verbatim speaker-by-speaker call text), so the transform can
-- map fields, embed the real call content, or hand either to an LLM.

local ctx = require("ctx")
local hash = require("hash")
local transport = require("transport")
local output = require("output")

local M = {}

type Opts = {
    default_shape: string?,
    force_shape: string?,
}

type Deps = {
    transport: any?,
    component_id: string?,
    now_ms: number?,
}

local MAX_LIMIT = 50
local DEFAULT_LIMIT = 25

-- shape="transcript" makes two enrichment calls per item (detail + sentences), so a
-- full-size page is a burst of up to 100 sequential GraphQL calls -- comfortably past
-- what Fireflies' rate limit tolerates in one tick. Enriched pages walk in smaller
-- bites; the plain list/event/reconcile paths keep the full page size.
local ENRICH_LIMIT = 10

local RESCAN_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
local TITLE_HASH_LENGTH = 16

-- Item-scoped enrichment failure descriptor. scope:item is retriable next run;
-- scope:provider (429) carries retry_after_ms so the engine backs off past the wait.
type ItemError = { code: string, message: string, scope: string, retry_after_ms: number? }

-- Verbatim transcript text is capped so one long call can't blow out a KB document
-- or the item payload; the summary still carries the full AI overview regardless.
local MAX_TRANSCRIPT_CHARS = 60000

local function err(code: string, message: string, scope: string, retry_after_ms: number?, result: any?): any
    local out: any = { success = false, error = { code = code, message = message, retriable = true, scope = scope } }
    if retry_after_ms ~= nil then out.retry_after_ms = retry_after_ms end
    return capacity_http.carry(out, result)
end

local MONTHS: { [string]: number } = {
    Jan = 1, Feb = 2, Mar = 3, Apr = 4, May = 5, Jun = 6,
    Jul = 7, Aug = 8, Sep = 9, Oct = 10, Nov = 11, Dec = 12,
}

-- UTC epoch (seconds) from civil components, timezone-independent: os.time treats its
-- table as LOCAL time, which is wrong for a GMT provider timestamp on a non-UTC host.
-- Hinnant's days-from-civil.
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

-- Default backoff when a rate limit carries no parseable time.
local RATE_LIMIT_DEFAULT_MS = 60000

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

-- The signature covers every list-visible field a user edits in Fireflies
-- after a call: the title they rename and the speaker names they assign.
-- Either edit changes the signature, so the item re-delivers and the destination document
-- picks up the correction.
local function edit_signature(t: any): string
    local row: any = type(t) == "table" and t or {}
    local parts: { string } = { type(row.title) == "string" and row.title or "" }
    if type(row.speakers) == "table" then
        for _, raw in ipairs(row.speakers :: { any }) do
            local speaker: any = raw
            local name = type(speaker) == "table" and speaker.name or speaker
            if type(name) == "string" and name ~= "" then parts[#parts + 1] = name end
        end
    end
    local digest = select(1, hash.sha256(table.concat(parts, "\n"))) :: string
    return digest:sub(1, TITLE_HASH_LENGTH)
end

local function copy_recent_titles(cursor: { [string]: any }, now_ms: number): ({ [string]: any }, { [string]: any })
    local titles = type(cursor.titles) == "table" and cursor.titles or {}
    local dates = type(cursor.title_dates) == "table" and cursor.title_dates or {}
    local recent_titles: { [string]: any } = {}
    local recent_dates: { [string]: any } = {}
    local cutoff_ms = now_ms - RESCAN_WINDOW_MS
    for id, digest in pairs(titles) do
        local date = tonumber(dates[id])
        if date and date * 1000 >= cutoff_ms then
            recent_titles[id] = digest
            recent_dates[id] = date
        end
    end
    return recent_titles, recent_dates
end

local function within_rescan_window(date: number?, now_ms: number): boolean
    if date == nil then return false end
    return date * 1000 >= now_ms - RESCAN_WINDOW_MS
end

local function rate_limit_retry_ms(message: string): (number?, number?)
    local low = message:lower()
    if not (low:find("rate limit", 1, true) or low:find("too many request", 1, true) or low:find("retry after", 1, true)) then
        return nil
    end
    local d, mon, y, hh, mm, ss = message:match("(%d%d?)%s+(%a%a%a)%s+(%d%d%d%d)%s+(%d%d):(%d%d):(%d%d)")
    local mnum = mon and MONTHS[mon] or nil
    if not d or not mnum then return RATE_LIMIT_DEFAULT_MS end
    local target = utc_epoch(tonumber(y) :: number, mnum, tonumber(d) :: number, tonumber(hh) :: number, tonumber(mm) :: number, tonumber(ss) :: number)
    local delta = target - os.time()
    if delta < 0 then delta = 0 end
    return delta * 1000, target * 1000
end

local function provider_failure(result: any, scope: string): any
    local message = tostring(type(result) == "table" and result.error or "request failed")
    local retry_ms, retry_at_ms
    if type(result) == "table" and (result.kind == errors.RATE_LIMITED or result.status_code == 429) then
        retry_ms = tonumber(result.retry_after_ms) or RATE_LIMIT_DEFAULT_MS
    else
        retry_ms, retry_at_ms = rate_limit_retry_ms(message)
    end
    local unavailable = type(result) == "table" and (result.kind == errors.UNAVAILABLE or (tonumber(result.status_code) or 0) >= 500)
    local code = retry_ms ~= nil and "rate_limited" or (unavailable and "provider_unavailable" or "provider_error")
    local detail: any = {code = code,
        message = message, scope = (retry_ms ~= nil or unavailable) and "provider" or scope}
    if retry_ms ~= nil then
        detail.retry_after_ms = retry_ms
        if type(result) ~= "table" or result.kind == nil then
            local failure = capacity_http.rate_limit(message, retry_ms, retry_at_ms)
            detail.kind, detail.retryable, detail.details = failure:kind(), failure:retryable(), failure:details()
        end
    end
    return capacity_http.carry({error = detail}, result).error
end

-- Dates come back as epoch ms (or seconds) or an ISO string.
local function to_epoch(v: any): number?
    if type(v) == "number" then return v > 1e12 and v / 1000 or v end
    if type(v) ~= "string" or v == "" then return nil end
    local y, mo, d, h, mi, s = v:match("(%d+)-(%d+)-(%d+)T?(%d*):?(%d*):?(%d*)")
    if not y then return nil end
    return os.time({ year = tonumber(y), month = tonumber(mo), day = tonumber(d), hour = tonumber(h) or 0, min = tonumber(mi) or 0, sec = tonumber(s) or 0 })
end

-- Render sentences (newest-first call, but Fireflies returns them in speaker order)
-- as "Speaker: text" lines, one per sentence, capped so a long call can't blow out
-- the item payload or the KB document it lands in.
local function format_sentences(sentences: any): string
    if type(sentences) ~= "table" then return "" end
    local lines: { string } = {}
    for _, s in ipairs(sentences :: { any }) do
        local speaker = trim(s.speaker_name)
        local text = trim(s.text)
        if text ~= "" then
            lines[#lines + 1] = (speaker ~= "" and (speaker .. ": " .. text) or text)
        end
    end
    return output.safe_prefix(table.concat(lines, "\n"), MAX_TRANSCRIPT_CHARS)
end

-- Fetch a transcript's structured detail plus its verbatim sentence-by-sentence text,
-- merging both onto the payload. On failure it returns a DataError descriptor
-- { code, message, scope, retry_after_ms? } so the caller fails the item instead of
-- ingesting an enrichment-less thin doc under the stable transcript key. A 429 carries
-- retry_after_ms (provider scope, engine backs off); any other miss is item-scoped and
-- retriable, so at-least-once retries it next run while the cursor holds the page.
-- Returns nil on success.
local function enrich(tp: any, conn: any, payload: any): (ItemError?, error?)
    local typed_conn = conn :: { component_id: string?, api_key: string }
    local res, request_err = tp.get_transcript(typed_conn, tostring(payload.id))
    if request_err then return nil, request_err end
    if type(res) ~= "table" or res.success == false then
        return provider_failure(res, "item")
    end
    local tr = (type(res.data) == "table" and res.data.transcript) or nil
    if type(tr) ~= "table" then
        return { code = "provider_error", message = "get_transcript returned no transcript for " .. tostring(payload.id), scope = "item" }
    end
    payload.summary = tr.summary
    payload.attendees = tr.meeting_attendees
    payload.transcript_url = tr.transcript_url

    -- The verbatim call content -- the actual words spoken, not the AI summary of
    -- them. Delivered under `transcript` so a KB sync can embed real call content
    -- instead of the overview alone.
    local sres, sentences_err = tp.get_transcript_sentences(typed_conn, tostring(payload.id))
    if sentences_err then return nil, sentences_err end
    if type(sres) ~= "table" or sres.success == false then
        return provider_failure(sres, "item")
    end
    local stx = (type(sres.data) == "table" and sres.data.transcript) or nil
    payload.transcript = (type(stx) == "table") and format_sentences(stx.sentences) or ""
    return nil
end

-- Resolve the sync shape from the binding adapter. Shape is a contract property,
-- not flow config.
local function resolve_shape(opts: Opts): string
    if opts.force_shape and opts.force_shape ~= "" then return opts.force_shape end
    if opts.default_shape and opts.default_shape ~= "" then return opts.default_shape end
    return "event"
end

function M.pull(req: any, opts: Opts?, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    opts = type(opts) == "table" and opts or {}
    deps = type(deps) == "table" and deps or {}
    local tp = (deps :: Deps).transport or transport
    local component_id = (deps :: Deps).component_id or (ctx.get("component_id") :: string)

    local cursor: { [string]: any } = type(req.cursor) == "table" and req.cursor or { phase = "backfill", skip = 0 }
    local config = type(req.config) == "table" and req.config or {}
    local since = to_epoch(config.backfill_since)
    local shape = resolve_shape(opts :: Opts)
    local live = cursor.phase == "live"
    local hw = tonumber((cursor :: any).hw) or 0
    local now_ms = tonumber((deps :: Deps).now_ms) or os.time() * 1000
    local track_titles = shape == "transcript"
    local titles, title_dates = copy_recent_titles(cursor, now_ms)

    local conn, cerr = tp.connect(component_id)
    if cerr then return nil, cerr end
    if not conn then return err("auth_expired", "no connection", "connection") end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end
    if shape == "transcript" and limit > ENRICH_LIMIT then limit = ENRICH_LIMIT end

    local skip = tonumber(cursor.skip) or 0
    local res, request_err = tp.list_transcripts(conn, { limit = limit, skip = skip })
    if request_err then return nil, request_err end
    if not res or not res.success then
        local failure = provider_failure(res, "provider")
        return err(failure.code, failure.message, failure.scope, failure.retry_after_ms, failure)
    end

    local list = (type(res.data) == "table" and res.data.transcripts) or {}
    local items: { any } = {}
    local crossed = false
    local page_max = hw
    if type(list) == "table" then
        for _, t in ipairs(list :: { any }) do
            local td = to_epoch(t.date)
            if since and td and td < since then
                crossed = true -- past the backfill window
            elseif t.is_live == true then
                -- Fireflies is still writing this meeting (active or paused).
                -- Delivering now would freeze a mid-call snapshot under the
                -- stable transcript key, and the high-water mark would then
                -- skip the finished text forever. The item is not delivered
                -- and page_max is not advanced to it, so the next tick reads
                -- it again until is_live clears.
            elseif live and hw > 0 and td and td <= hw and not (
                track_titles and within_rescan_window(td, now_ms) and titles[tostring(t.id)] ~= edit_signature(t)
            ) then
                -- The recent title is unchanged, or this delivered item is outside
                -- the re-scan window.
            else
                if td and td > page_max then page_max = td end
                local id = tostring(t.id)
                local current_signature = track_titles and edit_signature(t) or ""
                -- The port declares `date` as a string, and every consumer reads it
                -- as one: a meeting date printed as 1785881100000 is not a date to
                -- anyone downstream. Fireflies answers with both forms; the ISO
                -- string is what leaves here, the epoch stays available as date_ms
                -- for arithmetic.
                local payload: any = {
                    id = t.id, title = t.title,
                    date = t.dateString or t.date,
                    date_ms = t.date,
                    duration = t.duration,
                    host_email = t.host_email, organizer_email = t.organizer_email,
                    -- Who was on the call: usually an attendee, rarely the organizer,
                    -- never the title. Without this a consumer can only match a lead
                    -- to a meeting we happened to name after them.
                    participants = t.participants,
                    -- The roster with display names rides the list answer, so a
                    -- meetings consumer attributes people without a per-meeting
                    -- detail call. The transcript shape's enrich() replaces this
                    -- with the detail-call roster when it runs.
                    attendees = t.meeting_attendees,
                }
                if shape == "transcript" then
                    -- Enrichment failure fails the page (typed, retriable) rather than
                    -- ingesting a thin metadata-only doc under the stable transcript key.
                    -- The poller commits the cursor only after a fully-accepted page, so
                    -- the page re-pulls next run; the upsert dedup_key keeps it idempotent.
                    -- A 429 carries retry_after_ms so the engine backs off past the wait.
                    local eerr, enrich_err = enrich(tp, conn, payload)
                    if enrich_err then return nil, enrich_err end
                    if eerr then return err(eerr.code, eerr.message, eerr.scope, eerr.retry_after_ms, eerr) end
                end
                items[#items + 1] = {
                    item_key = "fireflies:transcript:" .. id,
                    dedup_key = track_titles
                        and ("fireflies:transcript:" .. id .. ":" .. current_signature)
                        or ("fireflies:transcript:" .. id),
                    op = "upsert",
                    payload = payload,
                }
                if track_titles and within_rescan_window(td, now_ms) then
                    titles[id] = current_signature
                    title_dates[id] = td
                end
            end
        end
    end

    local n = #list
    if not live and not crossed and n >= limit then
        -- still inside the window and the page was full: advance skip, carry hw
        local next_cursor: any = { phase = "backfill", skip = skip + limit, hw = page_max }
        if track_titles then
            next_cursor.titles = titles
            next_cursor.title_dates = title_dates
        end
        return { success = true, items = items, next_cursor = next_cursor, has_more = true }
    end
    -- caught up (or window boundary) -> live: next tick emits only items newer than hw
    local next_cursor: any = { phase = "live", skip = 0, hw = page_max }
    if track_titles then
        next_cursor.titles = titles
        next_cursor.title_dates = title_dates
    end
    return { success = true, items = items, next_cursor = next_cursor, has_more = false }
end

function M.pull_keys(req: any, _opts: Opts?, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    deps = type(deps) == "table" and deps or {}
    local tp = (deps :: Deps).transport or transport
    local component_id = trim((deps :: Deps).component_id)
    if component_id == "" then component_id = trim(req.component_id) end
    if component_id == "" then component_id = trim(ctx.get("component_id")) end

    local cursor: { [string]: any } = type(req.cursor) == "table" and req.cursor or { phase = "backfill", skip = 0 }
    local config = type(req.config) == "table" and req.config or {}
    local since = to_epoch(config.backfill_since)
    local live = cursor.phase == "live"
    local hw = tonumber((cursor :: any).hw) or 0

    local conn, cerr = tp.connect(component_id)
    if cerr then return nil, cerr end
    if not conn then return err("auth_expired", "no connection", "connection") end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end

    local skip = tonumber(cursor.skip) or 0
    local res, request_err = tp.list_transcripts(conn, { limit = limit, skip = skip })
    if request_err then return nil, request_err end
    if not res or not res.success then
        local failure = provider_failure(res, "provider")
        return err(failure.code, failure.message, failure.scope, failure.retry_after_ms, failure)
    end

    local list = (type(res.data) == "table" and res.data.transcripts) or {}
    local keys: { any } = {}
    local crossed = false
    local page_max = hw
    if type(list) == "table" then
        for _, t in ipairs(list :: { any }) do
            local td = to_epoch(t.date)
            if td and td > page_max then page_max = td end
            if since and td and td < since then
                crossed = true
            elseif live and hw > 0 and td and td <= hw then
                -- already covered by the live high-water mark
            else
                local key = "fireflies:transcript:" .. tostring(t.id)
                keys[#keys + 1] = { item_key = key, dedup_key = key }
            end
        end
    end

    local n = #list
    if not live and not crossed and n >= limit then
        return { success = true, keys = keys, next_cursor = { phase = "backfill", skip = skip + limit, hw = page_max }, has_more = true }
    end
    return { success = true, keys = keys, next_cursor = { phase = "live", skip = 0, hw = page_max }, has_more = false }
end

return M
