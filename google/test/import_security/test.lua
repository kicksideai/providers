-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local sql = require("sql")
local uuid = require("uuid")
local connection_manager = require("connection_manager")

local function seed(): (any?, error?)
    return connection_manager.register_authorized_connection({provider_name = "google", connection_name = "Import fixture",
        oauth_connection = {access_token = "local-import-fixture", scopes_granted = "", connection_state = "connected", token_type = "Bearer"},
        user_context = {}})
end

local function caller(actor: any, writable: boolean): any
    local policies = {assert(security.policy("app.import_security:caller"))}
    if writable then policies[#policies + 1] = assert(security.policy("app.import_security:writer")) end
    return funcs.new():with_actor(actor):with_scope(assert(security.new_scope(policies)))
end

local function rows(): any
    local db = assert(sql.get("app:db"))
    local result, err = db:query("SELECT actor_id, step, can_write, can_unrelated FROM google_import_identity ORDER BY seq", {})
    db:release()
    test.is_nil(err, tostring(err))
    return result
end

local run = test.run_cases(function()
        test.describe("Registered Google Sheets import identity", function()
            test.it("passes the restricted caller to store contracts and refuses writes without permission", function()
                local db = assert(sql.get("app:db"))
                test.is_nil(select(2, db:execute("CREATE TABLE IF NOT EXISTS google_import_identity (seq INTEGER, actor_id TEXT, step TEXT, can_write INTEGER, can_unrelated INTEGER)", {})))
                test.is_nil(select(2, db:execute("DELETE FROM google_import_identity", {})))
                db:release()
                local actor = security.new_actor("sheets-import-" .. uuid.v7(), {})
                local connection, seed_err = funcs.new():with_actor(actor):with_scope(security.named_scope("wippy.security:process"))
                    :call("app.import_security:seed", {})
                test.is_nil(seed_err, tostring(seed_err))
                test.not_nil(connection)
                local input = {spreadsheet = "sales-id", range = "Sales!A1:A2", dataset = {code = "demo_sales", title = "Demo sales"}, mode = "replace"}
                local result, err = caller(actor, true):call("kickside.google.traits:sheets_import_tool", input)
                test.is_nil(err, tostring(err))
                test.is_true(result.success, tostring(result.error))
                test.eq(result.rows, 1)
                local observed = rows()
                test.eq(#observed, 4)
                for index, step in ipairs({"define", "begin", "append", "commit"}) do
                    test.eq(observed[index].step, step)
                    test.eq(observed[index].actor_id, actor:id())
                    test.eq(observed[index].can_write, 1)
                    test.eq(observed[index].can_unrelated, 0)
                end
                local denied, denied_err = caller(actor, false):call("kickside.google.traits:sheets_import_tool", input)
                test.is_nil(denied)
                test.is_true(errors.is(denied_err, errors.PERMISSION_DENIED), tostring(denied_err))
                test.eq(#rows(), 4, "A caller without store permission must write nothing")
                local stranger = security.new_actor("sheets-stranger-" .. uuid.v7(), {})
                local unconnected, connection_err = caller(stranger, true):call("kickside.google.traits:sheets_import_tool", input)
                test.is_nil(unconnected)
                test.not_nil(connection_err)
                test.eq(#rows(), 4, "A caller without connection access must write nothing")
            end)
        end)
end)

return {run = run, seed = seed}
