local test = require("test")
local contract = require("contract")
local sql = require("sql")
local json = require("json")
local uuid = require("uuid")
local security = require("security")
local state = require("state")
local persist = require("persist")

local COMPONENT = uuid.v4()
local DB = "app:db"

local function sends(): { any }
    local db = sql.get(DB)
    assert(db, "test database unavailable")
    local rows, read_err = db:query("SELECT token, channel_id, content, nonce, enforce_nonce FROM discord_reply_transport_audit")
    db:release()
    test.is_nil(read_err)
    return rows or {}
end

local function probe(): any
    local def, def_err = contract.get("app.suites:transport_probe")
    test.is_nil(def_err)
    local instance, open_err = def:open("app.suites:transport_probe_binding", { component_id = COMPONENT })
    test.is_nil(open_err)
    return instance
end

local function define_tests()
    test.describe("Discord connection authorization", function()
        test.before_all(function()
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            test.not_nil(db)
            local private, encode_err = json.encode({ bot_token = "test_token_fake" })
            test.is_nil(encode_err)
            local _, insert_err = db:execute(
                [[INSERT INTO kickside_components (component_id, impl_id, private_context, created_at, updated_at)
                  VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]],
                { COMPONENT, "kickside.discord.connection:discord_connection", private })
            test.is_nil(insert_err)
            local actor = security.actor()
            test.not_nil(actor)
            local _, grant_err = db:execute(
                [[INSERT INTO kickside_component_access
                  (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                  VALUES ($1, 'user', $2, $3, $4, 2, CURRENT_TIMESTAMP)]],
                { uuid.v4(), tostring(actor:id()), COMPONENT, COMPONENT })
            test.is_nil(grant_err)
            local _, audit_err = db:execute([[CREATE TABLE IF NOT EXISTS discord_reply_transport_audit
                (token TEXT NOT NULL, channel_id TEXT NOT NULL, content TEXT NOT NULL, nonce TEXT, enforce_nonce TEXT)]])
            test.is_nil(audit_err)
            db:release()
        end)

        test.after_all(function()
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            if db then
                db:execute("DELETE FROM kickside_component_access WHERE component_id = $1", { COMPONENT })
                db:execute("DELETE FROM kickside_components WHERE component_id = $1", { COMPONENT })
                db:release()
            end
        end)

        test.before_each(function()
            state.reset()
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            db:execute("DELETE FROM discord_reply_transport_audit")
            db:release()
        end)

        test.it("sends an ordinary outbound post under connection WRITE", function()
            local result, call_err = probe():run({ kind = "outbound", channel_id = "room1",
                payload = { content = "hello" } })
            test.is_nil(call_err)
            test.is_true(result.success, tostring(result.error))
            test.eq(result.message_ref, "sent-1")
            local delivered = sends()
            test.eq(#delivered, 1)
            test.eq(delivered[1].token, "test_token_fake")
            test.eq(delivered[1].channel_id, "room1")
        end)

        test.it("sends a keyed outbound post with the key's enforced nonce", function()
            local posts = {
                { content = "first attempt", key = "delivery-1" },
                { content = "retried attempt", key = "delivery-1" },
                { content = "other delivery", key = "delivery-2" },
                { content = "unkeyed" },
            }
            for _, post in ipairs(posts) do
                local result, call_err = probe():run({ kind = "outbound", channel_id = "room1",
                    payload = { content = post.content }, idempotency_key = post.key })
                test.is_nil(call_err)
                test.is_true(result.success, tostring(result.error))
            end
            local by_content = {}
            for _, row in ipairs(sends()) do by_content[row.content] = row end
            local first, retried = by_content["first attempt"], by_content["retried attempt"]
            local other, unkeyed = by_content["other delivery"], by_content["unkeyed"]
            test.eq(#first.nonce, 25)
            test.eq(first.enforce_nonce, "true")
            test.eq(retried.nonce, first.nonce)
            test.eq(retried.enforce_nonce, "true")
            test.not_nil(other.nonce)
            test.is_true(other.nonce ~= first.nonce)
            test.is_nil(unkeyed.nonce)
            test.is_nil(unkeyed.enforce_nonce)
        end)

        test.it("refuses an outbound post after WRITE is revoked", function()
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            local _, revoke_err = db:execute(
                "UPDATE kickside_component_access SET access_mask = 1 WHERE component_id = $1", { COMPONENT })
            test.is_nil(revoke_err)
            db:release()
            local result, call_err = probe():run({ kind = "outbound", channel_id = "room1",
                payload = { content = "secret" } })
            test.is_nil(call_err)
            test.is_false(result.success)
            test.eq(#sends(), 0)
            db = sql.get(DB)
            assert(db, "test database unavailable")
            db:execute("UPDATE kickside_component_access SET access_mask = 2 WHERE component_id = $1", { COMPONENT })
            db:release()
        end)

        test.it("checks a real admitted proof and retains the provider receipt", function()
            local _, accept_err, proof = persist.accept_turn(DB, {
                session_provider = "discord",
                execution_ref = { owner_id = "channel.notice", record_id = "in-1", generation = 1 },
                thread = { role = "notice" },
                reply = { component_id = COMPONENT, resource_id = "room1" },
                inbound = { external_message_id = "in-1" },
            }, { kind = "transport", id = "discord.gateway" }, "in-1")
            test.is_nil(accept_err)
            test.not_nil(proof)
            local args = { channel_id = "room1", payload = { content = "notice" }, reply_proof = proof }
            local result, call_err = probe():run(args)
            test.is_nil(call_err)
            test.is_true(result.success, tostring(result.error))
            test.eq(result.message_ref, "sent-1")
            test.eq(#sends(), 1)
            local replay, replay_err = probe():run(args)
            test.is_nil(replay_err)
            test.is_true(replay.success)
            test.eq(replay.message_ref, "sent-1")
            test.eq(#sends(), 1)
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            local rows, read_err = db:query(
                "SELECT reply_state, reply_message_ref FROM kickside_channel_turns WHERE turn_id = $1", { proof.turn_id })
            db:release()
            test.is_nil(read_err)
            test.eq(rows[1].reply_state, "sent")
            test.eq(rows[1].reply_message_ref, "sent-1")
        end)

        test.it("refuses forged proofs before any Discord request", function()
            local result, call_err = probe():run({ channel_id = "room1",
                payload = { content = "notice" }, reply_proof = { turn_id = "forged", seal = "forged" } })
            test.is_nil(call_err)
            test.is_false(result.success)
            test.eq(#sends(), 0)
        end)

        test.it("preserves a retriable receipt-store failure after a remote send", function()
            local _, accept_err, proof = persist.accept_turn(DB, {
                session_provider = "discord",
                execution_ref = { owner_id = "channel.notice", record_id = "in-2", generation = 1 },
                thread = { role = "notice" },
                reply = { component_id = COMPONENT, resource_id = "room1" },
                inbound = { external_message_id = "in-2" },
            }, { kind = "transport", id = "discord.gateway" }, "in-2")
            test.is_nil(accept_err)
            local result, call_err = probe():run({ channel_id = "room1",
                payload = { content = "break-receipt:" .. proof.turn_id }, reply_proof = proof })
            test.is_nil(call_err)
            local db = sql.get(DB)
            assert(db, "test database unavailable")
            local rows, read_err = db:query(
                "SELECT reply_hash FROM kickside_channel_turns WHERE turn_id = $1", { proof.turn_id })
            db:release()
            test.is_nil(read_err)
            test.eq(rows[1].reply_hash, "injected-receipt-conflict")
            test.is_false(result.success)
            test.is_true(result.uncertain)
            test.is_true(errors.is(result.error, errors.UNAVAILABLE))
            test.is_true((result.error :: any):retryable())
            test.eq(#sends(), 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
