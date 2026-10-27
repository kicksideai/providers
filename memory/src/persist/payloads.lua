-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local json = require("json")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")

local M = {}

function M.encode_value(value: any): any
    if value == nil then return sql.NULL end
    return json.encode(value)
end
function M.get_tx(tx: any, component_id: string, payload_id: string): (any?, error?)
    local rows, err = tx:query("SELECT content, value, content_hash, embedding FROM kickside_memory_payloads WHERE component_id = $1 AND item_id = $2",
        { component_id, payload_id })
    if err then return nil, types.failed("memory payload read failed", err) end
    if not rows or #rows == 0 then return nil, nil end
    rows[1].value = types.decode_json(rows[1].value)
    return rows[1], nil
end
-- Folding and re-embedding serialize vector replacement under the accepted item lock.
function M.replace_embedding_tx(tx: any, sqlite: boolean, component_id: string, item_id: string, embedding: string?, content_hash: string): (boolean?, error?)
    local rows, read_err = tx:query("SELECT status, content_hash FROM kickside_memory_items WHERE component_id = $1 AND id = $2" ..
        (sqlite and "" or " FOR UPDATE"), { component_id, item_id })
    if read_err then return nil, types.failed("memory embedding snapshot read failed", read_err) end
    if not rows or not rows[1] or rows[1].status == types.STATUS.FORGOTTEN or rows[1].content_hash ~= content_hash then return false, nil end
    local _, payload_err = tx:execute("UPDATE kickside_memory_payloads SET embedding = $1 WHERE component_id = $2 AND owner_item_id = $3 AND content_hash = $4",
        { embedding or sql.NULL, component_id, item_id, content_hash })
    if payload_err then return nil, types.failed("memory embedding payload update failed", payload_err) end
    local _, del_err = tx:execute("DELETE FROM kickside_memory_embeddings WHERE component_id = $1 AND item_id = $2", { component_id, item_id })
    if del_err then return nil, types.failed("memory vector delete failed", del_err) end
    if embedding then
        local err = index.insert_rows_tx(tx, "kickside_memory_embeddings", { "item_id", "component_id", "embedding", "content_hash" },
            { { item_id, component_id, embedding, content_hash } })
        if err then return nil, types.failed("memory vector insert failed", err) end
    end
    return true, nil
end
type Staged = {
    payload_id: string,
    owner_item_id: string,
    content: string,
    value: any,
    content_hash: string,
    vector: { number }?,
    key_id: string?,
    scope_key: string?,
    key: string?,
    cardinality: string?,
}

function M.stage_tx(tx: any, component_id: string, staged: { Staged }): error?
    for _, entry in ipairs(staged) do
        if entry.key_id then
            local _, key_err = tx:execute("INSERT INTO kickside_memory_keys (id, component_id, scope_key, key, cardinality) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (component_id, scope_key, key) DO NOTHING",
                { entry.key_id, component_id, entry.scope_key, entry.key, entry.cardinality })
            if key_err then return types.failed("memory key stage failed", key_err) end
        end
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_payloads (item_id, component_id, owner_item_id, content, value, content_hash, embedding, created_at) " ..
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (item_id) DO NOTHING",
            { entry.payload_id, component_id, entry.owner_item_id, entry.content, M.encode_value(entry.value), entry.content_hash, entry.vector and index.vector_literal(entry.vector) or sql.NULL, types.now() })
        if err then return types.failed("memory payload stage failed", err) end
    end
    return nil
end
function M.set_embedding(component_id: string, item_id: string, vector: { number }, content_hash: string): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        return M.replace_embedding_tx(tx, sqlite, component_id, item_id, index.vector_literal(vector), content_hash)
    end)
end

return M
