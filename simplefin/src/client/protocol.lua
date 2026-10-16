-- Pure SimpleFIN protocol helpers: credential forms, URL handling, query building,
-- amount and time conversion, and normalization of the bridge's accounts answer.
-- No I/O lives here so every rule is unit-testable.

local base64 = require("base64")

local M = {}

M.CLAIM_MARKER = "/claim/"
M.DEFAULT_DECIMALS = 2

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end
M.trim = trim

-- ── Credentials ─────────────────────────────────────────────────────────

-- An access URL carries Basic credentials in its userinfo: https://user:pass@host/path.
function M.is_access_url(value: any): boolean
    local s = trim(value)
    return s:match("^https?://[^/@]+:[^/@]+@[^/]+") ~= nil
end

-- A setup token is the base64 of a claim URL. Returns the claim URL or an error.
function M.decode_setup_token(token: any): (string?, error?)
    local s = trim(token)
    if s == "" then return nil, errors.new({ kind = errors.INVALID, message = "setup token is required" }) end
    local decoded, err = base64.decode(s)
    if err or type(decoded) ~= "string" then
        return nil, errors.new({ kind = errors.INVALID, message = "setup token is not valid base64" })
    end
    local url = trim(decoded)
    if not url:match("^https?://") then
        return nil, errors.new({ kind = errors.INVALID, message = "setup token does not decode to a claim URL" })
    end
    if not url:find(M.CLAIM_MARKER, 1, true) then
        return nil, errors.new({ kind = errors.INVALID, message = "setup token does not decode to a claim URL" })
    end
    return url, nil
end

-- Classify what the user pasted: "access_url" or "setup_token". The value is
-- returned trimmed. Errors describe which form failed.
function M.classify_credential(value: any): (string?, string?, error?)
    local s = trim(value)
    if s == "" then return nil, nil, errors.new({ kind = errors.INVALID, message = "a SimpleFIN setup token is required" }) end
    if M.is_access_url(s) then return "access_url", s, nil end
    local claim_url, err = M.decode_setup_token(s)
    if not claim_url then return nil, nil, err end
    return "setup_token", s, nil
end

local function pct_decode(s: string): string
    return (s:gsub("%%(%x%x)", function(hex: string): string
        return string.char(tonumber(hex, 16) :: integer)
    end))
end

type AccessParts = { base_url: string, authorization: string }

-- Split an access URL into the request base and the Basic authorization header.
function M.parse_access_url(value: any): (AccessParts?, error?)
    local s = trim(value)
    local scheme, user, pass, host, path = s:match("^(https?)://([^/@:]+):([^/@]+)@([^/]+)(.*)$")
    if not scheme then
        return nil, errors.new({ kind = errors.INVALID, message = "access URL must look like https://user:password@host/simplefin" })
    end
    local base = scheme .. "://" .. host .. (path :: string):gsub("/+$", "")
    local pair = pct_decode(user :: string) .. ":" .. pct_decode(pass :: string)
    local encoded = base64.encode(pair) :: string
    return { base_url = base, authorization = "Basic " .. encoded }, nil
end

-- ── Amounts ─────────────────────────────────────────────────────────────

-- "-48.69" -> -4869. Strings only: the bridge sends decimal strings and a float
-- round-trip would lose cents. Extra fraction digits are truncated, never rounded.
function M.amount_minor(value: any, decimals: integer?): number?
    local d: integer = decimals or (M.DEFAULT_DECIMALS :: integer)
    local s = trim(value)
    if s == "" then
        if type(value) == "number" then s = tostring(value) else return nil end
    end
    local sign, int_part, frac_part = s:match("^([%-%+]?)(%d*)%.?(%d*)$")
    if not sign or (int_part == "" and frac_part == "") then return nil end
    local frac = frac_part :: string
    if #frac > d then frac = frac:sub(1, d) end
    while #frac < d do frac = frac .. "0" end
    local whole = tonumber((int_part == "" and "0" or int_part) .. frac) :: number
    if sign == "-" then whole = -whole end
    return whole
end

-- ── Time ────────────────────────────────────────────────────────────────

-- UTC epoch from civil components; os.time interprets its table as local time,
-- which is wrong for a bridge timestamp on a non-UTC host. Hinnant's days-from-civil.
function M.utc_epoch(y: number, m: number, d: number, hh: number, mm: number, ss: number): number
    local yy = (m <= 2) and (y - 1) or y
    local era = math.floor((yy >= 0 and yy or (yy - 399)) / 400)
    local yoe = yy - era * 400
    local mp = (m > 2) and (m - 3) or (m + 9)
    local doy = math.floor((153 * mp + 2) / 5) + d - 1
    local doe = yoe * 365 + math.floor(yoe / 4) - math.floor(yoe / 100) + doy
    local days = era * 146097 + doe - 719468
    return days * 86400 + hh * 3600 + mm * 60 + ss
end

-- Epoch seconds -> RFC3339 UTC string. Hinnant's civil-from-days.
function M.iso_utc(epoch: any): string?
    local n = tonumber(epoch)
    if not n then return nil end
    if n > 1e12 then n = n / 1000 end
    n = math.floor(n)
    local days = math.floor(n / 86400)
    local rem = n - days * 86400
    local z = days + 719468
    local era = math.floor((z >= 0 and z or (z - 146096)) / 146097)
    local doe = z - era * 146097
    local yoe = math.floor((doe - math.floor(doe / 1460) + math.floor(doe / 36524) - math.floor(doe / 146096)) / 365)
    local y = yoe + era * 400
    local doy = doe - (365 * yoe + math.floor(yoe / 4) - math.floor(yoe / 100))
    local mp = math.floor((5 * doy + 2) / 153)
    local d = doy - math.floor((153 * mp + 2) / 5) + 1
    local m = mp < 10 and mp + 3 or mp - 9
    if m <= 2 then y = y + 1 end
    local hh = math.floor(rem / 3600)
    local mm = math.floor((rem - hh * 3600) / 60)
    local ss = rem - hh * 3600 - mm * 60
    return string.format("%04d-%02d-%02dT%02d:%02d:%02dZ", y, m, d, hh, mm, ss)
end

-- Epoch seconds from a number (seconds or milliseconds) or an ISO-8601 string
-- (date-only or date-time; a trailing Z or offset is honored).
function M.to_epoch(value: any): number?
    if type(value) == "number" then return value > 1e12 and math.floor(value / 1000) or math.floor(value) end
    local s = trim(value)
    if s == "" then return nil end
    if s:match("^%d+$") then return M.to_epoch(tonumber(s)) end
    local y, mo, d, rest = s:match("^(%d%d%d%d)%-(%d%d)%-(%d%d)(.*)$")
    if not y then return nil end
    local hh, mi, ss = (rest :: string):match("^[T ](%d%d):(%d%d):?(%d*)")
    local epoch = M.utc_epoch(tonumber(y) :: number, tonumber(mo) :: number, tonumber(d) :: number,
        tonumber(hh) or 0, tonumber(mi) or 0, tonumber(ss) or 0)
    local sign, oh, om = (rest :: string):match("([%+%-])(%d%d):?(%d%d)$")
    if sign then
        local offset = (tonumber(oh) :: number) * 3600 + (tonumber(om) :: number) * 60
        epoch = sign == "+" and epoch - offset or epoch + offset
    end
    return epoch
end

-- ── Requests ────────────────────────────────────────────────────────────

local function url_encode(s: string): string
    return (s:gsub("[^%w%-%._~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end

type AccountsOpts = {
    start_date: number?,
    end_date: number?,
    pending: boolean?,
    balances_only: boolean?,
    account_id: string?,
}

-- The /accounts query string. Keys follow the protocol spelling exactly.
function M.accounts_query(opts: AccountsOpts?): string
    local o: AccountsOpts = opts or {}
    local parts: { string } = {}
    if o.start_date then parts[#parts + 1] = "start-date=" .. tostring(math.floor(o.start_date :: number)) end
    if o.end_date then parts[#parts + 1] = "end-date=" .. tostring(math.floor(o.end_date :: number)) end
    if o.pending then parts[#parts + 1] = "pending=1" end
    if o.balances_only then parts[#parts + 1] = "balances-only=1" end
    if o.account_id and o.account_id ~= "" then parts[#parts + 1] = "account=" .. url_encode(o.account_id :: string) end
    if #parts == 0 then return "" end
    return "?" .. table.concat(parts, "&")
end

-- Map an HTTP failure to a message and a kickside.data error code.
function M.http_error(status_code: any, body: any): (string, string)
    local code = tonumber(status_code) or 0
    if code == 401 or code == 403 then
        return "SimpleFIN rejected the credentials; the access URL was revoked or the setup token was already claimed", "auth_expired"
    end
    if code == 402 then
        return "SimpleFIN Bridge requires payment; renew the subscription at bridge.simplefin.org", "provider_error"
    end
    if code == 429 then
        return "SimpleFIN rate limit reached", "rate_limited"
    end
    local message = "SimpleFIN request failed with status " .. tostring(code)
    local text = trim(body)
    if text ~= "" then
        message = message .. ": " .. (#text > 300 and (text:sub(1, 300) .. "...") or text)
    end
    return message, "provider_error"
end

-- ── Normalization ───────────────────────────────────────────────────────

local function str(value: any): string?
    if value == nil then return nil end
    return tostring(value)
end

-- The bridge's `org` is the financial institution behind an account.
local function normalize_institution(raw: any): any
    local o: any = type(raw) == "table" and raw or {}
    return {
        id = str(o.id),
        name = str(o.name),
        domain = str(o.domain),
        url = str(o.url),
        sfin_url = str(o["sfin-url"]),
    }
end

local function normalize_transaction(raw: any, account_id: string): any
    local t: any = raw
    local posted = M.to_epoch(t.posted)
    local transacted = M.to_epoch(t.transacted_at)
    return {
        id = tostring(t.id),
        account_id = account_id,
        posted_at = M.iso_utc(posted),
        posted_epoch = posted,
        transacted_at = M.iso_utc(transacted),
        transacted_epoch = transacted,
        amount = str(t.amount),
        amount_minor = M.amount_minor(t.amount),
        description = str(t.description),
        payee = str(t.payee),
        memo = str(t.memo),
        pending = t.pending == true,
        category_code = str(t.mcc),
    }
end

local function normalize_holding(raw: any, account_id: string): any
    local h: any = raw
    local as_of = M.to_epoch(h.created)
    local id = str(h.id)
    if id == nil or id == "" then id = str(h.symbol) end
    return {
        id = id,
        account_id = account_id,
        symbol = str(h.symbol),
        description = str(h.description),
        quantity = str(h.shares),
        market_value = str(h.market_value),
        market_value_minor = M.amount_minor(h.market_value),
        cost_basis = str(h.cost_basis),
        cost_basis_minor = M.amount_minor(h.cost_basis),
        purchase_price = str(h.purchase_price),
        currency = str(h.currency),
        as_of = M.iso_utc(as_of),
        as_of_epoch = as_of,
    }
end

local function normalize_account(raw: any): any
    local a: any = raw
    local id = tostring(a.id)
    local balance_epoch = M.to_epoch(a["balance-date"])
    local transactions: { any } = {}
    if type(a.transactions) == "table" then
        for _, t in ipairs(a.transactions :: { any }) do
            if type(t) == "table" and t.id ~= nil then
                transactions[#transactions + 1] = normalize_transaction(t, id)
            end
        end
    end
    local holdings: { any } = {}
    if type(a.holdings) == "table" then
        for _, h in ipairs(a.holdings :: { any }) do
            if type(h) == "table" then
                holdings[#holdings + 1] = normalize_holding(h, id)
            end
        end
    end
    return {
        id = id,
        name = str(a.name),
        currency = str(a.currency),
        balance = str(a.balance),
        balance_minor = M.amount_minor(a.balance),
        available_balance = str(a["available-balance"]),
        available_minor = M.amount_minor(a["available-balance"]),
        balance_at = M.iso_utc(balance_epoch),
        balance_epoch = balance_epoch,
        institution = normalize_institution(a.org),
        transactions = transactions,
        holdings = holdings,
    }
end

type AccountSet = { errors: { string }, accounts: { any } }

-- The bridge answers { errors: [string], accounts: [Account] }. Errors are
-- per-institution warnings ("connection X needs attention") and travel alongside
-- a successful account list; they are never fatal by themselves.
function M.normalize_accounts(decoded: any): (AccountSet?, string?)
    if type(decoded) ~= "table" then return nil, "SimpleFIN answer is not a JSON object" end
    local d: any = decoded
    local errors: { string } = {}
    if type(d.errors) == "table" then
        for _, e in ipairs(d.errors :: { any }) do
            local text = type(e) == "table" and (e.msg or e.message) or e
            if text ~= nil then errors[#errors + 1] = tostring(text) end
        end
    end
    local accounts: { any } = {}
    if type(d.accounts) == "table" then
        for _, a in ipairs(d.accounts :: { any }) do
            if type(a) == "table" and a.id ~= nil then
                accounts[#accounts + 1] = normalize_account(a)
            end
        end
    elseif d.accounts ~= nil then
        return nil, "SimpleFIN answer carries no accounts array"
    end
    return { errors = errors, accounts = accounts }, nil
end

return M
