local test = require("test")
local output = require("output")
local transport = require("transport")
local read_tool = require("read_tool")

local function define_tests()
    test.describe("SimpleFIN row envelopes", function()
        test.it("keeps every row with the aggregate total", function()
            local rows = {}
            for i = 1, 400 do rows[i] = { name = string.rep("x", 100), net_minor = i } end
            local aggregate = { inflow_minor = 123456, outflow_minor = -3325, net_minor = 120131, count = 71, pending_count = 2 }
            local result: any = output.rows({ total = aggregate }, "accounts", rows, {limit = 100, fields = {"*"}})
            test.eq(result.total.net_minor, 120131)
            test.eq(result.count, 100)
            test.eq(#result.accounts, 100)
            test.eq(result.next_cursor, "100")
        end)

        test.it("pages compact transactions and returns requested fields", function()
            local memo = string.rep("é memo ", 3000)
            local transactions = {}
            for i = 1, 300 do
                transactions[i] = { id = "TRN-" .. tostring(i), posted_epoch = i, amount_minor = -i,
                    description = "Coffee " .. tostring(i), payee = "Cafe", memo = memo }
            end
            local saved_connect, saved_accounts = transport.connect, transport.accounts
            transport.connect = function(): (any, any) return { access_url = "https://u:p@bridge" }, nil end
            transport.accounts = function(): any
                return { success = true, data = { errors = { "bank delayed" }, accounts = {
                    { id = "ACT-1", name = "Checking", currency = "USD", transactions = transactions, holdings = {} } } } }
            end
            local result: any, err = read_tool.handler({ action = "list_transactions", days = 30, limit = 2 })
            local next_page: any = read_tool.handler({action = "list_transactions", days = 30, limit = 2, cursor = result.next_cursor})
            local full: any = read_tool.handler({action = "list_transactions", days = 30, limit = 1, fields = {"memo"}})
            transport.connect, transport.accounts = saved_connect, saved_accounts
            test.is_nil(err)
            test.eq(result.count, 2)
            test.eq(next_page.transactions[1].id, "TRN-298")
            test.eq(full.transactions[1].memo, memo)
            test.eq(result.transactions[1].id, "TRN-300")
            test.is_nil(result.transactions[1].memo)
            test.is_nil(result.transactions[1].description)
            test.eq(result.transactions[1].payee, "Cafe")
            test.eq(result.transactions[1].account_name, "Checking")
            test.eq(result.warnings[1], "bank delayed")
        end)

        test.it("lists account summaries without nested holdings", function()
            local saved_connect, saved_snapshot = transport.connect, transport.snapshot
            transport.connect = function(): (any, any) return { access_url = "https://u:p@bridge" }, nil end
            transport.snapshot = function(): any
                return { success = true, data = { errors = {}, accounts = { {
                    id = "ACT-1", name = "Brokerage", currency = "USD", balance = "1500.00", balance_minor = 150000,
                    org = { domain = "bank.example", name = "Bank" }, transactions = {},
                    holdings = { { id = "H-1", symbol = "VTI", shares = "3", market_value = "750.00" } },
                } } } }
            end
            local result: any, err = read_tool.handler({ action = "list_accounts" })
            transport.connect, transport.snapshot = saved_connect, saved_snapshot
            test.is_nil(err)
            test.eq(result.accounts[1].org.domain, "bank.example")
            test.is_nil(result.accounts[1].holdings)
            test.is_nil(result.accounts[1].transactions)
            test.eq(result.accounts[1].balance_minor, 150000)
        end)

        test.it("fails with the typed transport error and returns the bridge rejection", function()
            local saved_connect, saved_accounts = transport.connect, transport.accounts
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "bridge unreachable" })
            transport.connect = function(): (any, any) return { access_url = "https://u:p@bridge" }, nil end
            transport.accounts = function(): (any?, error?) return nil, failure end
            local failed, failed_err = read_tool.handler({ action = "list_transactions", days = 30 })
            transport.accounts = function(): any return { success = false, error = "access revoked", code = "auth_expired", status_code = 403 } end
            local rejected: any = read_tool.handler({ action = "list_holdings" })
            transport.connect, transport.accounts = saved_connect, saved_accounts
            test.is_nil(failed)
            test.eq(failed_err, failure)
            test.is_false(rejected.success)
            test.eq(rejected.code, "auth_expired")
            test.eq(rejected.status_code, 403)
        end)
    end)
end

local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
