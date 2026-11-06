-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local uuid = require("uuid")
local json = require("json")
local time = require("time")

local function define_tests()
    test.describe("runner context consumption", function()
        test.it("derives stable identities from published host fields", function()
            local user = fixture.user()
            local session = fixture.op(user, "host_ref", {host = {kind = "session", session_id = "chat"}})
            test.eq(session.kind, "session")
            test.eq(session.id, "chat")
            for _, iteration in ipairs({1, 9}) do
                local flow = fixture.op(user, "host_ref", {host = {kind = "dataflow", dataflow_id = "flow", node_id = "node", iteration = iteration}})
                test.eq(flow.kind, "dataflow")
                test.eq(flow.id, "flow:node")
            end
        end)

        test.it("captures persisted dataflow tool outcomes without additional host fields", function()
            local user = fixture.user()
            local memory = fixture.memory(user, {capture_experience = true})
            local flow, node = uuid.v7(), uuid.v7()
            local now = time.now():format(time.RFC3339)
            local db = fixture.db()
            local function execute(statement, params)
                local _, err = db:execute(statement, params)
                test.is_nil(err, tostring(err))
            end
            execute("INSERT INTO dataflows (dataflow_id, actor_id, type, status, metadata, created_at, updated_at) VALUES ($1, $2, 'workflow', 'completed', '{}', $3, $3)", {flow, user, now})
            execute("INSERT INTO dataflow_nodes (node_id, dataflow_id, type, status, config, metadata, created_at, updated_at) VALUES ($1, $2, 'userspace.dataflow.node.agent:node', 'completed', '{}', '{}', $3, $3)", {node, flow, now})
            local ids = {}
            for _, row in ipairs({
                {type = "node.input", content = "Inspect document 42.", metadata = {}, content_type = "text/plain"},
                {type = "agent.action", content = {tool_calls = {{id = "inspect-call", name = "inspect", registry_id = "app:inspect", arguments = {document = "42"}}}}, metadata = {agent_id = "agent-a"}, content_type = "application/json"},
                {type = "agent.observation", content = "format is required; inspect the declared format before parsing", metadata = {tool_call_id = "inspect-call", tool_name = "inspect", is_error = true}, content_type = "text/plain"},
                {type = "agent.action", content = {result = "Inspect the declared format before parsing."}, metadata = {agent_id = "agent-a"}, content_type = "application/json"},
            }) do
                local id = uuid.v7()
                ids[#ids + 1] = id
                local content = type(row.content) == "string" and row.content or assert(json.encode(row.content))
                execute("INSERT INTO dataflow_data (data_id, dataflow_id, node_id, type, discriminator, key, content, content_type, metadata, created_at) VALUES ($1, $2, $3, $4, 'default', $5, $6, $7, $8, $9)",
                    {id, flow, node, row.type, id, content, row.content_type, assert(json.encode(row.metadata)), now})
            end
            db:release()
            local host = {kind = "dataflow", dataflow_id = flow, node_id = node, iteration = 1}
            local payload = {phase = "before_step", host = host, agent = {id = "agent-a"},
                run_context = {contract = "wippy.agent:run_context", binding = "userspace.dataflow.node.agent.run_context:binding", host = host}}
            local context = {memory_id = memory, thread_id = memory, learn_in_isolation = true, from_agent_id = "agent:parent"}
            fixture.extraction(memory, {fixture.candidate("lesson", "document_format", "Inspect the declared format before parsing.", "Inspect the declared format before parsing.", ids[3])})
            local captured, err = fixture.op(user, "apply", {payload = payload}, context)
            test.is_nil(err, tostring(err))
            test.is_true(captured.metadata.capture.captured)
            local run = fixture.wait_runs(user, memory, "derive", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.eq(run.host_id, flow .. ":" .. node)
            for _, entry in ipairs(run.input.span) do
                if entry.id == ids[1] then
                    test.eq(entry.author.kind, "agent")
                    test.eq(entry.author.id, "agent:parent")
                end
            end
            local outcome
            for _, entry in ipairs(run.input.span) do if entry.id == ids[3] then outcome = entry end end
            test.not_nil(outcome)
            test.eq(outcome.role, "tool")
            test.contains(outcome.text, "format is required")
            fixture.settle(user, memory)
            local learned = fixture.items(user, memory)
            test.eq(#learned, 1)
            test.eq(learned[1].scope_family, "agent")
            test.eq(learned[1].kind, "lesson")
            host.iteration = 7
            local again, again_err = fixture.op(user, "apply", {payload = payload}, context)
            test.is_nil(again_err, tostring(again_err))
            test.is_false(again.metadata.capture.captured)
            test.eq(#fixture.op(user, "runs", {component_id = memory, run_type = "derive"}), 1)
        end)

        test.it("attributes a session's unmarked user messages to its persisted owner", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local session = "s-" .. user
            fixture.record_chat(user, session, {{id = "source", role = "user", author = {kind = "user", id = user}, content = "I prefer short answers."}})
            local db = fixture.db()
            local _, err = db:execute("UPDATE messages SET metadata = '{}' WHERE session_id = $1", {session})
            db:release()
            test.is_nil(err, tostring(err))
            fixture.extraction(memory, {})
            local result, capture_err = fixture.apply(user, "before_step", memory, session, "agent-a")
            test.is_nil(capture_err, tostring(capture_err))
            test.is_true(result.metadata.capture.captured)
            local run = fixture.wait_runs(user, memory, "derive", 1)[1]
            test.eq(run.input.span[1].author.kind, "user")
            test.eq(run.input.span[1].author.id, user)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
