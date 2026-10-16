local conformance = require("conformance")
local core = require("pull_core")
local protocol = require("protocol")
local test = require("test")

local DAY = 86400
local NOW = 1788393600 -- 2026-09-02T08:00:00Z

-- A bridge with 120 days of daily transactions on two accounts and a brokerage
-- with three positions, answered through a fake transport that honors the
-- window it is asked for. The failure config trips a 403 so the DataError
-- taxonomy is exercised.
local function new_fake(): any
    local fake: any = { calls = 0 }
    local function transactions_between(prefix: string, from: number?, to: number?): { any }
        local rows: { any } = {}
        for day = 0, 119 do
            local posted = NOW - day * DAY
            if (from == nil or posted >= from) and (to == nil or posted < to) then
                rows[#rows + 1] = { id = prefix .. tostring(day), posted = posted, amount = day % 3 == 0 and "12.50" or "-4.25", description = "Row " .. tostring(day), pending = day == 0 }
            end
        end
        return rows
    end
    function fake.connect(_component_id: string?): (any, string?)
        return { component_id = "c1", base_url = "https://bridge/simplefin", authorization = "Basic x", access_url = "u" }, nil
    end
    local function answer(from: number?, to: number?): any
        return protocol.normalize_accounts({
            accounts = {
                { org = { name = "Demo Bank" }, id = "ACT-1", name = "Checking", currency = "USD", balance = "10.00", ["balance-date"] = NOW - 60,
                  transactions = transactions_between("a", from, to) },
                { org = { name = "Demo Bank" }, id = "ACT-2", name = "Card", currency = "USD", balance = "-5.00", ["balance-date"] = NOW - 60,
                  transactions = transactions_between("b", from, to) },
                { org = { name = "Demo Bank" }, id = "ACT-3", name = "Brokerage", currency = "USD", balance = "300.00", ["balance-date"] = NOW - 60,
                  holdings = {
                      { id = "H-1", symbol = "AAA", shares = "1", market_value = "100.00", cost_basis = "90.00", created = NOW - 120 },
                      { id = "H-2", symbol = "BBB", shares = "2", market_value = "100.00", cost_basis = "80.00", created = NOW - 120 },
                      { symbol = "CCC", shares = "3", market_value = "100.00", cost_basis = "70.00", created = NOW - 120 },
                  } },
            },
        })
    end
    function fake.accounts(_conn: any, opts: any): any
        fake.calls = fake.calls + 1
        if fake.fail then return { success = false, error = "revoked", code = "auth_expired" } end
        return { success = true, data = answer(opts.start_date, opts.end_date) }
    end
    function fake.snapshot(_conn: any, now: number?): any
        fake.calls = fake.calls + 1
        if fake.fail then return { success = false, error = "revoked", code = "auth_expired" } end
        return { success = true, data = answer(now, nil) }
    end
    return fake
end

local function deps(fake: any): any
    return { transport = fake, component_id = "c1", now = NOW }
end

local function run_shape(shape: string, limit: number, max_pages: number, with_keys: boolean): any
    local fake = new_fake()
    local failing = new_fake()
    failing.fail = true
    -- The battery calls one pull function for both the happy path and the
    -- failure path; the failure config routes the call to the failing transport.
    local options: any = {
        pull = function(req: any): any
            local cfg: any = req.config or {}
            local tp = cfg.fail and failing or fake
            return core.pull(req, { shape = shape }, { transport = tp, component_id = "c1", now = NOW })
        end,
        config = { include_pending = true },
        failure_config = { fail = true },
        limit = limit,
        max_pages = max_pages,
    }
    if shape == core.SHAPE_TRANSACTIONS then
        options.backfill_since = { mode = "honored", value = protocol.iso_utc(NOW - 10 * DAY) }
        if with_keys then options.config.since = protocol.iso_utc(NOW - 10 * DAY) end
    else
        options.backfill_since = { mode = "ignored", reason = "a snapshot has no history; every tick enumerates the current state" }
    end
    if with_keys then
        options.pull_keys = function(req: any): any return core.pull_keys(req, { shape = shape }, deps(fake)) end
    end
    return conformance.run(options), fake
end

local function walk(shape: string, limit: number): ({ any }, number, any)
    local fake = new_fake()
    local items: { any } = {}
    local cursor: any = nil
    local last: any = nil
    for _ = 1, 400 do
        local page = core.pull({ cursor = cursor, config = {}, limit = limit }, { shape = shape }, deps(fake))
        test.is_true(page.success, page.error and page.error.message or "")
        test.is_true(#page.items <= limit, "page exceeded the limit: " .. tostring(#page.items))
        for _, item in ipairs(page.items) do items[#items + 1] = item end
        last = page
        if not page.has_more then break end
        cursor = page.next_cursor
    end
    return items, fake.calls, last
end

local function define_tests()
    test.describe("SimpleFIN sources conform to kickside.data:pullable", function()
        test.it("passes typed account and snapshot failures through pull and pull_keys", function()
            local accounts_failure = errors.new({ kind = errors.UNAVAILABLE, message = "accounts transport unavailable" })
            local accounts = new_fake()
            accounts.accounts = function(): (any?, error?) return nil, accounts_failure end
            local pull_result, pull_err = core.pull({ cursor = nil, config = {} },
                { shape = core.SHAPE_TRANSACTIONS }, deps(accounts))
            local keys_result, keys_err = core.pull_keys({ cursor = nil,
                config = { since = protocol.iso_utc(NOW - DAY) } }, { shape = core.SHAPE_TRANSACTIONS }, deps(accounts))
            test.is_nil(pull_result)
            test.eq(pull_err, accounts_failure)
            test.is_nil(keys_result)
            test.eq(keys_err, accounts_failure)

            local snapshot_failure = errors.new({ kind = errors.UNAVAILABLE, message = "snapshot transport unavailable" })
            local snapshot = new_fake()
            snapshot.snapshot = function(): (any?, error?) return nil, snapshot_failure end
            local balance_result, balance_err = core.pull({ cursor = nil, config = {} },
                { shape = core.SHAPE_BALANCES }, deps(snapshot))
            local holding_keys, holding_keys_err = core.pull_keys({ cursor = nil, config = {} },
                { shape = core.SHAPE_HOLDINGS }, deps(snapshot))
            test.is_nil(balance_result)
            test.eq(balance_err, snapshot_failure)
            test.is_nil(holding_keys)
            test.eq(holding_keys_err, snapshot_failure)
        end)

        test.it("transactions source passes the battery with reconcile keys", function()
            local result = run_shape(core.SHAPE_TRANSACTIONS, 25, 60, true)
            test.is_true(result.success, conformance.format_failures(result))
        end)

        test.it("balances source passes the battery", function()
            local result = run_shape(core.SHAPE_BALANCES, 2, 10, true)
            test.is_true(result.success, conformance.format_failures(result))
        end)

        test.it("holdings source passes the battery", function()
            local result = run_shape(core.SHAPE_HOLDINGS, 2, 10, true)
            test.is_true(result.success, conformance.format_failures(result))
        end)

        test.it("enumerates complete balance and holding keys for reconcile", function()
            for _, shape in ipairs({ core.SHAPE_BALANCES, core.SHAPE_HOLDINGS }) do
                local fake = new_fake()
                local cursor: any = nil
                local keys: { [string]: boolean } = {}
                local final: any = nil
                for _ = 1, 10 do
                    local page = core.pull_keys({ cursor = cursor, config = {}, limit = 2 }, { shape = shape }, deps(fake))
                    test.is_true(page.success, page.error and page.error.message or "")
                    for _, key in ipairs(page.keys) do keys[key.item_key] = true end
                    final = page
                    if not page.has_more then break end
                    cursor = page.next_cursor
                end
                test.eq(final.coverage.mode, "complete")
                test.eq(final.coverage.final, true)
                local count = 0
                for _ in pairs(keys) do count = count + 1 end
                test.eq(count, 3)
            end
        end)

        test.it("delivers every transaction of the backfill exactly once across limited pages", function()
            local items, _, last = walk(core.SHAPE_TRANSACTIONS, 7)
            local seen: { [string]: boolean } = {}
            for _, item in ipairs(items) do
                test.is_true(seen[item.item_key] ~= true, "duplicate item " .. item.item_key)
                seen[item.item_key] = true
                test.is_true(item.payload.posted_epoch >= NOW - core.DEFAULT_BACKFILL, "item predates the default backfill")
            end
            -- 90 days back, two accounts, one row a day, days 0..90 inclusive.
            test.eq(#items, 2 * 91)
            test.eq(last.next_cursor.phase, "live")
        end)

        test.it("delivers a complete holdings pass with final coverage on the last page", function()
            local items, _, last = walk(core.SHAPE_HOLDINGS, 2)
            test.eq(#items, 3)
            test.eq(items[1].item_key, "simplefin:holding:ACT-3:CCC", "a position without an id is keyed by symbol, and pages sort by key")
            test.eq(last.coverage.mode, "complete")
            test.eq(last.coverage.final, true)
            test.eq(last.coverage.pass_key, "1")
            test.eq(last.next_cursor.offset, 0)
            local next_tick = core.pull({ cursor = last.next_cursor, config = {}, limit = 2 }, { shape = core.SHAPE_HOLDINGS }, deps(new_fake()))
            test.eq(next_tick.coverage.pass_key, "2")
            test.eq(next_tick.coverage.final, false)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
