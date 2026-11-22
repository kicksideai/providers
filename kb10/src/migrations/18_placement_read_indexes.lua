-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local ops = require("ops")
local sql = require("sql")

local function execute(tx, statement, args)
    local _, err = tx:execute(statement, args)
    if err then error(err) end
end

local function backfill(tx)
    local after
    while true do
        local statement = [[SELECT id,CAST(metadata AS TEXT) AS metadata FROM kb10_nodes WHERE node_type='concept']]
        if after then statement = statement .. " AND id>$1" end
        local rows, err = tx:query(statement .. " ORDER BY id LIMIT 250", after and {after} or {})
        if err then error(err) end
        for _, node in ipairs(rows) do
            local metadata = node.metadata and json.decode(node.metadata) or {}
            local key = ops.placement_label_key(type(metadata) == "table" and metadata.label or nil)
            if key then execute(tx, "UPDATE kb10_nodes SET placement_label_key=$1 WHERE id=$2", {key, node.id}) end
        end
        if #rows < 250 then return end
        after = rows[#rows].id
    end
end

return require("migration").define(function()
    migration("18 placement read indexes", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(tx)
                    local postgres = dialect == "postgres"
                    local kind = postgres and sql.type.POSTGRES or sql.type.SQLITE
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN placement_label_key TEXT COLLATE "
                        .. (postgres and '"C"' or "BINARY"))
                    backfill(tx)
                    execute(tx, [[CREATE INDEX idx_kb10_placement_label ON kb10_nodes
                        (store_id,placement_label_key,id) WHERE node_type='concept']])
                    execute(tx, [[CREATE INDEX idx_kb10_placement_concepts ON kb10_nodes (store_id,id)
                        WHERE node_type='concept']])
                    execute(tx, [[CREATE INDEX idx_kb10_placement_root ON kb10_nodes (store_id,id)
                        WHERE node_type='concept' AND ]] .. ops.taxonomy_root_flag_sql(kind))
                    execute(tx, [[CREATE INDEX idx_kb10_placement_inbox ON kb10_edges (to_node_id,store_id,id)
                        WHERE edge_type='categorized_as']])
                    execute(tx, [[CREATE INDEX idx_kb10_placement_categorized_out ON kb10_edges (from_node_id,store_id)
                        WHERE edge_type='categorized_as']])
                    execute(tx, [[CREATE INDEX idx_kb10_placement_parent ON kb10_edges (from_node_id,store_id,to_node_id)
                        WHERE edge_type='subtopic_of']])
                end)
                down(function(tx)
                    for _, index in ipairs({"idx_kb10_placement_inbox", "idx_kb10_placement_categorized_out", "idx_kb10_placement_parent", "idx_kb10_placement_root",
                        "idx_kb10_placement_concepts", "idx_kb10_placement_label"}) do
                        execute(tx, "DROP INDEX " .. index)
                    end
                    execute(tx, "ALTER TABLE kb10_nodes DROP COLUMN placement_label_key")
                end)
            end)
        end
    end)
end)
