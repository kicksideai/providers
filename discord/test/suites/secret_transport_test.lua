-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local contract = require("contract")
local security = require("security")
local registry = require("registry")
local sql = require("sql")
local uuid = require("uuid")
local MODULE = "discord"
local OWNER = "transport-owner-" .. uuid.v4()
local ID
local function caller(actor_id: string): any
    local policies = {assert(security.policy("app.suites:secret_transport_calls")),
        assert(security.policy("app.suites:secret_transport_storage")),
        assert(security.policy("kickside.component.security:module_runtime")),
        assert(security.policy("kickside.component.security:module_access")),
        assert(security.policy("kickside." .. MODULE .. ".security:module_access")),
        assert(security.policy("kickside." .. MODULE .. ".security:module_runtime"))}
    local entry = assert(registry.get("kickside." .. MODULE .. ".connection:send_reply"))
    for _, id in ipairs(entry.data.security.policies) do
        policies[#policies + 1] = assert(security.policy(id))
    end
    local def = assert(contract.get("app.suites:secret_transport_contract"))
    return assert(def:with_actor(security.new_actor(actor_id, {}))
        :with_scope(security.new_scope(policies))
        :open("app.suites:secret_transport_binding", {component_id = ID}))
end
return {run = test.run_cases(function()
    test.describe("discord restricted credential transport", function()
        test.before_all(function()
            local def = assert(contract.get("kickside.component:component_service"))
            local svc = assert(def:with_actor(security.new_actor(OWNER, {}))
                :with_scope(security.new_scope({assert(security.policy("app:user"))})):open())
            local result = svc:register({impl_id = "kickside." .. MODULE .. ".connection:" .. MODULE .. "_connection",
                private_context = {bot_token = "transport-secret-sentinel", app_token = "app-secret-sentinel"}})
            test.is_true(result.success, tostring(result.error))
            ID = result.component_id
            local db = assert(sql.get("app:db"))
            local rows = assert(db:query("SELECT private_context, encrypted_secrets FROM kickside_components WHERE component_id=$1", {ID}))
            test.is_nil(select(2, db:release()))
            test.is_nil((rows[1].private_context:find("transport-secret-sentinel", 1, true)))
            test.not_nil(rows[1].encrypted_secrets)
        end)
        test.after_all(function()
            if not ID then return end
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("DELETE FROM kickside_job WHERE owner_kind='component' AND owner_id=$1", {ID})))
            test.is_nil(select(2, db:execute("DELETE FROM kickside_components WHERE component_id=$1", {ID})))
            test.is_nil(select(2, db:release()))
        end)
        test.it("reads encrypted credentials under the owning entry policies", function()
            local result, err = caller(OWNER):run({read = true, component_id = ID})
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            test.is_true(result.credential_matches)
        end)
        test.it("sends under the owning entry policies and connection WRITE", function()
            local result, err = caller(OWNER):run({})
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
            test.eq(result.message_ref, "receipt")
        end)
        test.it("refuses a stranger under the same entry policies", function()
            local result, err = caller("transport-stranger"):run({})
            test.is_nil(err)
            test.is_false(result.success)
        end)
        test.it("refuses writes after connection authority becomes READ only", function()
            local db = assert(sql.get("app:db"))
            test.is_nil(select(2, db:execute("UPDATE kickside_component_access SET access_mask=1 WHERE component_id=$1", {ID})))
            test.is_nil(select(2, db:release()))
            local result, err = caller(OWNER):run({})
            test.is_nil(err)
            test.is_false(result.success)
            result, err = caller(OWNER):run({read = true, component_id = ID})
            test.is_nil(err)
            test.is_true(result.success, tostring(result.error))
        end)
    end)
end)}
