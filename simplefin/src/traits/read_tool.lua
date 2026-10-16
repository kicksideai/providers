local ctx = require("ctx")
local transport = require("transport")
local protocol = require("protocol")
local output = require("output")
local types = require("types")
local tool_result = require("tool_result")

local DEFAULT_DAYS = 30
local MAX_DAYS = 365

type Args = {
    action: string,
    account_id: string?,
    start_date: string?,
    end_date: string?,
    days: number?,
    pending: boolean?,
    fields: {string}?,
    limit: number?,
    cursor: string?,
}

-- The connection pinned on the trait, if any; else the transport auto-selects the
-- single SimpleFIN connection in scope.
local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function matches(account: any, account_id: string?): boolean
    return account_id == nil or account_id == "" or tostring(account.id) == account_id
end

-- The transaction window: explicit dates win, else `days` back from now.
local function window(args: Args): (number, number?, string?)
    local now = os.time()
    local start = protocol.to_epoch(args.start_date)
    local finish = protocol.to_epoch(args.end_date)
    if args.start_date and not start then return 0, nil, "start_date must be an ISO-8601 date" end
    if args.end_date and not finish then return 0, nil, "end_date must be an ISO-8601 date" end
    if not start then
        local days = tonumber(args.days) or DEFAULT_DAYS
        if days < 1 then days = 1 end
        if days > MAX_DAYS then days = MAX_DAYS end
        start = now - math.floor(days) * 86400
    end
    return start :: number, finish, nil
end

-- fetch_window answers the bridge Result for the transaction window, or the
-- window's input error, or the typed request error.
local function fetch_window(conn: types.Conn, args: Args): (any?, number, number?, string?, error?)
    local start, finish, werr = window(args)
    if werr then return nil, 0, nil, werr, nil end
    local result, err = transport.accounts(conn, {
        start_date = start,
        end_date = finish,
        pending = args.pending ~= false,
        account_id = args.account_id,
    })
    if not result then return nil, 0, nil, nil, err end
    return result, start, finish, nil, nil
end

local function transaction_rows(set: any, account_id: string?): { any }
    local rows: { any } = {}
    for _, a in ipairs(set.accounts :: { any }) do
        if matches(a, account_id) then
            for _, tx in ipairs(a.transactions :: { any }) do
                local row: any = {}
                for k, v in pairs(tx) do row[k] = v end
                row.account_name = a.name
                row.currency = a.currency
                rows[#rows + 1] = row
            end
        end
    end
    table.sort(rows, function(x: any, y: any): boolean
        return (tonumber(x.posted_epoch) or 0) > (tonumber(y.posted_epoch) or 0)
    end)
    return rows
end

-- Inflow, outflow and net per account over the window, in minor units.
local function summarize(set: any, account_id: string?): ({ any }, any)
    local rows: { any } = {}
    local total = { inflow_minor = 0, outflow_minor = 0, net_minor = 0, count = 0, pending_count = 0 }
    for _, a in ipairs(set.accounts :: { any }) do
        if matches(a, account_id) then
            local row = {
                account_id = a.id, account_name = a.name, currency = a.currency,
                inflow_minor = 0, outflow_minor = 0, net_minor = 0, count = 0, pending_count = 0,
            }
            for _, tx in ipairs(a.transactions :: { any }) do
                local minor = tonumber(tx.amount_minor) or 0
                if minor >= 0 then row.inflow_minor = row.inflow_minor + minor else row.outflow_minor = row.outflow_minor + minor end
                row.net_minor = row.net_minor + minor
                row.count = row.count + 1
                if tx.pending then row.pending_count = row.pending_count + 1 end
            end
            total.inflow_minor = total.inflow_minor + row.inflow_minor
            total.outflow_minor = total.outflow_minor + row.outflow_minor
            total.net_minor = total.net_minor + row.net_minor
            total.count = total.count + row.count
            total.pending_count = total.pending_count + row.pending_count
            rows[#rows + 1] = row
        end
    end
    return rows, total
end

local function handler(args: Args): (any?, error?)
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action
    if action == "list_accounts" then
        local result, request_err = transport.snapshot(conn)
        if not result then return nil, request_err end
        if not result.success then return tool_result.domain_error(result.error, result) end
        local set: any = result.data
        return tool_result.ok(output.rows({ warnings = set.errors }, "accounts", set.accounts, args, {"id", "name", "currency", "balance", "balance_minor", "available_balance", "available_balance_minor", "balance_date", "org"}))
    end

    if action == "list_transactions" then
        local result, start, finish, werr, request_err = fetch_window(conn, args)
        if werr then return tool_result.domain_error(werr) end
        if not result then return nil, request_err end
        if not result.success then return tool_result.domain_error(result.error, result) end
        local set: any = result.data
        return tool_result.ok(output.rows({
            start_at = protocol.iso_utc(start),
            end_at = finish and protocol.iso_utc(finish) or nil,
            warnings = set.errors,
        }, "transactions", transaction_rows(set, args.account_id), args, {"id", "posted", "posted_epoch", "amount", "amount_minor", "payee", "pending", "account_name", "currency"}))
    end

    if action == "summarize" then
        local result, start, finish, werr, request_err = fetch_window(conn, args)
        if werr then return tool_result.domain_error(werr) end
        if not result then return nil, request_err end
        if not result.success then return tool_result.domain_error(result.error, result) end
        local set: any = result.data
        local rows, total = summarize(set, args.account_id)
        return tool_result.ok(output.rows({
            start_at = protocol.iso_utc(start),
            end_at = finish and protocol.iso_utc(finish) or nil,
            total = total,
            warnings = set.errors,
        }, "accounts", rows, args, {"account_id", "account_name", "currency", "inflow_minor", "outflow_minor", "net_minor", "count", "pending_count"}))
    end

    if action == "list_holdings" then
        local result, request_err = transport.accounts(conn, { start_date = os.time(), account_id = args.account_id })
        if not result then return nil, request_err end
        if not result.success then return tool_result.domain_error(result.error, result) end
        local set: any = result.data
        local rows: { any } = {}
        for _, a in ipairs(set.accounts :: { any }) do
            if matches(a, args.account_id) then
                for _, h in ipairs(a.holdings :: { any }) do
                    local row: any = {}
                    for k, v in pairs(h) do row[k] = v end
                    row.account_name = a.name
                    rows[#rows + 1] = row
                end
            end
        end
        return tool_result.ok(output.rows({ warnings = set.errors }, "holdings", rows, args, {"id", "symbol", "shares", "market_value", "cost_basis", "account_name"}))
    end

    return tool_result.domain_error("unknown action '" .. tostring(action) .. "'. Use: list_accounts, list_transactions, summarize, list_holdings")
end

return { handler = handler }
