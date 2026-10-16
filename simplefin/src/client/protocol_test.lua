local test = require("test")
local base64 = require("base64")
local protocol = require("protocol")

local CLAIM_URL = "https://beta-bridge.simplefin.org/simplefin/claim/ABC123"
local ACCESS_URL = "https://0677AA:2CF1BB@beta-bridge.simplefin.org/simplefin"

local function token(url: string): string
    return base64.encode(url) :: string
end

local function define_tests()
    test.describe("SimpleFIN credentials", function()
        test.it("decodes a setup token into its claim URL", function()
            local url, err = protocol.decode_setup_token(" " .. token(CLAIM_URL) .. "\n")
            test.is_nil(err)
            test.eq(url, CLAIM_URL)
        end)

        test.it("rejects a token that is not base64 of a claim URL", function()
            local _, err = protocol.decode_setup_token(token("https://example.com/not-a-claim"))
            test.is_true(errors.is(err, errors.INVALID))
            local _, err2 = protocol.decode_setup_token("%%%not-base64%%%")
            test.is_true(errors.is(err2, errors.INVALID))
            local _, err3 = protocol.decode_setup_token("")
            test.is_true(errors.is(err3, errors.INVALID))
        end)

        test.it("recognizes an access URL by its userinfo", function()
            test.is_true(protocol.is_access_url(ACCESS_URL))
            test.is_true(not protocol.is_access_url(CLAIM_URL))
            test.is_true(not protocol.is_access_url("https://user@host/simplefin"))
        end)

        test.it("classifies pasted credentials", function()
            local kind = protocol.classify_credential(ACCESS_URL)
            test.eq(kind, "access_url")
            local kind2, value2 = protocol.classify_credential(" " .. token(CLAIM_URL))
            test.eq(kind2, "setup_token")
            test.eq(value2, token(CLAIM_URL))
            local kind3, _, err3 = protocol.classify_credential("garbage")
            test.is_nil(kind3)
            test.is_true(errors.is(err3, errors.INVALID))
        end)

        test.it("splits an access URL into base and Basic authorization", function()
            local parts, err = protocol.parse_access_url(ACCESS_URL .. "/")
            test.is_nil(err)
            test.eq(parts.base_url, "https://beta-bridge.simplefin.org/simplefin")
            test.eq(parts.authorization, "Basic " .. (base64.encode("0677AA:2CF1BB") :: string))
        end)

        test.it("percent-decodes userinfo before encoding it", function()
            local parts = protocol.parse_access_url("https://us%3Aer:p%40ss@host/simplefin")
            test.eq(parts.authorization, "Basic " .. (base64.encode("us:er:p@ss") :: string))
        end)
    end)

    test.describe("SimpleFIN amounts and time", function()
        test.it("converts decimal strings to minor units without floats", function()
            test.eq(protocol.amount_minor("-48.69"), -4869)
            test.eq(protocol.amount_minor("14661.40"), 1466140)
            test.eq(protocol.amount_minor("0.68"), 68)
            test.eq(protocol.amount_minor("5"), 500)
            test.eq(protocol.amount_minor("-.5"), -50)
            test.eq(protocol.amount_minor("1.999"), 199)
            test.eq(protocol.amount_minor("+12.30"), 1230)
            test.is_nil(protocol.amount_minor("abc"))
            test.is_nil(protocol.amount_minor(nil))
        end)

        test.it("formats epochs as RFC3339 UTC and reads them back", function()
            test.eq(protocol.iso_utc(0), "1970-01-01T00:00:00Z")
            test.eq(protocol.iso_utc(1788177600), "2026-08-31T12:00:00Z")
            test.eq(protocol.iso_utc(1788177600000), "2026-08-31T12:00:00Z")
            test.eq(protocol.to_epoch("2026-08-29T20:00:00Z"), 1788033600)
            test.eq(protocol.to_epoch("2026-08-29"), 1787961600)
            test.eq(protocol.to_epoch("2026-08-29T22:00:00+02:00"), 1788033600)
            test.eq(protocol.to_epoch(1788177600000), 1788177600)
            test.is_nil(protocol.to_epoch("yesterday"))
        end)
    end)

    test.describe("SimpleFIN requests", function()
        test.it("builds the accounts query with protocol spellings", function()
            local q = protocol.accounts_query({ start_date = 1700000000, end_date = 1700086400.9, pending = true, balances_only = true, account_id = "ACT-1 2" })
            test.eq(q, "?start-date=1700000000&end-date=1700086400&pending=1&balances-only=1&account=ACT-1%202")
            test.eq(protocol.accounts_query({ start_date = 1700000000 }), "?start-date=1700000000", "a snapshot read is a start-date with no balances-only")
            test.eq(protocol.accounts_query({}), "")
            test.eq(protocol.accounts_query(nil), "")
        end)

        test.it("maps HTTP failures to data error codes", function()
            local _, code403 = protocol.http_error(403, "")
            test.eq(code403, "auth_expired")
            local msg402, code402 = protocol.http_error(402, "")
            test.eq(code402, "provider_error")
            test.is_true(msg402:find("payment", 1, true) ~= nil, msg402)
            local _, code429 = protocol.http_error(429, "")
            test.eq(code429, "rate_limited")
            local msg500, code500 = protocol.http_error(500, "boom")
            test.eq(code500, "provider_error")
            test.is_true(msg500:find("boom", 1, true) ~= nil, msg500)
        end)
    end)

    test.describe("SimpleFIN answer normalization", function()
        local raw = {
            errors = { "Connection to Chase may need attention", { msg = "structured" } },
            accounts = {
                {
                    org = { domain = "www.chase.com", name = "Chase Bank", ["sfin-url"] = "https://beta-bridge.simplefin.org/simplefin" },
                    id = "ACT-1", name = "CPC CHECKING (9587)", currency = "USD",
                    balance = "93573.62", ["available-balance"] = "93573.62", ["balance-date"] = 1788326192,
                    transactions = {
                        { id = "TRN-1", posted = 1788177600, amount = "-2.99", description = "APPLE.COM/BILL", payee = "Apple", memo = "", transacted_at = 1788004800, mcc = nil },
                        { id = "TRN-2", posted = 1788300000, amount = "43.50", description = "Deposit", payee = "Zelle", pending = true },
                    },
                    holdings = {
                        { id = "H-1", symbol = "NVDA", description = "NVIDIA Corp", shares = "103.427", market_value = "23210.05", cost_basis = "12596.48", purchase_price = "0.00", currency = "USD", created = 1788382055 },
                        { symbol = "QCPCM", description = "Sweep", shares = "1", market_value = "1.00", cost_basis = "0.00", currency = "USD" },
                    },
                },
                { id = "ACT-2", name = "Empty", currency = "USD", balance = "0.00", ["balance-date"] = 1788326192 },
            },
        }

        test.it("normalizes accounts, transactions and holdings", function()
            local set, err = protocol.normalize_accounts(raw)
            test.is_nil(err)
            test.eq(#set.errors, 2)
            test.eq(set.errors[2], "structured")
            test.eq(#set.accounts, 2)
            local a = set.accounts[1]
            test.eq(a.id, "ACT-1")
            test.eq(a.institution.name, "Chase Bank")
            test.eq(a.institution.sfin_url, "https://beta-bridge.simplefin.org/simplefin")
            test.eq(a.balance_minor, 9357362)
            test.eq(a.balance_at, "2026-09-02T05:16:32Z")
            test.eq(a.balance_epoch, 1788326192)
            test.eq(#a.transactions, 2)
            test.eq(a.transactions[1].account_id, "ACT-1")
            test.eq(a.transactions[1].amount_minor, -299)
            test.eq(a.transactions[1].posted_at, "2026-08-31T12:00:00Z")
            test.eq(a.transactions[1].posted_epoch, 1788177600)
            test.eq(a.transactions[1].transacted_at, protocol.iso_utc(1788004800))
            test.is_nil(a.transactions[1].category_code)
            test.eq(a.transactions[1].pending, false)
            test.eq(a.transactions[2].pending, true)
            test.eq(#a.holdings, 2)
            test.eq(a.holdings[1].market_value_minor, 2321005)
            test.eq(a.holdings[1].as_of, "2026-09-02T20:47:35Z")
            test.eq(a.holdings[1].quantity, "103.427")
            test.eq(a.holdings[2].id, "QCPCM", "a holding without an id falls back to its symbol")
            local b = set.accounts[2]
            test.eq(#b.transactions, 0)
            test.eq(#b.holdings, 0)
        end)

        test.it("rejects answers that are not account sets", function()
            local _, err = protocol.normalize_accounts("nope")
            test.not_nil(err)
            local _, err2 = protocol.normalize_accounts({ accounts = "x" })
            test.not_nil(err2)
            local set = protocol.normalize_accounts({})
            test.eq(#set.accounts, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
