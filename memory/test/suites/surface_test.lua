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

local function json_body(body: any?): string?
    if body == nil then return nil end
    if type(body) == "table" and next(body) == nil then return "{}" end
    return assert(json.encode(body))
end

local function request_with_token(token: string, method: string, path: string, body: any?): (any?, any?)
    local gateway = registry.get("app:gateway")
    local port = gateway and tostring(gateway.data.addr):match(":(%d+)$")
    if not port then return nil, "test gateway is unavailable" end
    local headers = { Authorization = "Bearer " .. token }
    if body ~= nil then headers["Content-Type"] = "application/json" end
    local response, err = http_client.request(method, "http://127.0.0.1:" .. port .. "/api" .. path,
        { headers = headers, body = json_body(body) })
    if err then return nil, err end
    return response, nil
end

local function request(user: string?, method: string, path: string, body: any?): any
    local token = nil
    if user then
        local minted = assert(session.mint(assert(groups.get_user_with_groups(user))))
        token = minted.token
    end
    local response, err
    if token then response, err = request_with_token(token, method, path, body)
    else
        local gateway = assert(registry.get("app:gateway"))
        local port = assert(tostring(gateway.data.addr):match(":(%d+)$"))
        response, err = http_client.request(method, "http://127.0.0.1:" .. port .. "/api" .. path, { body = json_body(body) })
    end
    if err then error(tostring(err)) end
    return { status = response.status_code, body = json.decode(response.body), raw = response.body }
end

local function get_path(user: string?, path: string): any return request(user, "GET", path) end

local function define_tests()
    test.describe("memory surfaces", function()

        test.it("admits generic content through the selected memory engine", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local response = request(user, "POST", "/knowledge/" .. id .. "/ingest", {
                content = "The reference explains accessible travel.", content_type = "text/plain",
                external_id = "travel-reference", external_version = "1",
            })
            test.eq(response.status, 200, response.raw)
            test.is_true(response.body.success, response.raw)
        end)
        test.it("exposes oversized source rejections through runs and activity without source text", function()
            local user = fixture.user()
            local id = fixture.memory(user, { extraction_model = "test-bounded" })
            local session_id = "s-" .. user
            local source = string.rep("private-source-", 2000)
            fixture.record_chat(user, session_id, { { id = "oversized", role = "user", author = { kind = "user", id = user }, content = source } })
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
            test.eq(#fixture.script.requests(id, "structured_output"), 0)
        end)

        test.it("exposes exhausted model validation failures through run activity without partial writes", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session_id = "s-" .. user
            local event = { id = "event", role = "user", author = { kind = "user", id = user }, content = "I live in Oslo." }
            fixture.record_chat(user, session_id, { event })
            local good = fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", event.id)
            local bad = fixture.candidate("profile_slot", "private_value", "private value", "Private statement", event.id)
            for i = 1, 3 do fixture.extraction(id, { good, bad }) end
            local _, err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session_id, "agent-a") },
                fixture.agent_context(id, session_id, "agent-a"))
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            local job = fixture.wait_job(runs[1].job_id, "dead")
            test.eq(job.attempts, 3)
            test.eq(fixture.op(user, "run", { run_id = runs[1].id }).status, "failed")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session_id })
            test.is_true(cursor == nil or cursor.last_event_id == nil)
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

        test.it("forgets an earlier version through the memory page endpoint", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local function create(value: string): string
                local response = request(user, "POST", "/memory/" .. id .. "/items", {
                    kind = "profile_slot", scope_family = "owner", key = "pet_name", cardinality = "single", value = value,
                    content = "The user's pet is " .. value .. ".",
                })
                test.eq(response.status, 200, response.raw)
                fixture.settle(user, id)
                return response.body.item_id
            end
            create("Rex")
            local biscuit = create("Biscuit")
            create("Pepper")
            local forgotten = request(user, "POST", "/memory/" .. id .. "/items/" .. biscuit .. "/forget", {})
            test.eq(forgotten.status, 200, forgotten.raw)
            test.eq(forgotten.body.forgotten, 2)
            fixture.settle(user, id)
            local statuses = {}
            for _, item in ipairs(fixture.items(user, id, { key = "pet_name" })) do
                statuses[#statuses + 1] = item.status .. ":" .. tostring(item.value)
            end
            table.sort(statuses)
            test.eq(table.concat(statuses, ","), "current:Pepper,forgotten:nil,forgotten:nil")
        end)

        test.it("resolves item sources to the conversation line and the source memory", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session_id = "s-sources-" .. user
            local events = {
                { id = "line-1", role = "user", author = { kind = "user", id = user }, content = "I started teaching chemistry at Lincoln Academy." },
                { id = "line-2", role = "assistant", author = { kind = "agent", id = "agent-a" }, content = "Congratulations on the new role." },
            }
            fixture.record_chat(user, session_id, events)
            fixture.extraction(id, {
                fixture.candidate("profile_slot", "employer", "Lincoln Academy", "The user works at Lincoln Academy.", events[1].id),
            })
            local _, err = fixture.apply(user, "before_step", id, session_id, "agent-a")
            test.is_nil(err, tostring(err))
            local derived_runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(derived_runs[1].status, "succeeded", tostring(derived_runs[1].last_error))
            fixture.settle(user, id)
            local learned = fixture.values(fixture.items(user, id))["Lincoln Academy"]
            local detail = get_path(user, "/memory/" .. id .. "/items/" .. learned.id)
            test.eq(detail.status, 200, detail.raw)
            local source = detail.body.provenance[1]
            test.eq(source.host_kind, "session")
            test.eq(source.host_id, session_id)
            test.eq(source.line.role, "user")
            test.eq(source.line.text, "I started teaching chemistry at Lincoln Academy.")

            local lessons, lesson_err = fixture.persistence_op(user, "seed", { component_id = id, user = user,
                count = 1, kind = "lesson", distinct_keys = true, idempotency = "source-lesson" })
            test.is_nil(lesson_err, tostring(lesson_err))
            fixture.settle(user, id)
            local lesson_id = lessons.item_ids[1]
            local db = fixture.db()
            local _, insert_err = db:execute([[INSERT INTO kickside_memory_provenance (component_id, item_id, host_kind, host_id, event_id, recorded_at)
                VALUES ($1, $2, 'item', $3, '', '2026-01-01T00:00:00Z')]], { id, lesson_id, learned.id })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            local derived = get_path(user, "/memory/" .. id .. "/items/" .. lesson_id)
            test.eq(derived.status, 200, derived.raw)
            local origin = derived.body.provenance[1]
            test.eq(origin.host_kind, "item")
            test.eq(origin.memory.id, learned.id)
            test.eq(origin.memory.key, "employer")
            test.eq(origin.memory.content, "The user works at Lincoln Academy.")
            test.is_nil(origin.line)
        end)

        test.it("archives restores and edits items through memory page endpoints", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created = request(user, "POST", "/memory/" .. id .. "/items", {
                kind = "preference", scope_family = "owner", key = "drink", cardinality = "single", value = "tea",
                content = "The user drinks tea.",
            })
            test.eq(created.status, 200, created.raw)
            local item_id = created.body.item_id
            fixture.settle(user, id)
            local archived = request(user, "POST", "/memory/" .. id .. "/items/" .. item_id .. "/archive", {})
            test.eq(archived.status, 200, archived.raw)
            fixture.settle(user, id)
            test.eq(get_path(user, "/memory/" .. id .. "/items/" .. item_id).body.item.status, "archived")
            local restored = request(user, "POST", "/memory/" .. id .. "/items/" .. item_id .. "/restore", {})
            test.eq(restored.status, 200, restored.raw)
            fixture.settle(user, id)
            local edited = request(user, "PUT", "/memory/" .. id .. "/items/" .. item_id, { content = "The user prefers tea." })
            test.eq(edited.status, 200, edited.raw)
            test.is_true(edited.body.revised)
            fixture.settle(user, id)
            local item = get_path(user, "/memory/" .. id .. "/items/" .. item_id).body.item
            test.eq(item.status, "current")
            test.eq(item.content, "The user prefers tea.")
        end)

        test.it("lists and resolves conflicts through memory page endpoints", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "birth_date", "1990-03-03", "The user was born on 1990-03-03.", "first") }, "first")
            fixture.settle(user, id)
            fixture.relations(id, { "contradicts" })
            fixture.remember(user, id, { fixture.candidate("fact", "birth_date", "1990-03-05", "The user was born on 1990-03-05.", "second") }, "second")
            fixture.settle(user, id)
            local conflicts = get_path(user, "/memory/" .. id .. "/conflicts")
            test.eq(conflicts.status, 200, conflicts.raw)
            test.eq(conflicts.body.count, 1)
            local group = conflicts.body.groups[1]
            test.eq(#group.items, 2)
            local winner = group.items[2]
            local resolved = request(user, "POST", "/memory/" .. id .. "/conflicts/" .. group.group_id .. "/resolve", { winner_id = winner.id })
            test.eq(resolved.status, 200, resolved.raw)
            test.eq(resolved.body.superseded, 1)
            fixture.settle(user, id)
            test.eq(get_path(user, "/memory/" .. id .. "/conflicts").body.count, 0)
            test.eq(get_path(user, "/memory/" .. id .. "/items/" .. winner.id).body.item.status, "current")
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
            local created, create_err = fixture.op(owner, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
            } })
            test.is_nil(create_err, tostring(create_err))
            test.not_nil(created)
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
            local _, archive_err = fixture.op(owner, "archive", { component_id = id, item_id = ids[3] })
            test.is_nil(archive_err, tostring(archive_err))
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
                local _, err = fixture.persistence_op(user, "seed", {
                    component_id = id, user = user, count = n, conflict = true, key = key, idempotency = key,
                    content = key == "first_topic" and "Synthetic evidence." or "Distant evidence.",
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
                    fixture.relations(component_id, relations)
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
                owner_scope_key = "owner:" .. user, head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
                selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
            })
            test.is_nil(pinned)
            test.not_nil(pin_err)
            test.eq(pin_err:kind(), errors.INVALID)
            test.eq(pin_err:message(), "memory pin source is no longer current")
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
                owner_scope_key = "owner:" .. user, head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
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
            fixture.record_chat(user, session, {})
            local context = fixture.agent_context(component_id, session, "agent-a")
            local added = fixture.op(user, "create", { component_id = component_id, fields = {
                kind = "preference", scope_family = "owner", key = "drink", value = "tea", content = "The user drinks tea.",
                cardinality = "single",
            } })
            fixture.settle(user, component_id)
            local activated, activate_err = fixture.op(user, "apply", { payload = fixture.payload("activate", session, "agent-a") }, context)
            test.is_nil(activate_err, tostring(activate_err))
            test.is_true(activated.metadata.pinned)
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
                owner_scope_key = "owner:" .. user, head = 1, prompt = "## What you know about the user\n- [preference] The user drinks tea.",
                selected = { { id = item.id, version = item.version, content_hash = item.content_hash } },
            })
            test.is_nil(pinned)
            test.not_nil(pin_err)
            test.eq(pin_err:kind(), errors.INVALID)
            test.eq(pin_err:message(), "memory pin source is no longer current")
        end)

        test.it("pages every scope and topic version across kinds through the item endpoint", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local seeded, seed_err = fixture.persistence_op(user, "seed", {
                component_id = component_id, user = user, count = 201, key = "history_topic",
                final_kind = "profile_slot", idempotency = "history:" .. component_id,
            })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, component_id)

            local first = request(user, "GET", "/memory/" .. component_id .. "/items/" .. seeded.item_ids[1] .. "?limit=200")
            test.eq(first.status, 200, first.raw)
            test.eq(#first.body.versions, 200)
            test.eq(first.body.next_offset, 200)
            test.eq(first.body.versions[1].kind, "fact")

            local final = request(user, "GET", "/memory/" .. component_id .. "/items/" .. seeded.item_ids[1] .. "?limit=200&offset=200")
            test.eq(final.status, 200, final.raw)
            test.eq(#final.body.versions, 1)
            test.eq(final.body.versions[1].kind, "profile_slot")
            test.is_nil(final.body.next_offset)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
