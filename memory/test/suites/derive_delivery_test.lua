-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local test = require("test")
local fixture = require("fixture")

local function request_count(component_id: string): integer
    return #fixture.script.requests(component_id, "structured_output")
end

local function define_tests()
    test.describe("derive delivery", function()
        test.it("completes an accepted derive after a later capture advances its cursor", function()
            local user = fixture.user()
            local component_id = fixture.memory(user)
            local session_id = "s-" .. user
            local first_event_id = fixture.record_chat(user, session_id, {
                { id = "first", role = "user", author = { kind = "user", id = user }, content = "I live in Oslo." },
            })[1]
            fixture.extraction(component_id, {
                fixture.candidate("fact", "home", "Oslo", "The user lives in Oslo.", first_event_id),
            })

            local db = fixture.db()
            local sqlite = db:type() == "sqlite"
            local statements = sqlite and {
                [[CREATE TRIGGER block_derive_finish BEFORE UPDATE OF status ON kickside_memory_runs
                    WHEN NEW.status = 'succeeded' AND OLD.run_type = 'derive'
                    BEGIN SELECT RAISE(ABORT, 'derive finish rejected'); END]],
            } or {
                [[CREATE FUNCTION block_derive_finish_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
                    IF NEW.status = 'succeeded' AND OLD.run_type = 'derive' THEN RAISE EXCEPTION 'derive finish rejected'; END IF;
                    RETURN NEW;
                END $$]],
                [[CREATE TRIGGER block_derive_finish BEFORE UPDATE OF status ON kickside_memory_runs
                    FOR EACH ROW EXECUTE FUNCTION block_derive_finish_fn()]],
            }
            for _, statement in ipairs(statements) do
                local _, setup_err = db:execute(statement)
                test.is_nil(setup_err, tostring(setup_err))
            end
            db:release()

            local captured, capture_err = fixture.apply(user, "before_step", component_id, session_id, "agent-a")
            test.is_nil(capture_err, tostring(capture_err))
            local first_run = fixture.wait_run(user, captured.metadata.capture.run_id, function(run: any): boolean
                return run.status == "failed"
            end)
            test.eq(fixture.op(user, "cursor", { component_id = component_id, host_kind = "session", host_id = session_id }).last_event_id, first_event_id)
            local first_head = fixture.rows("SELECT event_count FROM kickside_thread WHERE id = $1", { component_id })[1].event_count
            local first_requests = request_count(component_id)

            db = fixture.db()
            local _, drop_err = db:execute(sqlite and "DROP TRIGGER block_derive_finish" or "DROP TRIGGER block_derive_finish ON kickside_memory_runs")
            test.is_nil(drop_err, tostring(drop_err))
            if not sqlite then
                local _, function_err = db:execute("DROP FUNCTION block_derive_finish_fn()")
                test.is_nil(function_err, tostring(function_err))
            end
            db:release()

            local second_event_id = fixture.record_chat(user, session_id, {
                { id = "second", role = "user", author = { kind = "user", id = user }, content = "I enjoy cycling." },
            })[1]
            fixture.extraction(component_id, {})
            local later, later_err = fixture.apply(user, "before_step", component_id, session_id, "agent-a")
            test.is_nil(later_err, tostring(later_err))
            local later_run = fixture.wait_run(user, later.metadata.capture.run_id, function(run: any): boolean
                return run.status == "succeeded"
            end)
            test.eq(later_run.status, "succeeded")
            test.eq(fixture.op(user, "cursor", { component_id = component_id, host_kind = "session", host_id = session_id }).last_event_id, second_event_id)
            local advanced_head = fixture.rows("SELECT event_count FROM kickside_thread WHERE id = $1", { component_id })[1].event_count
            test.is_true(advanced_head > first_head)
            test.eq(request_count(component_id), first_requests + 1)

            local redelivered, redelivery_err = fixture.op(user, "derive_worker", { component_id = component_id, run_id = first_run.id })
            test.is_nil(redelivery_err, tostring(redelivery_err))
            test.is_true(redelivered.ok)
            local completed = fixture.wait_run(user, first_run.id, function(run: any): boolean
                return run.status == "succeeded"
            end)
            test.eq(completed.status, "succeeded")
            test.eq(request_count(component_id), first_requests + 1)
            test.eq(fixture.rows("SELECT event_count FROM kickside_thread WHERE id = $1", { component_id })[1].event_count, advanced_head)
            test.eq(fixture.op(user, "cursor", { component_id = component_id, host_kind = "session", host_id = session_id }).last_event_id, second_event_id)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
