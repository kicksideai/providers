local test = require("test")
local core = require("pull_core")
local protocol = require("protocol")

local DAY = 86400
local NOW = 1788393600 -- 2026-09-02T08:00:00Z

-- A fake transport injected through deps so the pull core never touches the
-- network. It records every accounts() call and answers a normalized set.
local function new_fake(): any
    local fake: any = { calls = {} }
    fake.answer = protocol.normalize_accounts({
        accounts = {
            {
                org = { name = "Chase Bank", domain = "www.chase.com" },
                id = "ACT-1", name = "Checking", currency = "USD",
                balance = "100.00", ["available-balance"] = "100.00", ["balance-date"] = NOW - 3600,
                transactions = {
                    { id = "T-1", posted = NOW - 2 * DAY, amount = "-10.00", description = "Coffee", payee = "Cafe" },
                    { id = "T-2", posted = NOW - DAY, amount = "25.00", description = "Refund", payee = "Store", pending = true },
                },
                holdings = {
                    { id = "H-1", symbol = "NVDA", shares = "1.5", market_value = "300.00", cost_basis = "200.00", created = NOW - 7200 },
                },
            },
            {
                org = { name = "Chase Bank" },
                id = "ACT-2", name = "Card", currency = "USD",
                balance = "-50.00", ["balance-date"] = NOW - 3600,
                transactions = {
                    { id = "T-1", posted = NOW - DAY, amount = "-5.00", description = "Same id, other account" },
                },
            },
        },
    })
    fake.result = { success = true, data = fake.answer }
    function fake.connect(_component_id: string?): (any, string?)
        return { component_id = "c1", base_url = "https://bridge/simplefin", authorization = "Basic x", access_url = "u" }, nil
    end
    function fake.accounts(_conn: any, opts: any): any
        fake.calls[#fake.calls + 1] = opts
        return fake.result
    end
    function fake.snapshot(_conn: any, now: number?): any
        fake.calls[#fake.calls + 1] = { snapshot = true, start_date = now }
        return fake.result
    end
    return fake
end

local function deps(fake: any): any
    return { transport = fake, component_id = "c1", now = NOW }
end

local function define_tests()
    test.describe("SimpleFIN transactions source", function()
        test.it("starts a backfill 90 days back in 31-day windows", function()
            local fake = new_fake()
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.is_true(page.success, page.error and page.error.message or "")
            local call = fake.calls[1]
            test.eq(call.start_date, NOW - core.DEFAULT_BACKFILL)
            test.eq(call.end_date, NOW - core.DEFAULT_BACKFILL + core.BACKFILL_WINDOW)
            test.eq(call.pending, true)
            test.eq(page.has_more, true)
            test.eq(page.next_cursor.phase, "backfill")
            test.eq(page.next_cursor.from, call.end_date)
        end)

        test.it("honors config.backfill_since and flips to live when the window reaches now", function()
            local fake = new_fake()
            local since = protocol.iso_utc(NOW - 10 * DAY)
            local page = core.pull({ cursor = nil, config = { backfill_since = since } }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(fake.calls[1].start_date, NOW - 10 * DAY)
            test.is_nil(fake.calls[1].end_date)
            test.eq(page.has_more, false)
            test.eq(page.next_cursor.phase, "live")
            test.eq(page.next_cursor.since, NOW - core.LIVE_OVERLAP)
        end)

        test.it("re-reads the overlap window while live", function()
            local fake = new_fake()
            local page = core.pull({ cursor = { phase = "live", since = NOW - 3 * DAY }, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(fake.calls[1].start_date, NOW - 3 * DAY)
            test.is_nil(fake.calls[1].end_date)
            test.eq(page.has_more, false)
            test.eq(page.next_cursor.since, NOW - core.LIVE_OVERLAP)
        end)

        test.it("emits one upsert per transaction keyed by account and id", function()
            local fake = new_fake()
            local page = core.pull({ cursor = { phase = "live" }, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(#page.items, 3)
            local first = page.items[1]
            test.eq(first.item_key, "simplefin:tx:ACT-1:T-1")
            test.eq(first.op, "upsert")
            test.eq(first.occurred_at, protocol.iso_utc(NOW - 2 * DAY))
            test.eq(first.payload.amount_minor, -1000)
            test.eq(first.payload.account_name, "Checking")
            test.eq(first.payload.institution.name, "Chase Bank")
            test.eq(first.payload.provider, "simplefin")
            test.is_nil(first.sort_time, "ordering helpers never leave the core")
            test.eq(page.items[3].item_key, "simplefin:tx:ACT-2:T-1", "the same bank id on another account is another item")
        end)

        test.it("changes the dedup key when a pending transaction posts", function()
            local pending = { account_id = "ACT-1", id = "T-2", posted_epoch = 1, amount = "25.00", pending = true }
            local posted = { account_id = "ACT-1", id = "T-2", posted_epoch = 2, amount = "25.00", pending = false }
            test.is_true(core.transaction_dedup(pending) ~= core.transaction_dedup(posted))
            test.eq(core.transaction_dedup(pending), core.transaction_dedup({ account_id = "ACT-1", id = "T-2", posted_epoch = 1, amount = "25.00", pending = true }))
        end)

        test.it("respects include_pending=false", function()
            local fake = new_fake()
            core.pull({ cursor = { phase = "live" }, config = { include_pending = false } }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(fake.calls[1].pending, false)
        end)

        test.it("carries a retry hint on an empty backfill window with more behind it", function()
            local fake = new_fake()
            fake.result = { success = true, data = protocol.normalize_accounts({ accounts = {} }) }
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(#page.items, 0)
            test.eq(page.has_more, true)
            test.not_nil(page.retry_after_ms)
        end)

        test.it("maps provider failures to scoped data errors", function()
            local fake = new_fake()
            fake.result = { success = false, error = "revoked", code = "auth_expired" }
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(page.success, false)
            test.eq(page.error.code, "auth_expired")
            test.eq(page.error.scope, "connection")

            fake.result = { success = false, error = "slow down", code = "rate_limited" }
            local limited = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(limited.error.code, "rate_limited")
            test.eq(limited.retry_after_ms, core.RATE_LIMIT_RETRY_MS)

            fake.result = { success = false, error = "500" }
            local other = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(other.error.code, "provider_error")
            test.eq(other.error.scope, "provider")
        end)

        test.it("fails as a connection error when the connection cannot be resolved", function()
            local fake = new_fake()
            function fake.connect(_id: string?): (any, string?) return nil, "no credential" end
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(page.success, false)
            test.eq(page.error.code, "auth_expired")
            test.eq(page.error.scope, "connection")
        end)

        test.it("enumerates the same keys for reconcile", function()
            local fake = new_fake()
            local page = core.pull_keys({ cursor = nil, config = { since = protocol.iso_utc(NOW - 3 * DAY) } }, {}, deps(fake))
            test.is_true(page.success)
            test.eq(#page.keys, 3)
            test.eq(page.keys[1].item_key, "simplefin:tx:ACT-1:T-1")
            test.not_nil(page.keys[1].dedup_key)
            test.eq(page.has_more, false)
        end)

        test.it("requires an explicit reconcile boundary", function()
            local fake = new_fake()
            local page = core.pull_keys({ cursor = nil, config = {} }, {}, deps(fake))
            test.eq(page.success, false)
            test.eq(page.error.code, "invalid_request")
            test.eq(page.error.scope, "flow")
            test.eq(#fake.calls, 0)
        end)

        test.it("enumerates since in 31-day windows with complete key coverage", function()
            local fake = new_fake()
            local since = NOW - 70 * DAY
            local first = core.pull_keys({ cursor = nil, config = { since = protocol.iso_utc(since) }, limit = 10 }, {}, deps(fake))
            test.eq(fake.calls[1].start_date, since)
            test.eq(fake.calls[1].end_date, since + core.BACKFILL_WINDOW)
            test.eq(first.coverage.mode, "complete")
            test.eq(first.coverage.scope_key, "simplefin:transactions:" .. tostring(since))
            test.eq(first.coverage.pass_key, first.coverage.scope_key)
            test.eq(first.coverage.final, false)
            local second = core.pull_keys({ cursor = first.next_cursor, config = {}, limit = 10 }, {}, deps(fake))
            test.eq(fake.calls[2].start_date, since + core.BACKFILL_WINDOW)
            test.eq(fake.calls[2].end_date, since + 2 * core.BACKFILL_WINDOW)
            test.eq(second.coverage.scope_key, first.coverage.scope_key)
        end)

        test.it("enumerates last_days through now and marks the final key page", function()
            local fake = new_fake()
            local page = core.pull_keys({ cursor = nil, config = { last_days = 10 }, limit = 2 }, {}, deps(fake))
            test.eq(fake.calls[1].start_date, NOW - 10 * DAY)
            test.is_nil(fake.calls[1].end_date)
            test.eq(page.coverage.final, false)
            local final = core.pull_keys({ cursor = page.next_cursor, config = {}, limit = 2 }, {}, deps(fake))
            test.eq(final.coverage.scope_key, page.coverage.scope_key)
            test.eq(final.coverage.pass_key, page.coverage.pass_key)
            test.eq(final.coverage.final, true)
            test.eq(final.has_more, false)
        end)
    end)

    test.describe("SimpleFIN paging", function()
        test.it("never exceeds the limit and continues inside the window by offset", function()
            local fake = new_fake()
            local first = core.pull({ cursor = { phase = "live" }, config = {}, limit = 2 }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(#first.items, 2)
            test.eq(first.has_more, true)
            test.eq(first.next_cursor.phase, "live")
            test.eq(first.next_cursor.offset, 2)
            test.eq(first.next_cursor.since, fake.calls[1].start_date, "the same window is re-read for the next slice")
            local second = core.pull({ cursor = first.next_cursor, config = {}, limit = 2 }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(#second.items, 1)
            test.eq(second.has_more, false)
            test.eq(second.next_cursor.phase, "live")
            test.is_nil(second.next_cursor.offset)
            test.is_true(first.items[1].item_key ~= second.items[1].item_key)
        end)

        test.it("orders a page by account, posting time and id", function()
            local fake = new_fake()
            local page = core.pull({ cursor = { phase = "live" }, config = {}, limit = 10 }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(page.items[1].item_key, "simplefin:tx:ACT-1:T-1")
            test.eq(page.items[2].item_key, "simplefin:tx:ACT-1:T-2")
            test.eq(page.items[3].item_key, "simplefin:tx:ACT-2:T-1")
        end)

        test.it("pages a snapshot and marks only the last page final", function()
            local fake = new_fake()
            local first = core.pull({ cursor = nil, config = {}, limit = 1 }, { shape = core.SHAPE_BALANCES }, deps(fake))
            test.eq(#first.items, 1)
            test.eq(first.has_more, true)
            test.eq(first.coverage.final, false)
            test.eq(first.coverage.pass_key, "1")
            test.eq(first.next_cursor.offset, 1)
            local second = core.pull({ cursor = first.next_cursor, config = {}, limit = 1 }, { shape = core.SHAPE_BALANCES }, deps(fake))
            test.eq(#second.items, 1)
            test.eq(second.has_more, false)
            test.eq(second.coverage.final, true)
            test.eq(second.coverage.pass_key, "1", "both pages belong to one pass")
            test.eq(second.next_cursor.tick, 1)
            test.eq(second.next_cursor.offset, 0)
        end)

        test.it("clamps the limit to the provider maximum", function()
            local fake = new_fake()
            local page = core.pull({ cursor = { phase = "live" }, config = {}, limit = 0 }, { shape = core.SHAPE_TRANSACTIONS }, deps(fake))
            test.eq(#page.items, 1)
        end)
    end)

    test.describe("SimpleFIN balances source", function()
        test.it("snapshots every account with a transaction-free read that keeps holdings", function()
            local fake = new_fake()
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_BALANCES }, deps(fake))
            test.eq(fake.calls[1].snapshot, true)
            test.eq(fake.calls[1].start_date, NOW)
            test.eq(#page.items, 2)
            test.eq(page.items[1].item_key, "simplefin:account:ACT-1")
            test.eq(page.items[1].payload.balance_minor, 10000)
            test.eq(page.items[1].payload.holdings_count, 1)
            test.eq(page.items[2].payload.balance_minor, -5000)
            test.eq(page.has_more, false)
            test.eq(page.next_cursor.tick, 1)
            test.eq(page.next_cursor.offset, 0)
            test.eq(page.coverage.mode, "complete")
            test.eq(page.coverage.pass_key, "1")
            test.eq(page.coverage.scope_key, "global")
            test.eq(page.coverage.final, true)
            test.eq(page.items[1].payload.provider, "simplefin")
            test.eq(page.items[1].payload.institution.name, "Chase Bank")
            local again = core.pull({ cursor = page.next_cursor, config = {} }, { shape = core.SHAPE_BALANCES }, deps(fake))
            test.eq(again.next_cursor.tick, 2)
            test.eq(again.items[1].dedup_key, page.items[1].dedup_key, "an unchanged balance keeps its dedup key")
        end)
    end)

    test.describe("SimpleFIN holdings source", function()
        test.it("snapshots every position with its account context", function()
            local fake = new_fake()
            local page = core.pull({ cursor = nil, config = {} }, { shape = core.SHAPE_HOLDINGS }, deps(fake))
            test.eq(fake.calls[1].snapshot, true)
            test.eq(#page.items, 1)
            local item = page.items[1]
            test.eq(item.item_key, "simplefin:holding:ACT-1:H-1")
            test.eq(item.payload.symbol, "NVDA")
            test.eq(item.payload.quantity, "1.5")
            test.eq(item.payload.market_value_minor, 30000)
            test.eq(item.payload.account_name, "Checking")
            test.eq(item.payload.as_of, protocol.iso_utc(NOW - 7200))
            test.is_true(item.dedup_key:find("300.00", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
