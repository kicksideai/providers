-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
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

local function get_path(user: string?, path: string): any
    local gateway = registry.get("app:gateway")
    local port = tostring(gateway.data.addr):match(":(%d+)$")
    local headers = {}
    if user then
        local minted = assert(session.mint(assert(groups.get_user_with_groups(user))))
        headers.Authorization = "Bearer " .. minted.token
    end
    local response, err = http_client.request("GET", "http://127.0.0.1:" .. port .. "/api" .. path, { headers = headers })
    if err then error(tostring(err)) end
    return { status = response.status_code, body = json.decode(response.body), raw = response.body }
end

local function define_tests()
    test.describe("memory surfaces", function()
        test.it("exposes oversized source rejections through runs and activity without source text", function()
            local user = fixture.user()
            local id = fixture.memory(user, { extraction_model = "test-bounded" })
            local session_id = "s-" .. user
            local source = string.rep("private-source-", 2000)
            fixture.history.record(session_id, { { id = "oversized", role = "user", content = source } })
            local _, err = fixture.apply(user, "before_step", id, session_id, "agent-a")
            test.is_nil(err, tostring(err))
            local finished = fixture.wait_runs(user, id, "derive", 1)[1]
            local response = get_path(user, "/memory/" .. id .. "/status")
            test.eq(response.status, 200, response.raw)
            local found = false
            for _, run in ipairs(response.body.runs) do
                if run.id == finished.id then
                    found = true
                    test.eq(run.status, "rejected")
                    test.eq(run.stats.rejected_source_too_large, 1)
                    test.eq(run.stats.source_bytes, #source)
                    test.is_true(run.last_error:find("source_too_large", 1, true) ~= nil)
                end
            end
            test.is_true(found)
            test.is_nil((response.raw:find("private-source-", 1, true)))
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("exposes exhausted model validation failures through run activity without partial writes", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session_id = "s-" .. user
            local good = fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "event")
            local bad = fixture.candidate("profile_slot", "private_value", "private value", "Private statement", "event")
            for i = 1, 3 do fixture.extraction({ good, bad }) end
            fixture.history.record(session_id, { { id = "event", role = "user", content = "I live in Oslo." } })
            local _, err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session_id, "agent-a") },
                fixture.agent_context(id, session_id, "agent-a"))
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            local job = fixture.wait_job(runs[1].job_id, "dead")
            test.eq(job.attempts, 3)
            test.eq(fixture.op(user, "run", { run_id = runs[1].id }).status, "failed")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session_id })
            test.is_true(cursor == nil or cursor.last_event_id == "")
            local response = get_path(user, "/memory/" .. id .. "/status")
            test.eq(response.status, 200, response.raw)
            local found = false
            for _, run in ipairs(response.body.runs) do
                if run.id == runs[1].id then
                    found = true
                    test.eq(run.status, "failed")
                    test.eq(json.decode(run.last_error).code, "model_output_invalid_extraction_topic_key")
                    test.is_nil(run.stats.rejected)
                    test.is_nil((json.encode(run.stats):find("private", 1, true)))
                end
            end
            test.is_true(found)
            fixture.settle(user, id)
            local items = fixture.items(user, id)
            test.eq(#items, 0)
        end)
        test.before_each(function() fixture.script.reset() end)

        test.it("assigns conversation learning only to automatic capture", function()
            local trait = registry.get("kickside.memory:memory").data.prompt
            test.is_true(trait:find("Memory learns from the conversation automatically", 1, true) ~= nil, trait)
            test.is_true(trait:find("Use SearchMemory to look things up", 1, true) ~= nil, trait)
            test.is_true(trait:find("Use ForgetMemory only when the user asks to forget", 1, true) ~= nil, trait)
            local forget = registry.get("kickside.memory.agent:forget_tool").meta.llm_description
            test.is_true(forget:find("only when the user explicitly asks to forget", 1, true) ~= nil, forget)
        end)

        test.it("publishes the same typed tool contracts that the runtime implements", function()
            local forget = json.decode(registry.get("kickside.memory.agent:forget_tool").meta.input_schema)
            test.eq(forget.required[1], "key")
            test.is_nil(forget.properties.item_id)
            local search = registry.get("kickside.memory.agent:search_tool")
            test.is_nil(json.decode(search.meta.input_schema).properties.fields)
            local shape = json.decode(search.meta.output_schema).properties.items.items
            test.eq(#shape.required, 9)
            test.is_false(shape.additionalProperties)
            test.not_nil(shape.properties.key)
            test.not_nil(shape.properties.value)
        end)

        test.it("rejects non-object JSON request bodies", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local gateway = assert(registry.get("app:gateway"))
            local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
            local minted = assert(session.mint(assert(groups.get_user_with_groups(user))))
            for _, raw in ipairs({ "[]", "null", "{", "false" }) do
                local response, err = http_client.request("POST", "http://127.0.0.1:" .. port .. "/api/memory/" .. id .. "/items", {
                    headers = { Authorization = "Bearer " .. minted.token, ["Content-Type"] = "application/json" }, body = raw,
                })
                test.is_nil(err, tostring(err))
                test.eq(response.status_code, 400)
                test.eq(json.decode(response.body).error, "body must be a JSON object")
            end
        end)

        test.it("serves each driver's declared web component from its own static mount", function()
            local gateway = assert(registry.get("app:gateway"))
            local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
            for _, surface in ipairs({
                {id = "kickside.memory:memory_settings", base = "kickside-memory"},
                {id = "kickside.memory:memory_create_view", base = "kickside-memory"},
                {id = "kickside.memory:memory_view", base = "kickside-memory"},
            }) do
                local entry = assert(registry.get(surface.id))
                test.eq(entry.meta.base_path, surface.base)
                local response, err = http_client.request("GET", "http://127.0.0.1:" .. port .. "/"
                    .. entry.meta.base_path .. "/" .. entry.meta.entry_point)
                test.is_nil(err, tostring(err))
                test.eq(response.status_code, 200, surface.id)
                test.is_true(type(response.body) == "string" and #response.body > 100, surface.id)
            end
        end)

        test.it("lists accessible memories with component names counts and pagination", function()
            local owner, reader, stranger = fixture.user(), fixture.user(), fixture.user()
            local id, second = fixture.memory(owner), fixture.memory(owner)
            local grant, grant_err = fixture.call_as(owner, "kickside.component.binding:grant_subtree_func", {
                root_component_id = id, subject = { subject_id = reader, subject_type = "user" }, access_mask = 1,
            })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(grant.success)
            fixture.op(owner, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
            } })
            fixture.settle(owner, id)
            local page = get_path(owner, "/memory?limit=1")
            test.eq(page.status, 200, page.raw)
            test.eq(#page.body.items, 1)
            test.eq(page.body.next_offset, 1)
            local final = get_path(owner, "/memory?limit=1&offset=1")
            test.eq(final.status, 200, final.raw)
            test.eq(#final.body.items, 1)
            test.is_nil(final.body.next_offset)
            test.is_true(page.body.items[1].id ~= final.body.items[1].id)
            local shared = get_path(reader, "/memory")
            test.eq(shared.status, 200, shared.raw)
            test.eq(#shared.body.items, 1)
            test.eq(shared.body.items[1].id, id)
            test.eq(shared.body.items[1].item_count, 1)
            test.is_true(#shared.body.items[1].name > 0)
            test.eq(shared.body.items[1].title, shared.body.items[1].name)
            test.eq(get_path(reader, "/memory?q=missing-title").body.count, 0)
            test.eq(get_path(stranger, "/memory").body.count, 0)
            test.eq(get_path(nil, "/memory").status, 401)
            test.not_nil(second)
        end)

        test.it("searches memory items with hybrid ranking filters and continuation", function()
            local owner, stranger = fixture.user(), fixture.user()
            local id = fixture.memory(owner)
            local ids = {}
            for _, content in ipairs({ "The user drinks tea.", "Tea is served warm.", "Coffee is served cold." }) do
                local added, err = fixture.op(owner, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = "drinks", cardinality = "multi", value = content, content = content,
                } })
                test.is_nil(err, tostring(err))
                ids[#ids + 1] = added.item_id
                fixture.settle(owner, id)
            end
            fixture.op(owner, "archive", { component_id = id, item_id = ids[3] })
            fixture.settle(owner, id)
            local page = get_path(owner, "/memory/" .. id .. "/items?q=tea&status=current&kind=fact&limit=1")
            test.eq(page.status, 200, page.raw)
            test.eq(#page.body.items, 1)
            test.eq(page.body.next_offset, 1)
            test.not_nil(page.body.items[1].hybrid_score)
            local final = get_path(owner, "/memory/" .. id .. "/items?q=tea&status=current&kind=fact&limit=1&offset=1")
            test.eq(final.status, 200, final.raw)
            test.eq(#final.body.items, 1)
            test.is_nil(final.body.next_offset)
            test.is_true(final.body.items[1].id ~= page.body.items[1].id)
            test.eq(get_path(owner, "/memory/" .. id .. "/items?q=tea&kind=rule").body.count, 0)
            test.eq(get_path(owner, "/memory/" .. id .. "/items?q=&status=current").body.count, 2)
            test.eq(get_path(stranger, "/memory/" .. id .. "/items?q=tea").status, 403)
        end)

        test.it("pages canonical topics by family and kind with current counts", function()
            local owner, stranger = fixture.user(), fixture.user()
            local id = fixture.memory(owner)
            for _, key in ipairs({ "drink", "home_city" }) do
                local _, err = fixture.op(owner, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = key, cardinality = "multi", value = "configured", content = "The setting is configured.",
                } })
                test.is_nil(err, tostring(err))
                fixture.settle(owner, id)
            end
            local first = get_path(owner, "/memory/" .. id .. "/topics?scope_family=owner&kind=fact&limit=1")
            test.eq(first.status, 200, first.raw)
            test.eq(#first.body.topics, 1)
            test.eq(first.body.topics[1].key, "drink")
            test.eq(first.body.topics[1].cardinality, "multi")
            test.eq(first.body.topics[1].current_count, 1)
            test.eq(first.body.next_offset, 1)
            local final = get_path(owner, "/memory/" .. id .. "/topics?scope_family=owner&kind=fact&limit=1&offset=1")
            test.eq(final.body.topics[1].key, "home_city")
            test.is_nil(final.body.next_offset)
            test.eq(get_path(owner, "/memory/" .. id .. "/topics?scope_family=agent").body.count, 0)
            test.eq(get_path(owner, "/memory/" .. id .. "/topics?scope_family=invalid").status, 400)
            test.eq(get_path(owner, "/memory/" .. id .. "/topics?kind=invalid").status, 400)
            test.eq(get_path(stranger, "/memory/" .. id .. "/topics").status, 403)
        end)

        test.it("discovers distinct search groups beyond fifty hits in one group", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local function seed(key: string, n: integer)
                local _, err = fixture.call_as(user, "app.suites:persistence_call", {
                    op = "seed", component_id = id, user = user, count = n, conflict = true, key = key, idempotency = key, content = key == "first_topic" and "Synthetic evidence." or "Distant evidence.",
                })
                test.is_nil(err, tostring(err))
                fixture.settle(user, id)
            end
            seed("first_topic", 60)
            seed("second_topic", 2)
            local context = fixture.agent_context(id, "group-search", "agent-a")
            local first, err = fixture.op(user, "tool_search", { input = { query = "Synthetic evidence", limit = 1 } }, context)
            test.is_nil(err, tostring(err))
            test.eq(#first.alternatives, 1)
            test.eq(first.next_cursor, "1")
            local second, second_err = fixture.op(user, "tool_search", { input = { query = "Synthetic evidence", limit = 1, cursor = first.next_cursor } }, context)
            test.is_nil(second_err, tostring(second_err))
            test.eq(#second.alternatives, 1)
            test.is_true(first.alternatives[1].group_id ~= second.alternatives[1].group_id)
            test.is_nil(second.next_cursor)
            test.eq(#first.alternatives[1].options + #second.alternatives[1].options, 62)
        end)

        test.it("returns each authorized member of an unresolved alternative group when the search page holds one group", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local context = fixture.agent_context(component_id, "surface-" .. user, "agent-a")
            local values = { "Biscuit", "Pepper", "Miso" }

            for index, value in ipairs(values) do
                local held = live_for_key(user, component_id, "cat_name")
                if #held > 0 then
                    local relations = {}
                    for _ = 1, #held do relations[#relations + 1] = "contradicts" end
                    fixture.relations(relations)
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
            test.is_true(fixture.op(user, "prompt", {}, context):find("Drink [drink]: tea", 1, true) ~= nil)

            local _, archive_err = fixture.op(user, "archive", { component_id = component_id, item_id = added.item_id })
            test.is_nil(archive_err, tostring(archive_err))
            fixture.settle(user, component_id)
            test.is_true(fixture.op(user, "prompt", {}, context):find("Drink [drink]: tea", 1, true) == nil)
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
