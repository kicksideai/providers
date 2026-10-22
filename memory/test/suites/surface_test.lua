local test = require("test")
local fixture = require("fixture")
local json = require("json")
local http_client = require("http_client")
local registry = require("registry")
local session = require("session")
local groups = require("user_groups_repo")

local function live_for_key(user: string, component_id: string, key: string): { any }
    return fixture.items(user, component_id, { key = key, statuses = { "current", "conflict" } })
end

local function get_item(token: string, component_id: string, item_id: string, query: string): (any?, any?)
    local gateway = registry.get("app:gateway")
    local port = gateway and tostring(gateway.data.addr):match(":(%d+)$")
    if not port then return nil, "test gateway is unavailable" end
    local response, err = http_client.request("GET", "http://127.0.0.1:" .. port .. "/api/memory/" .. component_id .. "/items/" .. item_id .. query,
        { headers = { Authorization = "Bearer " .. token } })
    if err then return nil, err end
    return response, nil
end

local function define_tests()
    test.describe("memory surfaces", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("requires Remember to name a topic and retains a false value", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local context = fixture.agent_context(component_id, "surface-" .. user, "agent-a")

            local missing = fixture.op(user, "tool_remember", { input = {
                content = "The user enables notifications.", value = true,
            } }, context)
            test.eq(missing.success, false)

            local content_key = fixture.op(user, "tool_remember", { input = {
                content = "The user enables notifications.", key = "The user enables notifications.", value = true,
            } }, context)
            test.eq(content_key.success, false)

            local stored = fixture.op(user, "tool_remember", { input = {
                content = "The user disables notifications.", key = "notification_setting", value = false,
            } }, context)
            test.eq(stored.success, true, json.encode(stored))
            fixture.settle(user, component_id)
            local rows = live_for_key(user, component_id, "notification_setting")
            test.eq(#rows, 1)
            test.eq(rows[1].value, false)
        end)

        test.it("returns each authorized member of an unresolved alternative group when the search page holds one group", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local context = fixture.agent_context(component_id, "surface-" .. user, "agent-a")
            local values = { "Biscuit", "Pepper", "Miso" }

            for index, value in ipairs(values) do
                local held = live_for_key(user, component_id, "cat_name")
                if #held > 0 then
                    local ids = {}
                    for _, item in ipairs(held) do ids[#ids + 1] = item.id end
                    fixture.verdict("CONFLICT", ids)
                end
                fixture.remember(user, component_id, {
                    fixture.candidate("fact", "cat_name", value, "The user's cat is called " .. value .. ".", "cat-" .. index),
                }, "cat-" .. index)
                fixture.settle(user, component_id)
            end

            local found = fixture.op(user, "tool_search", { input = { query = "cat called", limit = 1 } }, context)
            test.eq(found.success, true, json.encode(found))
            test.eq(found.count, 0)
            test.eq(#found.alternatives, 1)
            test.eq(#found.alternatives[1].options, 3)
        end)

        test.it("rejects a pin whose selected item was archived before its transaction", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local added = fixture.op(user, "create", { component_id = component_id, fields = {
                kind = "preference", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
                cardinality = "single",
            } })
            fixture.settle(user, component_id)
            local item = fixture.op(user, "get", { component_id = component_id, item_id = added.item_id })
            local _, archive_err = fixture.op(user, "archive", { component_id = component_id, item_id = item.id })
            test.is_nil(archive_err, tostring(archive_err))
            fixture.settle(user, component_id)

            local pinned, pin_err = fixture.op(user, "pin", {
                component_id = component_id, host_kind = "session", host_id = "surface-" .. user, agent_id = "agent-a",
                head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
                selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
            })
            test.is_nil(pinned)
            test.not_nil(pin_err)
        end)

        test.it("stores pinned item ids in the cursor's established representation", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local host_id = "surface-" .. user
            local added = fixture.op(user, "create", { component_id = component_id, fields = {
                kind = "preference", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
                cardinality = "single",
            } })
            fixture.settle(user, component_id)
            local item = fixture.op(user, "get", { component_id = component_id, item_id = added.item_id })
            local pinned, pin_err = fixture.op(user, "pin", {
                component_id = component_id, host_kind = "session", host_id = host_id, agent_id = "agent-a",
                head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
                selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
            })
            test.is_true(pinned, tostring(pin_err))
            local pinned_ids, ids_err = fixture.op(user, "pinned_ids", {
                component_id = component_id, host_kind = "session", host_id = host_id,
            })
            test.is_nil(ids_err, tostring(ids_err))
            test.eq(pinned_ids, (json.encode({ item.id })))
        end)

        test.it("invalidates an existing owner prompt when its item is archived", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local session = "surface-" .. user
            local context = fixture.agent_context(component_id, session, "agent-a")
            local added = fixture.op(user, "create", { component_id = component_id, fields = {
                kind = "preference", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
                cardinality = "single",
            } })
            fixture.settle(user, component_id)
            fixture.op(user, "apply", { payload = fixture.payload("activate", session, "agent-a") }, context)
            test.is_true(fixture.op(user, "prompt", {}, context):find("drinks tea", 1, true) ~= nil)

            local _, archive_err = fixture.op(user, "archive", { component_id = component_id, item_id = added.item_id })
            test.is_nil(archive_err, tostring(archive_err))
            fixture.settle(user, component_id)
            test.is_true(fixture.op(user, "prompt", {}, context):find("drinks tea", 1, true) == nil)
        end)

        test.it("rejects a pin whose rendered text was revised before its transaction", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local added = fixture.op(user, "create", { component_id = component_id, fields = {
                kind = "preference", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
                cardinality = "single",
            } })
            fixture.settle(user, component_id)
            local item = fixture.op(user, "get", { component_id = component_id, item_id = added.item_id })
            local _, edit_err = fixture.op(user, "edit", { component_id = component_id, item_id = item.id, fields = {
                content = "The user prefers tea.",
            } })
            test.is_nil(edit_err, tostring(edit_err))
            fixture.settle(user, component_id)

            local pinned, pin_err = fixture.op(user, "pin", {
                component_id = component_id, host_kind = "session", host_id = "surface-" .. user, agent_id = "agent-a",
                head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
                selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
            })
            test.is_nil(pinned)
            test.not_nil(pin_err)
        end)

        test.it("pages every scope and topic version across kinds through the item endpoint", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local ids, seed_err = fixture.op(user, "seed_history", { component_id = component_id, user_id = user, count = 201 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, component_id)
            local minted, mint_err = session.mint(assert(groups.get_user_with_groups(user)))
            test.is_nil(mint_err, tostring(mint_err))
            test.not_nil(minted)

            local first, first_err = get_item(minted.token, component_id, ids[1], "?limit=200")
            test.is_nil(first_err, tostring(first_err))
            test.eq(first.status_code, 200, tostring(first.body))
            local first_body = assert(json.decode(first.body))
            test.eq(#first_body.versions, 200)
            test.eq(first_body.next_offset, 200)
            test.eq(first_body.versions[1].kind, "fact")

            local final, final_err = get_item(minted.token, component_id, ids[1], "?limit=200&offset=200")
            test.is_nil(final_err, tostring(final_err))
            test.eq(final.status_code, 200, tostring(final.body))
            local final_body = assert(json.decode(final.body))
            test.eq(#final_body.versions, 1)
            test.eq(final_body.versions[1].kind, "profile_slot")
            test.is_nil(final_body.next_offset)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
