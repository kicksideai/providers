local json = require("json")

local M = {}

local MAX_ALIAS = 64

local function sanitize(value: any): string
    local out = tostring(value or ""):gsub("[^%w_]", "_"):gsub("_+", "_")
    out = out:gsub("^_+", ""):gsub("_+$", "")
    if out == "" then out = "mcp_tool" end
    if out:match("^%d") then out = "mcp_" .. out end
    if #out > MAX_ALIAS then out = out:sub(1, MAX_ALIAS) end
    return out
end
M.sanitize = sanitize

local function selected_set(selected: any): any
    if type(selected) ~= "table" then return nil end
    local out: any = {}
    for _, name in ipairs(selected :: { any }) do
        if type(name) == "string" and name ~= "" then out[name] = true end
    end
    return out
end

function M.build(component_id: string, tools: any, options: any): (any?, string?)
    if component_id == "" then return nil, "connection_id is required" end
    if type(tools) ~= "table" then return nil, "MCP tools must be an array" end
    options = type(options) == "table" and options or {}
    local allow = selected_set((options :: any).selected_tools)
    local prefix = sanitize((options :: any).tool_prefix or "mcp")
    local used: any = {}
    local out: { any } = {}

    for _, raw in ipairs(tools :: { any }) do
        if type(raw) == "table" then
            local name = (raw :: any).name
            if type(name) == "string" and name ~= "" and (allow == nil or allow[name]) then
                local base = sanitize(prefix .. "_" .. name)
                local alias = base
                local n = 2
                while used[alias] do
                    local suffix = "_" .. tostring(n)
                    alias = base:sub(1, MAX_ALIAS - #suffix) .. suffix
                    n = n + 1
                end
                used[alias] = true
                local schema = (raw :: any).inputSchema
                if type(schema) ~= "table" then schema = { type = "object", additionalProperties = true } end
                -- Encoding here proves the schema can survive agent compilation.
                local _, schema_err = json.encode(schema)
                if schema_err then return nil, "tool " .. name .. " has an unserializable inputSchema" end
                out[#out + 1] = {
                    id = "kickside.mcp_client:invoke_tool",
                    alias = alias,
                    description = tostring((raw :: any).description or ("Remote MCP tool " .. name)),
                    schema = schema,
                    context = {
                        connection_id = component_id,
                        remote_tool_name = name,
                    },
                }
            end
        end
    end
    return out, nil
end

return M
