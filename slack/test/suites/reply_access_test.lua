local test = require("test")
local contract = require("contract")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")

local COMPONENT = uuid.v4()

local function probe(): any
    local def, get_err = contract.get("app.suites:reply_probe")
    test.is_nil(get_err)
    local instance, open_err = def:open("app.suites:reply_probe_binding", { component_id = COMPONENT })
    test.is_nil(open_err)
    return instance
end

local function define_tests()
    test.describe("Slack reply token boundary", function()
        test.before_all(function()
            local db = sql.get("app:db")
            test.not_nil(db)
            local private, encode_err = json.encode({ bot_token = "unreachable_test_token" })
            test.is_nil(encode_err)
            local _, insert_err = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { COMPONENT, "kickside.slack.connection:slack_connection", private })
            db:release()
            test.is_nil(insert_err)
        end)

        test.after_all(function()
            local db = sql.get("app:db")
            if db then
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { COMPONENT })
                db:release()
            end
        end)

        test.it("refuses outbound delivery without connection WRITE", function()
            local result, call_err = probe():run({ resource_id = "C1", content = "secret", outbound = true })
            test.is_nil(call_err)
            test.is_false(result.success)
            test.is_true(errors.is(result.error, errors.PERMISSION_DENIED), tostring(result.error))
        end)

        test.it("refuses a forged admission before bot-token use", function()
            local result, call_err = probe():run({ resource_id = "C1", content = "secret",
                reply_proof = { turn_id = "forged", seal = "forged", provider = "slack",
                    inbound_message_id = "in-1", principal = { kind = "transport", id = "slack.gateway" } } })
            test.is_nil(call_err)
            test.is_false(result.success)
            test.is_true(errors.is(result.error, errors.PERMISSION_DENIED)
                or errors.is(result.error, errors.UNAVAILABLE), tostring(result.error))
        end)
    end)
end

return { run = test.run_cases(define_tests) }
