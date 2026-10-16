-- surface: the single resolver + descriptor builder for the code-execution SDK.
--
-- One place owns the mapping from a whitelist (tool_ids) to the pure-data descriptors the
-- sandbox consumes and the reference shapes the UI + generator read:
--   * resolve_tools turns a whitelist into a key -> descriptor map. A tool's key is ALWAYS
--     its real registry entry id (e.g. "kickside.inbox.traits:inbox_submit_tool"), so the
--     sandbox reaches a tool under the exact id that exists in the registry. An EMPTY (or
--     absent) whitelist means EVERY tool the ambient actor can reach — allow-all is the
--     default. A NON-EMPTY whitelist restricts to that exact subset and rejects any id that
--     is not a tool. Allow-all only widens what the SDK POPULATES; every dispatch still runs
--     under the ambient actor's own gates, so no new authority is granted.
--   * build_reference renders the map into the { tools } surface the sdk-reference endpoint
--     returns and reference_prompt into the markdown the generator folds into its prompt.
--     Each row carries the id-keyed `call` string, a human `label` (the tool's llm_alias /
--     title), and the decoded input/output schemas.
--
-- A descriptor carries decoded input/output schemas so the real sdk validates args, the
-- simulation sdk shapes mock outputs, and the reference documents both — all from one
-- resolve.

local registry = require("registry")
local json = require("json")
local canonical_json = require("canonical_json")

local M = {}

type Map = { [string]: any }

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function local_part(id: string): string
    local colon = id:find(":", 1, true)
    return colon and id:sub(colon + 1) or id
end

-- The registry namespace of an id: the part before the first ':' (e.g. kickside.inbox).
-- An id with no colon has no namespace and yields the empty string.
local function namespace(id: string): string
    local colon = id:find(":", 1, true)
    return colon and id:sub(1, colon - 1) or ""
end

-- The human label a tool advertises to the model: llm_alias, then title, then id local part.
-- This is documentation only — the sandbox key is the real entry id, never this label.
local function tool_label(id: string, meta: Map): string
    if is_str(meta.llm_alias) then return meta.llm_alias :: string end
    if is_str(meta.title) then return meta.title :: string end
    return local_part(id)
end

local function describe(meta: Map): string
    if is_str(meta.llm_description) then return meta.llm_description :: string end
    if is_str(meta.comment) then return meta.comment :: string end
    return ""
end

-- decode_schema normalizes an inline JSON string or a table into a schema table, or nil.
local function decode_schema(schema: any): (any, string?)
    if schema == nil then return nil, nil end
    if type(schema) == "string" then
        local decoded, err = json.decode(schema :: string)
        if err then return nil, tostring(err) end
        schema = decoded
    end
    if type(schema) ~= "table" and type(schema) ~= "boolean" then
        return nil, "schema must be an object or boolean"
    end
    return canonical_json.normalize_schema(schema), nil
end

-- tool_descriptor: a pure-data descriptor for a tool entry. `id` (which is also its
-- sandbox key) is the real registry entry id; `label` is the human alias the reference
-- documents; `namespace` is the id's registry namespace.
local function tool_descriptor(entry: any): (any, string?)
    local meta = ((entry :: any).meta or {}) :: Map
    local id = (entry :: any).id
    local input_schema, input_err = decode_schema(meta.input_schema)
    if input_err then return nil, "invalid input_schema for " .. id .. ": " .. input_err end
    local output_schema, output_err = decode_schema(meta.output_schema)
    if output_err then return nil, "invalid output_schema for " .. id .. ": " .. output_err end
    local input_schema_json
    if input_schema ~= nil then
        local encoded, encode_err = canonical_json.encode(input_schema)
        if encode_err then return nil, "input_schema encode for " .. id .. ": " .. tostring(encode_err) end
        input_schema_json = encoded
    end
    return {
        id = id,
        namespace = namespace(id),
        label = tool_label(id, meta),
        input_schema = input_schema,
        input_schema_json = input_schema_json,
        output_schema = output_schema,
        description = describe(meta),
    }
end

M._tool_descriptor = tool_descriptor

local function is_tool(entry: any): boolean
    local meta = ((entry :: any).meta or {}) :: Map
    return (entry :: any).kind == "function.lua" and meta.type == "tool"
end

-- normalize_ids: a clean, deduped list of string ids (drops blanks/non-strings). Returns
-- an empty list for nil or a non-table, which callers read as allow-all.
local function normalize_ids(value: any): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    if type(value) ~= "table" then return out end
    for _, v in ipairs(value :: { any }) do
        if is_str(v) and not seen[v] then
            seen[v] = true
            out[#out + 1] = v :: string
        end
    end
    return out
end

-- resolve_tools(tool_ids) -> (id -> descriptor, err?), keyed by the real registry entry id
-- so the sandbox reaches each tool under the exact id that exists in the registry.
-- Empty/absent = every registered tool (allow-all). A non-empty list restricts to that
-- subset and errors on any id that is not a meta.type=tool function.lua entry.
function M.resolve_tools(tool_ids: any): (any, string?)
    local ids = normalize_ids(tool_ids)
    local out: Map = {}

    if #ids == 0 then
        local entries, err = registry.find({ [".kind"] = "function.lua" })
        if err then return nil, "tool catalog: " .. tostring(err) end
        for _, entry in ipairs(entries or {}) do
            if is_tool(entry) then
                local d, descriptor_err = tool_descriptor(entry)
                if descriptor_err then return nil, descriptor_err end
                out[d.id] = d
            end
        end
        return out, nil
    end

    for _, id in ipairs(ids) do
        local entry, err = registry.get(id)
        if err or not entry then return nil, "unknown tool: " .. id end
        if not is_tool(entry) then return nil, "not a tool: " .. id end
        local d, descriptor_err = tool_descriptor(entry)
        if descriptor_err then return nil, descriptor_err end
        out[d.id] = d
    end
    return out, nil
end

-- Catalog rows identify callable tools; fields selects descriptor details.
-- Each row's call uses the real entry id.
function M.build_reference(tools: any, options: any): any
    local opts = (type(options) == "table" and options or {}) :: Map
    local q = is_str(opts.q) and string.lower(opts.q :: string) or ""
    local limit = tonumber(opts.limit) or 25
    local offset = tonumber(opts.cursor) or 0
    local tool_rows: { any } = {}
    for id, spec in pairs((tools or {}) :: Map) do
        local sp = spec :: Map
        local row: Map = {
            id = id,
            label = sp.label,
            namespace = sp.namespace,
            call = "sdk.tools[\"" .. tostring(id) .. "\"](args)",
        }
        for _, field in ipairs({"description", "input_schema", "output_schema"}) do
            for _, requested in ipairs(opts.fields or {}) do
                if requested == field or requested == "*" then row[field] = sp[field] end
            end
        end
        local haystack = string.lower(table.concat({
            tostring(row.id or ""), tostring(row.label or ""),
            tostring(row.namespace or ""), tostring(sp.description or ""),
        }, " "))
        if q == "" or string.find(haystack, q, 1, true) ~= nil then
            tool_rows[#tool_rows + 1] = row
        end
    end

    table.sort(tool_rows, function(a: any, b: any): boolean
        local al = string.lower(tostring((a :: Map).label or (a :: Map).id or ""))
        local bl = string.lower(tostring((b :: Map).label or (b :: Map).id or ""))
        if al == bl then return tostring((a :: Map).id or "") < tostring((b :: Map).id or "") end
        return al < bl
    end)
    local page = {}
    for index = offset + 1, math.min(#tool_rows, offset + limit) do page[#page + 1] = tool_rows[index] end
    return {tools = page, next_cursor = offset + #page < #tool_rows and tostring(offset + #page) or nil}
end

-- reference_prompt(reference) -> compact markdown documenting the callable surface, folded
-- into the code generator's prompt so it drafts against real ids and schemas.
function M.reference_prompt(reference: any): string
    local ref = (type(reference) == "table" and reference or {}) :: Map
    local lines: { string } = {}

    local tools = (ref.tools or {}) :: { any }
    if #tools > 0 then
        lines[#lines + 1] = "Tools — call EXACTLY as written below (the bracketed id key is required), returning `result, err`:"
        for _, t in ipairs(tools) do
            local row = t :: Map
            local line = "- `" .. tostring(row.call) .. "`"
            if is_str(row.label) then line = line .. " (" .. tostring(row.label) .. ")" end
            if is_str(row.description) then line = line .. " — " .. row.description end
            lines[#lines + 1] = line
            if type(row.input_schema) == "table" and next(row.input_schema :: Map) ~= nil then
                lines[#lines + 1] = "  args schema: `" .. json.encode(row.input_schema) .. "`"
            end
            if type(row.output_schema) == "table" and next(row.output_schema :: Map) ~= nil then
                lines[#lines + 1] = "  returns schema: `" .. json.encode(row.output_schema) .. "`"
            end
        end
    end

    if #lines == 0 then
        return "No tools are available; use plain Lua only."
    end
    return table.concat(lines, "\n")
end

return M
