-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local security = require("security")
local funcs = require("funcs")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local events = require("events")
local fs = require("fs")
local provision = require("provision")
local identity = require("identity")

local M = {}

local function member_executor(actor, groups)
    local authority = assert(funcs.call("kickside.security.runtime:resolve_groups", {groups = groups}))
    local scope = assert(identity.scope_from_groups(authority.groups, authority.policy_ids))
    return assert(funcs.new():with_actor(actor):with_scope(scope))
end

function M.member(group)
    local groups = {"test.mail_driver_fixture.host:user", group}
    local actor = assert(security.new_actor(uuid.v4(), {security_groups = groups}))
    return member_executor(actor, groups)
end

function M.delivery_admin()
    return M.member("test.mail_driver_fixture.testing:delivery_admins")
end

function M.user(id, can_send)
    id = id or uuid.v4()
    local db = assert(sql.get("test.mail_driver_fixture.host:db"))
    assert(db:execute([[INSERT INTO app_users (user_id,email,full_name,password_hash,status)
        VALUES ($1,$2,$1,'test-only','active')]], {id, id .. "@example.org"}))
    local groups = {"test.mail_driver_fixture.host:user"}
    if can_send ~= false then
        groups[#groups + 1] = "test.mail_driver_fixture.host:mail_senders"
        groups[#groups + 1] = "test.mail_driver_fixture.host:uploaders"
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
    local policies = {assert(security.policy("test.mail_driver_fixture.host:test_scope"))}
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

local function await_change(topic, read, pending)
    local subscription = assert(events.subscribe("mail.driver.fixture", topic))
    local changes = subscription:channel()
    local deadline = assert(time.after("25s"))
    local result, err = read()
    while pending(result, err) do
        local wake = channel.select({changes:case_receive(), deadline:case_receive()})
        result, err = read()
        if wake.channel == deadline then break end
    end
    subscription:close()
    return result, err
end

function M.await_initial_publication()
    local signals = assert(fs.get("test.mail_driver_fixture.testing:signals"))
    local published, err = await_change("mail.library", function()
        return signals:exists("library")
    end, function(result, read_err)
        return not result and not read_err
    end)
    assert(published, err and tostring(err) or "Mail never announced its initial library publication")
end

function M.await_publication(editor, request)
    local result, err = await_change("mail.library", function()
        return M.probe(editor, "preview_template", {request = request})
    end, function(_, err)
        local details = err and err:details()
        return details and details.code == "mail_library_publishing"
    end)
    return assert(result, tostring(err))
end

function M.await_message(actor, id, matches)
    local result, err = await_change("mail.activity", function()
        return M.probe(actor, "get_message", {message_id = id})
    end, function(entry)
        return entry and not matches(entry)
    end)
    assert(result, tostring(err))
    assert(matches(result), "Mail did not reach the expected state: " .. id)
    return result
end

function M.terminal(actor, id)
    local entry = M.await_message(actor, id, function(message) return message.status ~= "queued" end)
    if entry.status == "failed" then error(entry.last_error.code .. ": " .. entry.last_error.message) end
    return entry
end

return M
