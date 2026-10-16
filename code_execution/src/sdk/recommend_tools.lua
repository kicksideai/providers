-- Ranked tool discovery within the actor's whitelist. fields selects schemas
-- and descriptions; default recommendations contain ids and labels.

local prompt = require("prompt")
local llm = require("llm")
local surface = require("surface")

local M = {}

type Map = { [string]: any }

local DEFAULT_MODEL = "class:fast"
local MAX_TOOLS = 8

-- Structured-output schema: the model returns the ids of the most relevant candidates,
-- most relevant first. A single required array keeps strict providers happy.
local RECOMMEND_SCHEMA = {
    type = "object",
    additionalProperties = false,
    required = { "tool_ids" },
    properties = {
        tool_ids = {
            type = "array",
            description = "Registry entry ids of the candidate tools most relevant to the need, most relevant first, at most " .. tostring(MAX_TOOLS) .. ". Use ONLY ids from the candidate list; never invent one. Return an empty array if nothing is relevant.",
            items = { type = "string" },
        },
    },
}

local SYSTEM = [[You match a stated NEED to the most relevant tools from a candidate list.
Each candidate has an id, a label, and a description. Return the ids — drawn ONLY from the
candidate list — of the tools most relevant to the need, most relevant first, at most 8.
Prefer precision: include a tool only when it plausibly helps with the need. If nothing is
relevant, return an empty list. Never invent an id.]]

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

-- candidates: resolve the whitelist (empty = all reachable) into (id -> descriptor map,
-- a { id, label, description } list for the model, err?).
local function candidates(tool_ids: any): (any, { any }, string?)
    local map, err = surface.resolve_tools(tool_ids)
    if err then return nil, {}, err :: string end
    local list: { any } = {}
    for id, d in pairs((map or {}) :: Map) do
        local sp = d :: Map
        list[#list + 1] = { id = id, label = sp.label, description = sp.description }
    end
    return map, list, nil
end

local function llm_select(need: string, list: { any }, model: string): (any, any?)
    local lines: { string } = { "NEED:", need, "", "CANDIDATES:" }
    for _, c in ipairs(list) do
        local row = c :: Map
        local line = "- id: " .. tostring(row.id) .. " | " .. tostring(row.label or "")
        if is_str(row.description) then line = line .. " — " .. tostring(row.description) end
        lines[#lines + 1] = line
    end

    local p = (prompt :: any).new()
    p:add_system(SYSTEM)
    p:add_user(table.concat(lines, "\n"))

    local resp, err = (llm :: any).structured_output(RECOMMEND_SCHEMA, p, { model = model, temperature = 0 })
    if err then return nil, err end
    if type(resp) ~= "table" or type((resp :: Map).result) ~= "table" then
        return nil, "recommendation model returned no result"
    end
    local ids = ((resp :: Map).result :: Map).tool_ids
    if type(ids) ~= "table" then return nil, "recommendation model returned no tool_ids array" end
    for key, id in pairs(ids :: Map) do
        if type(key) ~= "number" or key < 1 or key % 1 ~= 0 or key > #ids or not is_str(id) then
            return nil, "recommendation model returned an invalid tool_ids array"
        end
    end
    return ids, nil
end

-- Resolve ranked ids within the candidate map, including requested fields.
local function resolve_selected(map: any, ids: { string }, fields: any): { any }
    local out: { any } = {}
    local seen: { [string]: boolean } = {}
    for _, id in ipairs(ids) do
        local d = (map :: Map)[id]
        if d and not seen[id] then
            seen[id] = true
            local sp = d :: Map
            local row: any = {id = id, label = sp.label}
            for _, field in ipairs({"description", "input_schema", "output_schema"}) do
                for _, requested in ipairs(fields or {}) do
                    if requested == field or requested == "*" then row[field] = sp[field] end
                end
            end
            out[#out + 1] = row
            if #out >= MAX_TOOLS then break end
        end
    end
    return out
end

-- recommend(args) -> ({ tools }, err?). Selects the tools most relevant to args.need over
-- the whitelist and returns compact rows plus requested fields.
function M.recommend(args: any): (any, any?)
    local a = (type(args) == "table" and args or {}) :: Map
    local need = trim(a.need)
    if need == "" then return nil, "need is required" end

    local map, list, cerr = candidates(a.tool_ids)
    if cerr then return nil, cerr end
    if #list == 0 then return { tools = {} }, nil end

    local model = trim(a.model) ~= "" and trim(a.model) or DEFAULT_MODEL
    local ids, err = llm_select(need, list, model)
    if err then return nil, err end
    return { tools = resolve_selected(map, ids, a.fields) }, nil
end

return M
