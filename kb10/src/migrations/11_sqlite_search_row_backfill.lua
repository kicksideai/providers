-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")

local batch_size = 200

local function fts_page(tx, after)
    local rows, err = tx:query([[SELECT CAST(rowid AS TEXT) AS cursor, node_id
        FROM kb10_nodes_fts WHERE rowid > CAST($1 AS INTEGER) ORDER BY rowid LIMIT ]] .. batch_size, {after})
    if err then error(err) end
    if #rows > 0 then
        local encoded, encode_err = json.encode(rows)
        if encode_err then error(encode_err) end
        local _, update_err = tx:execute([[UPDATE kb10_nodes
            SET fts_rowid = CAST(json_extract(entry.value, '$.cursor') AS INTEGER)
            FROM json_each($1) entry WHERE kb10_nodes.id = json_extract(entry.value, '$.node_id')
            AND fts_rowid IS NULL]], {encoded})
        if update_err then error(update_err) end
    end
    return rows
end

local function embedding_page(tx, after)
    -- The vec0 TEXT primary key supports point reads. Page the existing rowid
    -- shadow table, then resolve each vector through its unchanged public key.
    local rows, err = tx:query([[WITH page AS MATERIALIZED (
        SELECT rowid, id FROM kb10_embeddings_rowids
        WHERE rowid > CAST($1 AS INTEGER) ORDER BY rowid LIMIT ]] .. batch_size .. [[
        ) SELECT CAST(p.rowid AS TEXT) AS cursor, e.id, e.node_id, e.store_id
        FROM page p CROSS JOIN kb10_embeddings e WHERE e.id = p.id ORDER BY p.rowid]], {after})
    if err then error(err) end
    if #rows > 0 then
        local encoded, encode_err = json.encode(rows)
        if encode_err then error(encode_err) end
        local _, update_err = tx:execute([[WITH keys AS (
            SELECT json_extract(value, '$.node_id') AS node_id, json_extract(value, '$.store_id') AS store_id,
                json_group_array(json_extract(value, '$.id')) AS ids
            FROM json_each($1) GROUP BY node_id, store_id
        ) UPDATE kb10_nodes AS n SET embedding_ids = (
            SELECT json_group_array(value) FROM (
                SELECT value FROM json_each(n.embedding_ids)
                UNION SELECT value FROM json_each(keys.ids)
            )
        ) FROM keys WHERE n.id = keys.node_id AND n.store_id = keys.store_id]], {encoded})
        if update_err then error(update_err) end
    end
    return rows
end

return require("migration").define(function()
    migration("11 SQLite search row backfill", function()
        database("sqlite", function()
            up(function(tx, checkpoint)
                local fts = not checkpoint or checkpoint:sub(1, 1) == "f"
                local after = checkpoint and checkpoint:sub(2) or "0"
                local rows = (fts and fts_page or embedding_page)(tx, after)
                if #rows == batch_size then
                    return (fts and "f" or "e") .. rows[#rows].cursor
                end
                if fts then return "e0" end
                return nil
            end, "batch")
        end)
    end)
end)
