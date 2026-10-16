local crypto = require("crypto")
local json = require("json")
local sql = require("sql")
local kb10_store = require("kb10_store")

local M = {}

M.APP_DB = "app:db"
M.DIMS = 512
M.MATERIALIZATION_CONFIG = {
    chunk_size = 1000,
    chunk_overlap = 150,
    summary_max_chars = 800,
}

function M.uuid()
    local id, err = crypto.random.uuid()
    if err then error("uuid failed: " .. tostring(err)) end
    return id
end

function M.seed_user(db: any, user_id: string): string?
    local email = user_id:gsub("[^%w_%-]", "_") .. "@kb10.test"
    local timestamp = db:type() == sql.type.SQLITE and "strftime('%s', 'now')" or "now()"
    local _, user_err = db:execute(
        "INSERT INTO app_users (user_id, email, full_name, password_hash, status, created_at, updated_at)"
        .. " VALUES ($1, $2, 'KB10 Test User', '!test:no-password', 'active', "
        .. timestamp .. ", " .. timestamp .. ")", { user_id, email })
    if user_err then return tostring(user_err) end
    local _, group_err = db:execute(
        "INSERT INTO app_user_groups (user_id, group_id, created_at) VALUES ($1, 'kb_test', "
        .. timestamp .. ")", { user_id })
    if group_err then return tostring(group_err) end
    return nil
end

function M.drop_user(db: any, user_id: string): string?
    local _, group_err = db:execute("DELETE FROM app_user_groups WHERE user_id = $1", { user_id })
    if group_err then return tostring(group_err) end
    local _, user_err = db:execute("DELETE FROM app_users WHERE user_id = $1", { user_id })
    if user_err then return tostring(user_err) end
    return nil
end

function M.seed_thread(db: any, thread_id: string): string?
    local _, err = db:execute(
        "INSERT INTO kickside_thread (id, thread_class, component_id)"
        .. " VALUES ($1, 'kickside.knowledge.injection', $2)", { thread_id, thread_id })
    if err then return tostring(err) end
    return nil
end

function M.drop_thread(db: any, thread_id: string): string?
    local _, err = db:execute("DELETE FROM kickside_thread WHERE id = $1", { thread_id })
    if err then return tostring(err) end
    return nil
end

function M.fake_embedder(texts, _model)
    local vectors = {}
    for i, text in ipairs(texts) do
        local vec = {}
        for j = 1, M.DIMS do vec[j] = 0.0 end
        vec[1] = #text % 1000 / 1000.0
        vec[2] = i / 1000.0
        vectors[i] = vec
    end
    return { result = vectors }, nil
end

function M.dispatcher_for(handlers)
    return function(event)
        local h = handlers[event.type]
        if not h then return nil, nil end
        return h(event)
    end
end

local function kb10_materializer_adapter()
    return {
        vector_dimensions = function(_self, _args)
            return M.DIMS, nil
        end,
        replace_document = function(_self, args)
            return kb10_store.replace_document(args.store_id, {
                document = args.document,
                children = args.children,
            })
        end,
        delete_documents_by_external_id = function(_self, args)
            return kb10_store.delete_documents_by_external_id(
                args.store_id,
                args.external_source,
                args.external_id
            )
        end,
    }
end

function M.materialized_store_resolver_for(allowed)
    local materializer = kb10_materializer_adapter()
    return function(component_id)
        if allowed[component_id] then
            return {
                store = materializer,
                store_row = {
                    id = component_id,
                    component_id = component_id,
                    embedding_model = "class:embed",
                    kb_type = "document",
                },
                engine = { default_config = M.MATERIALIZATION_CONFIG },
            }, nil
        end
        return nil, nil
    end
end

function M.worker_deps(opts)
    opts = opts or {}
    opts.component = opts.component or {
        set_meta = function() return true, nil end,
    }
    return opts
end

function M.bootstrap_kb10_store(db)
    local component_id = M.uuid()
    local _, err = db:execute(
        "INSERT INTO kb10_stores (id, component_id, embedding_model, config, kb_type) VALUES ($1, $2, $3, $4, $5)",
        { component_id, component_id, "class:embed", "{}", "document" }
    )
    if err then error("insert kb10_store failed: " .. tostring(err)) end
    return component_id
end

function M.teardown_kb10_store(db, component_id)
    db:execute("DELETE FROM kb10_embeddings WHERE store_id = $1", { component_id })
    db:execute("DELETE FROM kb10_nodes_fts WHERE node_id IN (SELECT id FROM kb10_nodes WHERE store_id = $1)", { component_id })
    db:execute("DELETE FROM kb10_nodes WHERE store_id = $1", { component_id })
    db:execute("DELETE FROM kb10_stores WHERE id = $1", { component_id })
end

function M.fetch_kb10_nodes(db, component_id)
    return db:query(
        "SELECT id, node_type, content, content_type, metadata FROM kb10_nodes WHERE store_id = $1",
        { component_id }
    ) or {}
end

function M.decode_metadata(value: any): { [string]: any }
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then return {} end
    return decoded :: { [string]: any }
end

function M.build_event(opts)
    opts = opts or {}
    return {
        id = opts.id or M.uuid(),
        seq = opts.seq or 1,
        role = "user",
        type = opts.type or "fixture.page",
        body = json.encode(opts.body or {}),
        created_at = "2026-05-06T00:00:00Z",
    }
end

function M.document_handler(event)
    local body = event.body or {}
    local page_id = tostring(body.page_id or "")
    local document = {
        external_source = "fixture",
        external_id = page_id,
        node_type = "document",
        content_type = "text/plain",
        title = body.title or "",
        content = (body.title or "") .. "\n\n" .. (body.text or ""),
        embed_text = (body.title or "") .. " " .. (body.text or ""),
        metadata = {
            external_source = "fixture",
            external_id = page_id,
            title = body.title,
        },
    }
    return { documents = { document }, claims = {} }, nil
end

return M
