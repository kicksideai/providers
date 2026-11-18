-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local runner = require("migration")
local core_db = require("core_db")
local component_types = require("component_types")
local json = require("json")
local sql = require("sql")
local uuid = require("uuid")

local PAGE_SIZE = 100

local function read_page(cursor: string?): { any }
    local db = assert(sql.get(core_db.id()))
    local query = [[SELECT id, thread_id, body FROM kickside_projection
        WHERE kind = 'knowledge.graph.meta' AND projection_key = 'graph_meta']]
    local args: { string } = {}
    if cursor then
        query = query .. " AND id > $1"
        args[1] = cursor
    end
    local rows, err = db:query(query .. " ORDER BY id LIMIT " .. tostring(PAGE_SIZE), args)
    local _, release_err = db:release()
    if err or release_err then error(tostring(err or release_err)) end
    return assert(rows)
end

local function publish(rows: { any })
    local values = assert(json.encode(rows))
    local db = assert(sql.get(component_types.db_id()))
    local engine, type_err = db:type()
    if type_err then
        db:release()
        error(tostring(type_err))
    end
    local select_rows = engine == sql.type.POSTGRES
        and [[SELECT n.meta_id, c.component_id, 'pending_source_count', n.value
              FROM jsonb_to_recordset($1::jsonb) AS n(meta_id uuid, component_id uuid, value text)
              JOIN kickside_components c ON c.component_id = n.component_id]]
        or [[SELECT json_extract(n.value, '$.meta_id'), c.component_id, 'pending_source_count',
                  json_extract(n.value, '$.value')
              FROM json_each($1) n JOIN kickside_components c ON c.component_id = json_extract(n.value, '$.component_id')]]
    local _, err = db:execute("INSERT INTO kickside_component_meta (meta_id, component_id, key, value) " .. select_rows
        .. " ON CONFLICT (component_id, key) DO NOTHING", { values })
    local _, release_err = db:release()
    if err or release_err then error(tostring(err or release_err)) end
end

local function migrate_page(_db: any, cursor: string?): string?
    local page = read_page(cursor)
    local rows: { any } = {}
    for _, projection in ipairs(page) do
        local body = type(projection.body) == "string" and assert(json.decode(projection.body)) or projection.body
        local counts = type(body) == "table" and body.counts or nil
        local count = type(counts) == "table" and tonumber(counts.pending_source_count) or nil
        if count then
            rows[#rows + 1] = {
                meta_id = uuid.v7(),
                component_id = projection.thread_id,
                value = tostring(math.max(0, math.floor(count))),
            }
        end
    end
    if #rows > 0 then publish(rows) end
    if #page == PAGE_SIZE then return tostring(page[#page].id) end
    return nil
end

return runner.define(function()
    migration("08 publish pending source count", function()
        for _, engine in ipairs({ "postgres", "sqlite" }) do
            database(engine, function()
                up(migrate_page, "external_batch")
            end)
        end
    end)
end)
