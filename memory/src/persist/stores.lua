-- One row per memory knowledge base: kb_type, embedding model and the
-- validated engine configuration. Also owns the bounded purge of every row a
-- memory keeps.

local json = require("json")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")

local M = {}

-- Item ids removed per purge page; a page removes their provenance, vectors and
-- full-text rows in the same transaction.
local PURGE_PAGE = 200

local function decode_row(row: any): any
    row.config = types.decode_json(row.config) or {}
    return row
end

function M.create(component_id: string, kb_type: string, embedding_model: string, config: any): (any?, error?)
    local now = types.now()
    return db.write(nil, function(tx: any, _sqlite: boolean): (any, error?)
        local existing, read_err = tx:query("SELECT component_id FROM kickside_memory_stores WHERE component_id = $1", { component_id })
        if read_err then return nil, types.failed("memory store lookup failed", read_err) end
        if existing and #existing > 0 then
            return nil, errors.new({ kind = errors.ALREADY_EXISTS, message = "memory store already exists for " .. component_id })
        end
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_stores (component_id, kb_type, embedding_model, config, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5)",
            { component_id, kb_type, embedding_model, json.encode(config), now })
        if err then return nil, types.failed("memory store insert failed", err) end
        return { success = true, store_id = component_id }, nil
    end)
end

function M.get(component_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT component_id, kb_type, embedding_model, config, created_at, updated_at FROM kickside_memory_stores WHERE component_id = $1",
            { component_id })
        if err then return nil, types.failed("memory store read failed", err) end
        if not rows or #rows == 0 then return nil, types.not_found("memory store not found for component " .. component_id) end
        return decode_row(rows[1]), nil
    end)
end

function M.update_config(component_id: string, config: any): (any?, error?)
    return db.write(component_id, function(tx: any, _sqlite: boolean): (any, error?)
        local _, err = tx:execute(
            "UPDATE kickside_memory_stores SET config = $1, updated_at = $2 WHERE component_id = $3",
            { json.encode(config), types.now(), component_id })
        if err then return nil, types.failed("memory store config update failed", err) end
        return { success = true }, nil
    end)
end

-- Removes one page of the memory's rows. Returns { done, removed }: done is
-- true once no item, provenance, vector, cursor, run or store row is left.
function M.purge_page(component_id: string): (any?, error?)
    return db.write(nil, function(tx: any, sqlite: boolean): (any, error?)
        local rows, err = tx:query("SELECT id FROM kickside_memory_items WHERE component_id = $1 ORDER BY id LIMIT $2",
            { component_id, PURGE_PAGE })
        if err then return nil, types.failed("memory purge read failed", err) end
        local ids: { string } = {}
        for _, row in ipairs(rows or {}) do ids[#ids + 1] = tostring(row.id) end
        if #ids > 0 then
            local marks = index.placeholders(#ids, 1)
            local statements = {
                "DELETE FROM kickside_memory_provenance WHERE item_id IN (" .. marks .. ")",
                "DELETE FROM kickside_memory_embeddings WHERE item_id IN (" .. marks .. ")",
                "DELETE FROM kickside_memory_items WHERE id IN (" .. marks .. ")",
            }
            if sqlite then table.insert(statements, 1, "DELETE FROM kickside_memory_fts WHERE item_id IN (" .. marks .. ")") end
            for _, statement in ipairs(statements) do
                local _, del_err = tx:execute(statement, ids)
                if del_err then return nil, types.failed("memory purge failed", del_err) end
            end
            return { done = false, removed = #ids }, nil
        end
        for _, statement in ipairs({
            "DELETE FROM kickside_memory_provenance WHERE component_id = $1",
            "DELETE FROM kickside_memory_embeddings WHERE component_id = $1",
            "DELETE FROM kickside_memory_cursors WHERE component_id = $1",
            "DELETE FROM kickside_memory_runs WHERE component_id = $1",
            "DELETE FROM kickside_memory_stores WHERE component_id = $1",
        }) do
            local _, del_err = tx:execute(statement, { component_id })
            if del_err then return nil, types.failed("memory purge failed", del_err) end
        end
        return { done = true, removed = 0 }, nil
    end)
end

return M
