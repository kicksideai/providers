local test = require("test")
local protocol = require("protocol")
local core = require("core")
local base64 = require("base64")

local NOW = 1791244800
local function fixture(): any
    local set, err = protocol.normalize_accounts({ accounts = { {
        id = "northwind", name = "Northwind checking", currency = "USD", balance = "18425.50",
        ["available-balance"] = "18376.81", ["balance-date"] = NOW - 60,
        org = { name = "Northwind bank" },
        transactions = { { id = "packing", posted = NOW - 3600, amount = "-48.69", description = "Packing materials", pending = false } },
        holdings = { { id = "fund", symbol = "NWF", shares = "12.50", market_value = "625.00", cost_basis = "562.50" } },
    } } })
    test.is_nil(err)
    local transport: any = {}
    function transport.connect(id: string?): (any, string?)
        test.eq(id, "connection-northwind")
        return { component_id = id }, nil
    end
    function transport.accounts(_conn: any, _opts: any): any return { success = true, data = set } end
    function transport.snapshot(_conn: any, _now: number?): any return { success = true, data = set } end
    return { transport = transport, component_id = "connection-northwind", now = NOW }
end

local function define_tests()
    test.describe("SimpleFIN provider intent", function()
        test.it("accepts a setup token and derives Basic credentials from the claimed access URL", function()
            local claim_url = "https://bridge.example.invalid/simplefin/claim/northwind"
            local token, encode_err = base64.encode(claim_url)
            test.is_nil(encode_err)
            local decoded, decode_err = protocol.decode_setup_token(token)
            test.is_nil(decode_err)
            test.eq(decoded, claim_url)
            local parts, parse_err = protocol.parse_access_url("https://northwind:fictional%3Abank@bridge.example.invalid/simplefin")
            test.is_nil(parse_err)
            test.eq(parts.base_url, "https://bridge.example.invalid/simplefin")
            local credentials, credentials_err = base64.decode(parts.authorization:sub(7))
            test.is_nil(credentials_err)
            test.eq(credentials, "northwind:fictional:bank")
        end)
        test.it("refuses malformed credentials with typed invalid errors", function()
            local _, empty_err = protocol.decode_setup_token("")
            test.is_true(errors.is(empty_err, errors.INVALID))
            local _, base64_err = protocol.decode_setup_token("%%%not-base64%%%")
            test.is_true(errors.is(base64_err, errors.INVALID))
            local kind, _, classify_err = protocol.classify_credential("garbage")
            test.is_nil(kind)
            test.is_true(errors.is(classify_err, errors.INVALID))
            local _, access_err = protocol.parse_access_url("https://bridge.example.invalid/simplefin")
            test.is_true(errors.is(access_err, errors.INVALID))
        end)
        test.it("delivers transaction cents, account context and stable source identity", function()
            local page = core.pull({ limit = 10, config = { backfill_since = protocol.iso_utc(NOW - 86400) } },
                { shape = core.SHAPE_TRANSACTIONS }, fixture())
            test.is_true(page.success)
            test.eq(#page.items, 1)
            local item = page.items[1]
            test.eq(item.item_key, "simplefin:tx:northwind:packing")
            test.eq(item.payload.amount_minor, -4869)
            test.eq(item.payload.account_id, "northwind")
            test.eq(item.payload.institution.name, "Northwind bank")
            test.eq(item.payload.provider, "simplefin")
            test.is_false(page.has_more)
            test.eq(page.next_cursor.phase, "live")
        end)
        test.it("delivers complete balance and holding snapshots with reconcile identities", function()
            for _, shape in ipairs({ core.SHAPE_BALANCES, core.SHAPE_HOLDINGS }) do
                local deps = fixture()
                local page = core.pull({ limit = 10 }, { shape = shape }, deps)
                test.is_true(page.success)
                test.eq(#page.items, 1)
                test.eq(page.coverage.mode, "complete")
                test.is_true(page.coverage.final)
                test.is_false(page.has_more)
                if shape == core.SHAPE_BALANCES then
                    test.eq(page.items[1].payload.balance_minor, 1842550)
                    test.eq(page.items[1].payload.available_minor, 1837681)
                else
                    test.eq(page.items[1].payload.market_value_minor, 62500)
                    test.eq(page.items[1].payload.cost_basis_minor, 56250)
                    test.eq(page.items[1].payload.quantity, "12.50")
                end
                local keys = core.pull_keys({ limit = 10 }, { shape = shape }, deps)
                test.is_true(keys.success)
                test.eq(keys.keys[1].item_key, page.items[1].item_key)
                test.eq(keys.keys[1].dedup_key, page.items[1].dedup_key)
                test.is_true(keys.coverage.final)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
