-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local db = require("memory_db")
local types = require("types")
local index = require("search_index")

local M = {}

local IN_BATCH = 100

local COLUMNS = {
    "component_id", "claim_id", "kind", "scope_family", "scope_id", "scope_key", "key", "cardinality", "content", "value",
    "content_hash", "status", "version", "valid_at", "invalid_at", "recorded_at", "superseded_by", "conflict_group",
    "confidence", "source", "run_id", "priority", "last_seq",
}

local SEARCH_SPEC = {
    vectors = "kickside_memory_embeddings",
    vector_key = "item_id",
    rows = "kickside_memory_items",
    row_key = "id",
    partition = "component_id",
    columns = COLUMNS,
    fts = "kickside_memory_fts",
    fts_key = "item_id",
    tsvector = "search_vector",
}

local SELECT = "SELECT id, " .. table.concat(COLUMNS, ", ") .. " FROM kickside_memory_items"

local function in_batches(values: { any }, fn: (values: { any }) -> error?): error?
    for first = 1, #values, IN_BATCH do
        local batch: { any } = {}
        for i = first, math.min(first + IN_BATCH - 1, #values) do batch[#batch + 1] = values[i] end
        local err = fn(batch)
        if err then return err end
    end
    return nil
end

local function decode(row: any): (any?, error?)
    if row.value ~= nil then
        local value, err = types.decode_json(row.value)
        if err then return nil, err end
        row.value = value
    end
    row.version = tonumber(row.version) or 0
    row.priority = tonumber(row.priority) or 0
    row.last_seq = tonumber(row.last_seq) or 0
    if row.confidence ~= nil then row.confidence = tonumber(row.confidence) end
    return row, nil
end

local function decode_all(rows: any): (any?, error?)
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local decoded, err = decode(row)
        if err then return nil, err end
        out[#out + 1] = decoded
    end
    return out, nil
end

function M.get_tx(tx: any, component_id: string, item_id: string): (any?, error?)
    local rows, err = tx:query(SELECT .. " WHERE component_id = $1 AND id = $2", { component_id, item_id })
    if err then return nil, types.failed("memory item read failed", err) end
    if not rows or #rows == 0 then return nil, nil end
    return decode(rows[1])
end

function M.get(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        return M.get_tx(conn, component_id, item_id)
    end)
end

type ListFilter = {
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    scope_family: string?,
    key: string?,
    claim_ids: { string }?,
    conflict_groups: { string }?,
    limit: integer?,
    offset: integer?,
}

function M.list(component_id: string, filter: ListFilter): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local where: { string } = { "component_id = $1" }
        local params: { any } = { component_id }
        local function add_in(column: string, values: { string }?)
            if values and #values > 0 then
                where[#where + 1] = column .. " IN (" .. index.placeholders(#values, #params + 1) .. ")"
                for _, v in ipairs(values) do params[#params + 1] = v end
            end
        end
        local function add_eq(column: string, value: string?)
            if value and value ~= "" then
                params[#params + 1] = value
                where[#where + 1] = column .. " = $" .. #params
            end
        end
        add_in("kind", filter.kinds)
        add_in("status", filter.statuses)
        add_in("scope_key", filter.scope_keys)
        add_eq("scope_family", filter.scope_family)
        add_eq("key", filter.key)
        add_in("claim_id", filter.claim_ids)
        add_in("conflict_group", filter.conflict_groups)
        params[#params + 1] = filter.limit or 100
        params[#params + 1] = filter.offset or 0
        local rows, err = conn:query(SELECT .. " WHERE " .. table.concat(where, " AND ") ..
            " ORDER BY kind, priority DESC, key, version DESC, id LIMIT $" .. (#params - 1) .. " OFFSET $" .. #params, params)
        if err then return nil, types.failed("memory item list failed", err) end
        return decode_all(rows)
    end)
end

function M.all(component_id: string, filter: ListFilter): (any?, error?)
    local out: { any } = {}
    local page_filter: any = {}
    for k, v in pairs(filter) do page_filter[k] = v end
    page_filter.limit = 200
    page_filter.offset = 0
    while true do
        local page, err = M.list(component_id, page_filter)
        if err then return nil, err end
        for _, row in ipairs(page) do out[#out + 1] = row end
        if #page < page_filter.limit then return out, nil end
        page_filter.offset = page_filter.offset + #page
    end
end

function M.key_metadata(component_id: string, keys: { any }): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local out = {}
        local batch_err = in_batches(keys, function(batch: { any }): error?
            local params, matches = { component_id }, {}
            for _, key in ipairs(batch) do
                matches[#matches + 1] = "(k.scope_key = $" .. (#params + 1) .. " AND k.key = $" .. (#params + 2) .. ")"
                params[#params + 1] = key.scope_key
                params[#params + 1] = key.key
            end
            local rows, err = conn:query([[SELECT k.scope_key, k.key, k.cardinality, i.kind
                FROM kickside_memory_keys k LEFT JOIN kickside_memory_items i
                ON i.component_id = k.component_id AND i.scope_key = k.scope_key AND i.key = k.key
                WHERE k.component_id = $1 AND (]] .. table.concat(matches, " OR ") .. ") GROUP BY k.scope_key, k.key, k.cardinality, i.kind", params)
            if err then return types.failed("memory key metadata read failed", err) end
            for _, row in ipairs(rows) do out[#out + 1] = row end
            return nil
        end)
        if batch_err then return nil, batch_err end
        return out, nil
    end)
end

function M.key_cardinality(component_id: string, scope_key: string, key: string): (string?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query("SELECT cardinality FROM kickside_memory_keys WHERE component_id = $1 AND scope_key = $2 AND key = $3",
            { component_id, scope_key, key })
        if err then return nil, types.failed("memory key cardinality read failed", err) end
        return rows and rows[1] and rows[1].cardinality or nil, nil
    end)
end

function M.invariant_snapshot(tx: any, component_id: string, keys: { any }, ids: { string }): (any?, error?)
    local counts, statuses = {}, {}
    local counts_err = in_batches(keys, function(batch: { any }): error?
        local params, matches = { component_id, types.STATUS.CURRENT }, {}
        for _, key in ipairs(batch) do
            matches[#matches + 1] = "(scope_key = $" .. (#params + 1) .. " AND key = $" .. (#params + 2) .. ")"
            params[#params + 1] = key.scope_key
            params[#params + 1] = key.key
        end
        local rows, err = tx:query("SELECT scope_key, key, COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1 AND status = $2 AND (" ..
            table.concat(matches, " OR ") .. ") GROUP BY scope_key, key", params)
        if err then return types.failed("memory invariant counts read failed", err) end
        for _, row in ipairs(rows) do counts[types.key_identity(row.scope_key, row.key)] = tonumber(row.n) end
        return nil
    end)
    if counts_err then return nil, counts_err end
    local statuses_err = in_batches(ids, function(batch: { any }): error?
        local params = { component_id }
        for _, id in ipairs(batch) do params[#params + 1] = id end
        local rows, err = tx:query("SELECT id, status FROM kickside_memory_items WHERE component_id = $1 AND id IN (" .. index.placeholders(#params - 1, 2) .. ")", params)
        if err then return types.failed("memory invariant originals read failed", err) end
        for _, row in ipairs(rows) do statuses[row.id] = row.status end
        return nil
    end)
    if statuses_err then return nil, statuses_err end
    return { counts = counts, statuses = statuses }, nil
end

function M.lineage(component_id: string, sources: { any }): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local out = {}
        local batch_err = in_batches(sources, function(batch: { any }): error?
            local params = { component_id }
            for _, source in ipairs(batch) do params[#params + 1] = source.id end
            local rows, err = conn:query([[WITH RECURSIVE lineage(scope_key, key, cardinality, claim_id) AS (
                SELECT scope_key, key, cardinality, CASE WHEN cardinality = 'single' THEN '' ELSE claim_id END
                FROM kickside_memory_items WHERE component_id = $1 AND id IN (]] .. index.placeholders(#params - 1, 2) .. [[)
                UNION SELECT n.scope_key, n.key, n.cardinality, CASE WHEN n.cardinality = 'single' THEN '' ELSE n.claim_id END
                FROM lineage l JOIN kickside_memory_items p ON p.component_id = $1 AND p.claim_id = l.claim_id
                JOIN kickside_memory_items n ON (n.component_id = $1 AND n.superseded_by = p.id)
                    OR (n.component_id = $1 AND n.id = p.superseded_by)
                WHERE l.cardinality = 'multi')
                SELECT i.id, i.]] .. table.concat(COLUMNS, ", i.") .. [[ FROM lineage l JOIN kickside_memory_items i
                ON i.component_id = $1 AND i.claim_id = l.claim_id WHERE l.cardinality = 'multi' AND i.scope_key = l.scope_key
                UNION SELECT i.id, i.]] .. table.concat(COLUMNS, ", i.") .. [[ FROM lineage l JOIN kickside_memory_items i
                ON i.component_id = $1 AND i.scope_key = l.scope_key AND i.key = l.key WHERE l.cardinality = 'single' ORDER BY id]], params)
            if err then return types.failed("memory lineage read failed", err) end
            local decoded, decode_err = decode_all(rows)
            if decode_err then return decode_err end
            for _, row in ipairs(decoded) do out[#out + 1] = row end
            return nil
        end)
        if batch_err then return nil, batch_err end
        return out, nil
    end)
end

-- Every occurrence of the roots' claims and the versions those occurrences replaced.
function M.history(component_id: string, roots: { any }): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local out = {}
        local batch_err = in_batches(roots, function(batch: { any }): error?
            local params = { component_id }
            for _, root in ipairs(batch) do params[#params + 1] = root.claim_id end
            local rows, err = conn:query([[WITH RECURSIVE history(id) AS (
                SELECT id FROM kickside_memory_items WHERE component_id = $1 AND claim_id IN (]] .. index.placeholders(#params - 1, 2) .. [[)
                UNION SELECT p.id FROM history h JOIN kickside_memory_items p ON p.component_id = $1 AND p.superseded_by = h.id)
                SELECT i.id, i.]] .. table.concat(COLUMNS, ", i.") .. [[ FROM history h JOIN kickside_memory_items i
                ON i.component_id = $1 AND i.id = h.id ORDER BY i.id]], params)
            if err then return types.failed("memory history read failed", err) end
            local decoded, decode_err = decode_all(rows)
            if decode_err then return decode_err end
            for _, row in ipairs(decoded) do out[#out + 1] = row end
            return nil
        end)
        if batch_err then return nil, batch_err end
        return out, nil
    end)
end

function M.derived(component_id: string, source_ids: { string }): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local out = {}
        local batch_err = in_batches(source_ids, function(batch: { any }): error?
            local params = { component_id }
            for _, source_id in ipairs(batch) do params[#params + 1] = source_id end
            local rows, err = conn:query(SELECT .. " WHERE component_id = $1 AND id IN (" ..
                "SELECT item_id FROM kickside_memory_provenance WHERE component_id = $1 AND host_kind = 'item' AND host_id IN (" ..
                index.placeholders(#params - 1, 2) .. ")) ORDER BY id", params)
            if err then return types.failed("memory derivation read failed", err) end
            local decoded, decode_err = decode_all(rows)
            if decode_err then return decode_err end
            for _, row in ipairs(decoded) do out[#out + 1] = row end
            return nil
        end)
        if batch_err then return nil, batch_err end
        return out, nil
    end)
end

function M.key_names(component_id: string, scope_key: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query([[SELECT DISTINCT key FROM kickside_memory_items
            WHERE component_id = $1 AND scope_key = $2 AND status IN ($3, $4) ORDER BY key LIMIT $5]],
            { component_id, scope_key, types.STATUS.CURRENT, types.STATUS.CONFLICT, limit })
        if err then return nil, types.failed("memory key names read failed", err) end
        return rows or {}, nil
    end)
end

function M.keys(component_id: string, scope_key: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT DISTINCT kind, key, cardinality, content, value FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND status IN ($3, $4) " ..
            "ORDER BY kind, key LIMIT $5",
            { component_id, scope_key, types.STATUS.CURRENT, types.STATUS.CONFLICT, limit })
        if err then return nil, types.failed("memory key read failed", err) end
        return decode_all(rows)
    end)
end

function M.topics(component_id: string, family: string, kind: string, limit: integer, offset: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local params: { any } = { types.STATUS.CURRENT, component_id }
        local where = "component_id = $2"
        for _, filter in ipairs({ { "scope_family", family }, { "kind", kind } }) do
            if filter[2] ~= "" then
                params[#params + 1] = filter[2]
                where = where .. " AND " .. filter[1] .. " = $" .. #params
            end
        end
        params[#params + 1] = limit
        params[#params + 1] = offset
        local rows, err = conn:query("SELECT key, cardinality, SUM(CASE WHEN status = $1 THEN 1 ELSE 0 END) AS current_count " ..
            "FROM kickside_memory_items WHERE " .. where .. " GROUP BY key, cardinality ORDER BY key, cardinality LIMIT $" .. (#params - 1) .. " OFFSET $" .. #params, params)
        if err then return nil, types.failed("memory topic read failed", err) end
        for _, row in ipairs(rows or {}) do row.current_count = tonumber(row.current_count) or 0 end
        return rows or {}, nil
    end)
end

function M.conflict_groups(component_id: string, offset: integer, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT DISTINCT conflict_group FROM kickside_memory_items WHERE component_id = $1 AND status = $2 AND conflict_group IS NOT NULL " ..
            "ORDER BY conflict_group LIMIT $3 OFFSET $4",
            { component_id, types.STATUS.CONFLICT, limit + 1, offset })
        if err then return nil, types.failed("memory conflict group read failed", err) end
        local groups: { string } = {}
        for i = 1, math.min(limit, #(rows or {})) do groups[i] = tostring(rows[i].conflict_group) end
        return { groups = groups, more = #(rows or {}) > limit }, nil
    end)
end

function M.group_members(component_id: string, groups: { string }, scope_keys: { string }?): (any?, error?)
    if #groups == 0 then return {}, nil end
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local params: { any } = { component_id, types.STATUS.CONFLICT }
        for _, group in ipairs(groups) do params[#params + 1] = group end
        local where = " WHERE component_id = $1 AND status = $2 AND conflict_group IN (" .. index.placeholders(#groups, 3) .. ")"
        if scope_keys and #scope_keys > 0 then
            where = where .. " AND scope_key IN (" .. index.placeholders(#scope_keys, #params + 1) .. ")"
            for _, scope_key in ipairs(scope_keys) do params[#params + 1] = scope_key end
        end
        local rows, err = conn:query(SELECT .. where .. " ORDER BY conflict_group, id", params)
        if err then return nil, types.failed("memory conflict member read failed", err) end
        return decode_all(rows)
    end)
end

local function provenance_rows(conn: any, component_id: string, item_id: string): (any?, error?)
    local rows, err = conn:query(
        "SELECT host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 ORDER BY recorded_at, event_id",
        { component_id, item_id })
    if err then return nil, types.failed("memory provenance read failed", err) end
    return rows or {}, nil
end

function M.provenance(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        return provenance_rows(conn, component_id, item_id)
    end)
end

local SOURCE_LINES = [[SELECT p.event_id, r.input FROM kickside_memory_provenance p
    JOIN kickside_memory_run_sources s ON s.component_id = p.component_id AND s.event_id = p.event_id
    JOIN kickside_memory_runs r ON r.component_id = s.component_id AND r.id = s.run_id
        AND r.host_kind = p.host_kind AND r.host_id = p.host_id
    WHERE p.component_id = $1 AND p.item_id = $2 AND p.host_kind <> 'item']]

local function source_lines(conn: any, component_id: string, item_id: string): ({ [string]: any }?, error?)
    local rows, err = conn:query(SOURCE_LINES, { component_id, item_id })
    if err then return nil, types.failed("memory source line read failed", err) end
    local lines: { [string]: any } = {}
    for _, row in ipairs(rows or {}) do
        local input, input_err = types.decode_object(row.input, "input")
        if input_err then return nil, input_err end
        for _, messages in ipairs({ (input :: any).span or {}, (input :: any).context or {} }) do
            for _, message in ipairs(messages) do
                if tostring(message.id) == row.event_id then
                    lines[row.event_id] = { role = message.role, author = message.author, text = message.text, created_at = message.created_at }
                end
            end
        end
    end
    return lines, nil
end

local function source_memories(conn: any, component_id: string, ids: { string }): ({ [string]: any }?, error?)
    local memories: { [string]: any } = {}
    local err = in_batches(ids, function(batch: { any }): error?
        local params: { any } = { component_id }
        for _, id in ipairs(batch) do params[#params + 1] = id end
        local rows, query_err = conn:query("SELECT id, kind, key, content, status FROM kickside_memory_items WHERE component_id = $1 AND id IN (" ..
            index.placeholders(#batch, 2) .. ")", params)
        if query_err then return types.failed("memory source item read failed", query_err) end
        for _, row in ipairs(rows or {}) do memories[row.id] = row end
        return nil
    end)
    if err then return nil, err end
    return memories, nil
end

-- Sources attach the retained conversation line or source memory that each provenance reference names.
function M.sources(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = provenance_rows(conn, component_id, item_id)
        if err then return nil, err end
        local lines, lines_err = source_lines(conn, component_id, item_id)
        if lines_err then return nil, lines_err end
        local ids: { string } = {}
        for _, row in ipairs(rows :: any) do
            if row.host_kind == "item" then ids[#ids + 1] = row.host_id end
        end
        local memories, memories_err = source_memories(conn, component_id, ids)
        if memories_err then return nil, memories_err end
        for _, row in ipairs(rows :: any) do
            if row.host_kind == "item" then row.memory = (memories :: any)[row.host_id]
            else row.line = (lines :: any)[row.event_id] end
        end
        return rows, nil
    end)
end

function M.has_provenance(component_id: string, item_id: string, ref: any): (boolean?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT 1 AS found FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 AND host_kind = $3 AND host_id = $4 AND event_id = $5",
            { component_id, item_id, ref.host_kind, ref.host_id, ref.event_id })
        if err then return nil, types.failed("memory provenance read failed", err) end
        return rows ~= nil and #rows > 0, nil
    end)
end

function M.counts(component_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT status, COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1 GROUP BY status", { component_id })
        if err then return nil, types.failed("memory counts read failed", err) end
        local counts = { current = 0, superseded = 0, conflict = 0, archived = 0, forgotten = 0, total = 0 }
        for _, row in ipairs(rows or {}) do
            local n = tonumber(row.n) or 0
            counts[tostring(row.status)] = n
            counts.total = counts.total + n
        end
        local groups, group_err = conn:query(
            "SELECT COUNT(DISTINCT conflict_group) AS n FROM kickside_memory_items WHERE component_id = $1 AND status = $2",
            { component_id, types.STATUS.CONFLICT })
        if group_err then return nil, types.failed("memory conflict count failed", group_err) end
        counts.conflict_groups = groups and groups[1] and tonumber(groups[1].n) or 0
        return counts, nil
    end)
end
type SearchFilter = {
    min_similarity: number?,
    group_by: string?,
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    query_text: string?,
    limit: integer?,
}

function M.search(component_id: string, vector: { number }, filter: SearchFilter): (any?, error?)
    local filters: { any } = {}
    if filter.kinds and #filter.kinds > 0 then filters[#filters + 1] = { column = "kind", values = filter.kinds } end
    if filter.statuses and #filter.statuses > 0 then filters[#filters + 1] = { column = "status", values = filter.statuses } end
    if filter.scope_keys and #filter.scope_keys > 0 then filters[#filters + 1] = { column = "scope_key", values = filter.scope_keys } end
    return db.read(function(conn: any, sqlite: boolean): (any, error?)
        local rows, err = index.search(conn, SEARCH_SPEC, vector, {
            partition = component_id, limit = filter.limit or 10, filters = filters, query_text = filter.min_similarity == nil and filter.query_text or nil, group_by = filter.group_by,
        })
        if err then return nil, types.failed("memory search failed", err) end
        if filter.min_similarity ~= nil then
            local qualifying = {}
            for _, row in ipairs(rows) do
                -- Dense search exposes exp(-L2) on SQLite and (1+cosine)/2 on PostgreSQL.
                local cosine = sqlite and (1 - math.log(row.similarity)^2 / 2) or (2 * row.similarity - 1)
                row.similarity = cosine
                if cosine >= filter.min_similarity then qualifying[#qualifying + 1] = row end
            end
            rows = qualifying
        end
        return decode_all(rows)
    end)
end

function M.page_for_embedding(component_id: string, after_id: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT id, content, content_hash FROM kickside_memory_items WHERE component_id = $1 AND id > $2 AND status <> $3 ORDER BY id LIMIT $4",
            { component_id, after_id, types.STATUS.FORGOTTEN, limit })
        if err then return nil, types.failed("memory embedding page read failed", err) end
        return rows or {}, nil
    end)
end

return M
