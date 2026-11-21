-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local contract = require("contract")
local security = require("security")
local sql = require("sql")

local M = {}

local function owner_context(user_id)
    local actor = assert(security.new_actor(user_id, {security_groups = {"app:user"}}))
    local scope = assert(security.named_scope("wippy.security:process"))
    return actor, scope
end

-- Register through Component so fixtures receive the same stored execution
-- identity and owner access as normal component creation.
function M.register(user_id, component_id, impl_id, meta)
    local actor, scope = owner_context(user_id)
    local service = assert(contract.get("kickside.component:component_service"))
    local components = assert(service:with_actor(actor):with_scope(scope):open())
    return components:register({component_id = component_id, impl_id = impl_id, meta = meta})
end

-- Provision the installed primary-thread declarations through Core.
function M.create(user_id, component_id, descriptor, impl_id)
    local db = assert(sql.get("app:db"))
    assert(db:execute("INSERT INTO app_users (user_id,email,password_hash) VALUES ($1,$2,'!fixture')",
        {user_id, user_id .. "@test.invalid"}))
    assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,'app:user')", {user_id}))
    db:release()
    local result = assert(M.register(user_id, component_id, impl_id or "app:source_fixture_component"))
    assert(result.success, tostring(result.error))
    local actor, scope = owner_context(user_id)
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
