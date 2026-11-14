-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local funcs = require("funcs")
local security = require("security")
local env = require("env")
local uuid = require("uuid")
local sql = require("sql")
local json = require("json")
local store = require("store")
local kb_store = require("kb_store")
local materializer = require("materializer")
local models = require("models")
local models_cache = require("models_cache")
local upload_records = require("upload_records")
local upload_tokens = require("upload_tokens")

local function key_denied()
    local key, err = env.get("ENCRYPTION_KEY")
    return key == nil and err ~= nil
end

local function probe(input)
    assert(key_denied(), "caller reads the encryption key")
    local bound, bind_err = funcs.new():with_context({ component_id = input.id, node_id = input.node_id })
    assert(bound, tostring(bind_err))
    local result, err = bound:call(input.target, { query = "reference" })
    assert(key_denied(), "caller reads the encryption key after dispatch")
    return { result = result, error = err and tostring(err) }
end

local function execute(id, target, node_id)
    local scope = security.new_scope({ assert(security.policy("app:key_owner_runtime")),
        assert(security.policy("app:key_owner_calls")), assert(security.policy("app:key_owner_storage_env")) })
    local actor = assert(security.new_actor("keyless-reader", {}))
    for _, name in ipairs({ "app:key_owner_runtime", "app:key_owner_calls", "app:key_owner_storage_env" }) do
        local policy = assert(security.policy(name))
        test.eq(policy:evaluate(actor, "env.get", "ENCRYPTION_KEY"), "undefined")
        test.eq(policy:evaluate(actor, "funcs.call", "kickside.models.persist:reload_profiles"), "undefined")
        test.eq(policy:evaluate(actor, "funcs.call", "kickside.uploads.persist:token_pack_read"), "undefined")
    end
    return funcs.new():with_actor(security.new_actor("keyless-reader", {})):with_scope(scope)
        :call("app:key_owner_runtime_probe", { id = id, node_id = node_id, target = target })
end

local function run_tests()
    test.describe("KB10 keyless owner dispatch", function()
        test.it("creates and verifies a local source token through the source entry", function()
            local id, upload_id = uuid.v7(), uuid.v7()
            local db = assert(sql.get("app:db"))
            local responses = assert(store.get("app:key_owner_responses"))
            local ok, failure = pcall(function()
                assert(db:execute([[INSERT INTO kickside_components
                    (component_id, impl_id, private_context, created_at, updated_at)
                    VALUES ($1, 'kickside.kb10:embeddable', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)]], { id }))
                assert(db:execute([[INSERT INTO kickside_component_access
                    (access_id, subject_type, subject_id, component_id, source_component_id, access_mask, created_at)
                    VALUES ($1, 'user', 'keyless-reader', $2, $3, 15, CURRENT_TIMESTAMP)]], { uuid.v7(), id, id }))
                local _, create_err = kb_store.create_store(id, "unused", {}, {})
                test.is_nil(create_err, tostring(create_err))
                local lineage = { external_source = "test", external_id = id, external_version = "1",
                    thread_event_id = uuid.v7(), thread_event_seq = 1,
                    source_ref = { external_source = "test", external_id = id, external_version = "1" }, upload_id = upload_id }
                lineage.source_ref.thread_event_id = lineage.thread_event_id
                lineage.source_ref.thread_event_seq = lineage.thread_event_seq
                local document, document_err = materializer.replace_document(materializer, { store_id = id,
                    document = { node_type = "document", content = "reference", content_type = "text/plain", metadata = lineage }, children = {} })
                test.is_nil(document_err, tostring(document_err))
                local _, upload_err = upload_records.create(upload_id, "keyless-reader", 9, "text/plain",
                    "app:uploads", upload_id, "document", {}, "completed")
                test.is_nil(upload_err, tostring(upload_err))
                local result, err = execute(id, "kickside.kb10.api:source", document.document_node_id)
                test.is_nil(err, tostring(err))
                test.is_nil(result.error, result.error)
                local response = assert(json.decode(assert(responses:get(id))))
                test.eq(response.status, 200)
                test.is_true(response.body.success)
                test.is_true(response.before_denied)
                test.is_true(response.after_denied)
                local prefix = "/api/v1/uploads/" .. upload_id .. "/raw?token="
                test.eq(response.body.url:sub(1, #prefix), prefix)
                local token = response.body.url:sub(#prefix + 1)
                test.is_true(#token > 0)
                local payload, token_err = upload_tokens.unpack_read(token, { upload_id = upload_id })
                test.is_nil(token_err, tostring(token_err))
                test.eq(payload.audience, "kb.source")
                test.eq(payload.expires_at - payload.issued_at, 300)
            end)
            local _, response_err = responses:delete(id)
            test.is_nil(response_err, tostring(response_err)); responses:release()
            local _, delete_err = kb_store.delete_store(id)
            test.is_nil(delete_err, tostring(delete_err))
            assert(db:execute("DELETE FROM kickside_uploads WHERE uuid=$1", { upload_id }))
            assert(db:execute("DELETE FROM kickside_component_access WHERE component_id=$1", { id }))
            assert(db:execute("DELETE FROM kickside_components WHERE component_id=$1", { id }))
            db:release()
            if not ok then error(failure) end
        end)

        test.it("reloads encrypted Models profiles through an uncached query entry", function()
            local id = uuid.v7()
            local name = "keyless-" .. id
            local ok, failure = pcall(function()
                local profile, profile_err = models.create_profile({ id = name, name = name,
                    provider_id = "app.analysis:provider", api_key = "fixture-model-secret" })
                test.is_nil(profile_err, tostring(profile_err))
                test.not_nil(profile)
                local _, card_err = models.upsert_card({ name = name, class = { name },
                    provider_id = "app.analysis:provider", provider_profile_id = name, provider_model = "available",
                    capabilities = { "embed" }, dimensions = 512, max_tokens = 4096 })
                test.is_nil(card_err, tostring(card_err))
                local _, create_err = kb_store.create_store(id, name, { analysis_model = "class:" .. name }, {})
                test.is_nil(create_err, tostring(create_err))
                models_cache.clear()
                test.is_nil(models_cache.read())
                local result, err = execute(id, "kickside.kb10.binding:query_func")
                test.is_nil(err, tostring(err))
                test.is_nil(result.error, result.error)
                test.is_true(result.result.success)
                test.eq(result.result.count, 0)
                local snapshot = models_cache.read()
                test.not_nil(snapshot, "query publishes the cold Models snapshot")
                local found = false
                for _, saved in ipairs(snapshot.profiles) do
                    if saved.id == name then
                        test.is_nil(saved.error)
                        test.eq(saved.secret_config.api_key, "fixture-model-secret")
                        found = true
                    end
                end
                test.is_true(found, "query reload decrypts the persisted profile")
            end)
            local _, delete_err = kb_store.delete_store(id)
            test.is_nil(delete_err, tostring(delete_err))
            local _, card_err = models.delete_card(name)
            test.is_nil(card_err, tostring(card_err))
            local _, profile_err = models.delete_profile(name)
            test.is_nil(profile_err, tostring(profile_err))
            if not ok then error(failure) end
        end)
    end)
end

return { run = test.run_cases(run_tests), probe = probe }
