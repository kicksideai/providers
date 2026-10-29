-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local HISTORY_CONTEXT = { contract = "wippy.agent:run_context", binding = "app.suites:history_binding" }

local function setup(learn, kind, config)
    local user = fixture.user()
    local id = fixture.memory(user, config)
    local host_kind = kind or "dataflow"
    local run_id = host_kind == "content" and id or "flow-" .. user .. ":node"
    local host = {kind = host_kind, dataflow_id = "flow-" .. user, node_id = "node"}
    local context = fixture.agent_context(id, run_id, "agent:reader", {learn_in_isolation = learn})
    context.agent_run.host = host
    context.agent_run.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding, host = host }
    local function apply(phase, refs)
        local payload = fixture.payload(phase, run_id, "agent:reader", {host = host, refs = refs})
        payload.run_context = { contract = HISTORY_CONTEXT.contract, binding = HISTORY_CONTEXT.binding, host = host }
        return fixture.op(user, "apply", {payload = payload}, context)
    end
    return user, id, run_id, context, apply
end

local function define_tests()
    test.describe("memory across runner hosts", function()
        test.it("recalls but captures nothing from an isolated runner by default", function()
            local user, id, run, context, apply = setup(false)
            fixture.remember(user, id, {fixture.candidate("preference", "format", "numbered steps", "The user prefers numbered steps.", "seed")}, "owner")
            fixture.op(user, "create", {component_id = id, fields = {kind = "rule", scope_family = "agent", scope_id = "agent:reader", key = "dataflow", value = "Verify source claims.", content = "Verify source claims."}})
            fixture.op(user, "create", {component_id = id, fields = {kind = "skill", scope_family = "agent", scope_id = "agent:reader", key = "relative_links", value = "Resolve relative links against the document base URL.", content = "Resolve relative links against the document base URL."}})
            fixture.settle(user, id)
            fixture.history.record(run, {{id = "task", role = "user", author = {kind = "system"}, content = "Read relative links in the documentation."}})
            local activated, activate_err = apply("activate")
            test.is_nil(activate_err, tostring(activate_err))
            local pinned = fixture.op(user, "prompt", {}, context)
            test.contains(pinned, "numbered steps")
            test.contains(pinned, "Verify source claims")
            test.contains(pinned, "Resolve relative links")
            context.agent_run.host.iteration = 2
            test.eq(fixture.op(user, "prompt", {}, context), pinned)
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            test.is_false(result.metadata.capture.captured)
            test.eq(#fixture.op(user, "runs", {component_id = id, run_type = "derive"}), 0)
        end)

        for _, kind in ipairs({"dataflow"}) do
            test.it("captures reusable experience in agent scope for runner " .. kind, function()
                local user, id, run, context, apply = setup(true, kind)
                fixture.history.record(run, {
                    {id = "task", role = "user", author = {kind = "agent", id = "agent:parent"}, content = "Read document 42 and report its title."},
                    {id = "lesson", role = "assistant", author = {kind = "agent", id = "agent:reader"}, metadata = {memory_ids = {"seed-rule"}}, content = "I corrected my mistake: resolve relative links against the document base URL."},
                })
                fixture.extraction(id, {fixture.candidate("lesson", "relative_links", "Resolve relative links against the document base URL.", "Resolve relative links against the document base URL.", "lesson")})
                local result, err = apply("before_step")
                test.is_nil(err, tostring(err))
                test.is_true(result.metadata.capture.captured)
                local runs = fixture.wait_runs(user, id, "derive", 1)
                test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
                fixture.settle(user, id)
                local items = fixture.items(user, id)
                test.eq(#items, 1)
                test.eq(items[1].scope_family, "agent")
                test.eq(items[1].scope_id, "agent:reader")
                test.eq(items[1].kind, "lesson")
                local instructions = fixture.script.prompts(id, "structured_output")[1].system
                test.contains(instructions, "value: the reusable knowledge")
                test.contains(instructions, "Never copy recalled memories or personal attributes into agent knowledge.")
                local provenance = fixture.op(user, "provenance", {component_id = id, item_id = items[1].id})
                test.eq(provenance[1].host_kind, kind)
                test.eq(provenance[1].host_id, run)
                local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = kind, host_id = run})
                test.not_nil(cursor)
                test.eq(cursor.last_event_id, "lesson")
                test.is_nil(runs[1].input.owner_id)
            end)

        end

        test.it("grounds a tool precondition in its corrected outcome without a narrated lesson", function()
            local user, id, run, context, apply = setup(true, nil, {capture_experience = true})
            fixture.history.record(run, {
                {id = "task", role = "user", author = {kind = "system"}, content = "Read record task-42."},
                {id = "refused", role = "function", author = {kind = "system"}, content = "Select the compact representation before reading.", metadata = {function_name = "read", status = "error", error = "Select the compact representation before reading."}},
                {id = "accepted", role = "function", author = {kind = "system"}, content = "Read accepted; record task-42 contains transient text.", metadata = {function_name = "read", status = "completed", result = "Read accepted; record task-42 contains transient text."}},
            })
            fixture.extraction(id, {fixture.candidate("lesson", "reader_representation", "Select the compact representation before reading.",
                "The reader requires the compact representation.", "accepted")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            test.is_true(result.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, id)
            local items = fixture.items(user, id)
            test.eq(#items, 1)
            test.eq(items[1].scope_family, "agent")
            test.eq(items[1].scope_id, "agent:reader")
            local provenance = fixture.op(user, "provenance", {component_id = id, item_id = items[1].id})
            test.eq(provenance[1].event_id, "accepted")
            local instructions = fixture.script.prompts(id, "structured_output")[1].system
            test.contains(instructions, "Tool validation errors establish observed")
            test.contains(instructions, "omit\n" .. "the concrete argument values and returned task data")
        end)

        test.it("rejects agent runner capture for content", function()
            local user, id, run, context, apply = setup(true, "content")
            fixture.history.record(run, {
                {id = "lesson", role = "assistant", author = {kind = "agent", id = "agent:reader"}, content = "Inspect the declared format before parsing."},
            })
            local result, err = apply("before_step")
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(#fixture.op(user, "runs", {component_id = id, run_type = "derive"}), 0)
            test.eq(#fixture.items(user, id), 0)
        end)

        test.it("keeps parent task input out of isolated extraction", function()
            local user, id, run, context, apply = setup(true)
            fixture.history.record(run, {{id = "task", role = "user", author = {kind = "agent", id = "agent:parent"}, content = "Explain how to separate quotations from inferences."}})
            fixture.extraction(id, {fixture.candidate("lesson", "documentation_reading", "Separate quotations from inferences.", "Separate quotations from inferences.", "task")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#fixture.script.requests(id, "structured_output"), 0)
            test.eq(#fixture.items(user, id), 0)
            local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "dataflow", host_id = run})
            test.eq(cursor.last_event_id, "task")
        end)

        test.it("rejects personal candidates from tool evidence and advances capture", function()
            local user, id, run, context, apply = setup(true, nil, {capture_experience = true})
            fixture.history.record(run, {{id = "result", role = "function", author = {kind = "system"}, content = "Inspection complete.", metadata = {function_name = "inspect", status = "completed"}}})
            fixture.extraction(id, {fixture.candidate("preference", "output_format", "tables", "The user prefers tables.", "result")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(runs[1].stats.rejected_candidates.kind, 1)
            test.eq(#fixture.items(user, id), 0)
            local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "dataflow", host_id = run})
            test.eq(cursor.last_event_id, "result")
        end)

        test.it("keeps unknown-author tool input out of extraction", function()
            local user, id, run, context, apply = setup(true, nil, {capture_experience = true})
            fixture.history.record(run, {{id = "result", role = "function", author = {kind = "unknown"}, content = "Inspection complete.", metadata = {function_name = "inspect", status = "completed"}}})
            fixture.extraction(id, {fixture.candidate("lesson", "inspection", "Inspect source output.", "Inspect source output.", "result")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#fixture.script.requests(id, "structured_output"), 0)
            test.eq(#fixture.items(user, id), 0)
            local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "dataflow", host_id = run})
            test.eq(cursor.last_event_id, "result")
        end)

        test.it("keeps another agent's output out of isolated extraction", function()
            local user, id, run, context, apply = setup(true)
            fixture.history.record(run, {{id = "other", role = "assistant", author = {kind = "agent", id = "agent:other"}, content = "I discovered that relative links need their document base URL."}})
            fixture.extraction(id, {fixture.candidate("lesson", "relative_links", "Resolve relative links against the document base URL.", "Resolve relative links against the document base URL.", "other")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#fixture.script.requests(id, "structured_output"), 0)
            test.eq(#fixture.items(user, id), 0)
            local cursor = fixture.op(user, "cursor", {component_id = id, host_kind = "dataflow", host_id = run})
            test.eq(cursor.last_event_id, "other")
        end)

        test.it("keeps reusable work knowledge in agent scope during human conversation", function()
            local user, id, run, context, apply = setup(false)
            fixture.history.record(run, {{id = "human", role = "user", author = {kind = "user", id = user}, content = "A reusable lesson: resolve relative links against the document base URL."}})
            fixture.extraction(id, {fixture.candidate("lesson", "relative_links", "Resolve relative links against the document base URL.", "Resolve relative links against the document base URL.", "human")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            test.eq(fixture.wait_runs(user, id, "derive", 1)[1].status, "succeeded")
            fixture.settle(user, id)
            local items = fixture.items(user, id)
            test.eq(#items, 1)
            test.eq(items[1].scope_family, "agent")
            test.eq(items[1].scope_id, "agent:reader")
        end)

        test.it("keeps group and service principals outside owner-profile recall", function()
            for _, principal in ipairs({"principal:group:research", "principal:service:research"}) do
                local scopes, err = fixture.op(principal, "recall_scopes", {agent_id = "agent:reader"})
                test.is_nil(err, tostring(err))
                test.eq(#scopes, 1)
                test.eq(scopes[1], "agent:agent:reader")
            end
        end)

        test.it("keeps human chat capture active when isolated learning is disabled", function()
            local user, id, run, context, apply = setup(false)
            fixture.op(user, "create", {component_id = id, fields = {kind = "rule", scope_family = "agent", scope_id = "agent:reader", key = "verification", value = "Cross-check headings against original sources.", content = "Cross-check headings against original sources."}})
            fixture.settle(user, id)
            fixture.history.record(run, {{id = "human", role = "user", author = {kind = "user", id = user}, content = "I live in Oslo."}})
            fixture.extraction(id, {fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "human")})
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            test.is_true(result.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, id)
            test.eq(fixture.items(user, id, {scope_family = "owner"})[1].scope_id, user)
            local instructions = fixture.script.prompts(id, "structured_output")[1].system
            test.is_nil(instructions:find("Cross-check headings against original sources.", 1, true))
        end)

        test.it("keeps requests to retrieve memory separate from new learning", function()
            local user, id, run, context, apply = setup(false)
            fixture.history.record(run, {{id = "request", role = "user", author = {kind = "user", id = user}, content = "Recall your stored lessons about verifying sources."}})
            fixture.extraction(id, {})
            local _, err = apply("before_step")
            test.is_nil(err, tostring(err))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            local instructions = fixture.script.prompts(id, "structured_output")[1].system
            test.contains(instructions, "Retrieving memory supplies no new fact, goal, skill or lesson.")
            test.eq(#fixture.items(user, id), 0)
        end)

        test.it("recognizes a human conversation beyond the capture window", function()
            local user, id, run, context, apply = setup(false)
            local events = {{id = "human", role = "user", author = {kind = "user", id = user}, content = "Help me research."}}
            for i = 1, 25 do events[#events + 1] = {id = "reply-" .. tostring(i), role = "assistant", author = {kind = "agent", id = "agent:reader"}, content = "Research continues."} end
            fixture.history.record(run, events)
            for i = 1, 20 do fixture.extraction(id, {}) end
            local result, err = apply("before_step")
            test.is_nil(err, tostring(err))
            test.is_true(result.metadata.capture.captured)
            local count = #fixture.op(user, "runs", {component_id = id, run_type = "derive"})
            for _, run in ipairs(fixture.wait_runs(user, id, "derive", count)) do test.eq(run.status, "succeeded", tostring(run.last_error)) end
            test.contains(fixture.script.prompts(id, "structured_output")[1].system, "Extract only reusable knowledge")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
