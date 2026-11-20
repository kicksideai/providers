-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
local sql = require("sql")

local M = {}

-- Register through the public services so Component captures the owner and grants
-- access to this component, and Core registers the declared primary-thread slots.
function M.create(user_id, component_id, descriptor)
    local db = assert(sql.get("app:db"))
    assert(db:execute("INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'!fixture')",
        {user_id, user_id .. "@test.invalid"}))
    assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,'app:user')", {user_id}))
    db:release()
    local actor = assert(security.new_actor(user_id, {security_groups = {"app:user"}}))
    local scope = assert(security.named_scope("wippy.security:process"))
    local service = assert(contract.get("kickside.component:component_service"))
    local components = assert(service:with_actor(actor):with_scope(scope):open())
    local result = assert(components:register({component_id = component_id, impl_id = "app:source_fixture_component"}))
    assert(result.success, tostring(result.error))
    local definition = assert(contract.get("kickside.core:threads"))
    local threads = assert(definition:with_actor(actor):with_scope(scope):open())
    assert(threads:ensure_thread({component_id = component_id, impl_id = descriptor or "app:source_fixture_component"}))
    return threads
end

function M.cleanup(db, user_id, component_id)
    assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", {component_id}))
    assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", {component_id}))
    assert(db:execute("DELETE FROM app_user_groups WHERE user_id=$1", {user_id}))
    assert(db:execute("DELETE FROM app_users WHERE user_id=$1", {user_id}))
end

return M
