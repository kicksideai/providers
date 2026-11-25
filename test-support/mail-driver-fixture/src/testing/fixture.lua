-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local provision = require("provision")
local identity = require("identity")

local M = {}

local function member_executor(actor, groups)
    local authority = assert(funcs.call("kickside.security.runtime:resolve_groups", {groups = groups}))
    local scope = assert(identity.scope_from_groups(authority.groups, authority.policy_ids))
    return assert(funcs.new():with_actor(actor):with_scope(scope))
end

function M.delivery_admin()
    local groups = {"app:user", "kickside.mail_driver_fixture.testing:delivery_admins"}
    local actor = assert(security.new_actor(uuid.v4(), {security_groups = groups}))
    return member_executor(actor, groups)
end

function M.user(id, can_send)
    id = id or uuid.v4()
    local db = assert(sql.get("app:db"))
    assert(db:execute([[INSERT INTO app_users (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], {id, id .. "@example.org"}))
    local groups = {"app:user"}
    if can_send ~= false then
        groups[#groups + 1] = "app:mail_senders"
        groups[#groups + 1] = "app:uploaders"
    end
    for _, group in ipairs(groups) do
        assert(db:execute("INSERT INTO app_user_groups (user_id,group_id) VALUES ($1,$2)", {id, group}))
    end
    assert(db:release())
    local actor = assert(security.new_actor(id, {security_groups = groups}))
    assert(provision.ensure_user(actor, assert(security.named_scope("wippy.security:process")), id))
    return member_executor(actor, groups)
end

function M.admin(id)
    local actor = assert(security.new_actor(id or uuid.v4(), {}))
    return assert(funcs.new():with_actor(actor):with_scope(assert(security.named_scope("wippy.security:process"))))
end

function M.scoped(policy_ids)
    local actor = assert(security.new_actor(uuid.v4()))
    local policies = {assert(security.policy("app:test_scope"))}
    for _, id in ipairs(policy_ids) do
        policies[#policies + 1] = assert(security.policy(id))
    end
    return assert(funcs.new():with_actor(actor):with_scope(assert(security.new_scope(policies))))
end

function M.probe(actor, action, args)
    local request = args or {}
    request.action = action
    return actor:call("app:actor_probe", request)
end

function M.await_message(actor, id, matches)
    local deadline = time.now():add(25 * time.SECOND):unix_nano()
    local entry
    repeat
        entry = assert(M.probe(actor, "get_message", {message_id = id}))
        if matches(entry) then return entry end
        time.sleep("25ms")
    until time.now():unix_nano() >= deadline
    error("Mail did not reach the expected state")
end

function M.terminal(actor, id)
    local entry = M.await_message(actor, id, function(message) return message.status ~= "queued" end)
    if entry.status == "failed" then error(entry.last_error.code .. ": " .. entry.last_error.message) end
    return entry
end

return M
