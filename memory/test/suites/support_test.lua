-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function fails_read(table_name: string, column: string, fn: any)
    local db = fixture.db()
    local _, setup_err = db:execute("ALTER TABLE " .. table_name .. " RENAME COLUMN " .. column .. " TO app_broken_column")
    db:release()
    test.is_nil(setup_err, tostring(setup_err))
    local ok, failure = pcall(fn)
    db = fixture.db()
    local _, restore_err = db:execute("ALTER TABLE " .. table_name .. " RENAME COLUMN app_broken_column TO " .. column)
    db:release()
    test.is_nil(restore_err, tostring(restore_err))
    test.is_false(ok, "A failed helper observation returns success")
    test.is_true(tostring(failure):find("column", 1, true) ~= nil, tostring(failure))
end

local function fails_write(table_name: string, operation: string, fn: any)
    local db = fixture.db()
    local sqlite = db:type() == "sqlite"
    if not sqlite then
        local _, err = db:execute([[CREATE FUNCTION app_support_reject_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
            RAISE EXCEPTION 'support write rejected'; END $$]])
        test.is_nil(err, tostring(err))
    end
    local _, trigger_err = db:execute(sqlite and
        ("CREATE TRIGGER app_support_reject BEFORE " .. operation .. " ON " .. table_name .. " BEGIN SELECT RAISE(ABORT, 'support write rejected'); END") or
        ("CREATE TRIGGER app_support_reject BEFORE " .. operation .. " ON " .. table_name .. " FOR EACH ROW EXECUTE FUNCTION app_support_reject_fn()"))
    db:release()
    test.is_nil(trigger_err, tostring(trigger_err))
    local ok, failure = pcall(fn)
    db = fixture.db()
    local _, drop_err = db:execute(sqlite and "DROP TRIGGER app_support_reject" or ("DROP TRIGGER app_support_reject ON " .. table_name))
    test.is_nil(drop_err, tostring(drop_err))
    if not sqlite then
        local _, err = db:execute("DROP FUNCTION app_support_reject_fn()")
        test.is_nil(err, tostring(err))
    end
    db:release()
    test.is_false(ok, "A failed helper mutation returns success")
    test.is_true(tostring(failure):find("support write rejected", 1, true) ~= nil, tostring(failure))
end

local function define_tests()
    test.describe("test support database failures", function()
        test.before_each(function() fixture.script.reset(); fixture.history.ensure() end)
        test.it("raises request prompt pending and history read errors", function()
            fails_read("app_llm_requests", "schema", function() fixture.script.requests("structured_output") end)
            fails_read("app_llm_requests", "messages", function() fixture.script.prompts("structured_output") end)
            fails_read("app_llm_script", "method", function() fixture.script.pending("structured_output") end)
            fails_read("app_history", "content", function() fixture.history.get_history({ host = { session_id = "read-failure" } }) end)
        end)
        test.it("raises script reset dequeue and record write errors", function()
            fixture.script.respond("structured_output", { items = {}, plans = {}, lessons = {} })
            fails_write("app_llm_script", "DELETE", function() fixture.script.reset() end)
            fails_write("app_llm_script", "DELETE", function() fixture.script.take("structured_output") end)
            fails_write("app_llm_requests", "INSERT", function() fixture.script.record("structured_output", {}, {}) end)
        end)
        test.it("raises history and user setup write errors", function()
            fails_write("app_history", "INSERT", function() fixture.history.record("write-failure", { { id = "e", role = "user", content = "Evidence." } }) end)
            fails_write("app_users", "INSERT", function() fixture.user() end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
