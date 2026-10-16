local registry = require("registry")

local M = {}

type JsonValue = nil | boolean | number | string | { JsonValue } | { [string]: JsonValue }
type JsonObject = { [string]: JsonValue }
type UnknownMap = { [string]: unknown }
type ConfigError = string | error
type PropertySelection = { values: { string }, explicit: boolean }
type ObjectConfig = {
    direction: unknown?,
    enabled: unknown?,
    sync: unknown?,
    watermark_property: unknown?,
    field_map: unknown?,
    properties: unknown?,
    all_properties: unknown?,
    resolve_labels: unknown?,
}
type Config = {
    default_field_mapping_ref: unknown?,
    objects: unknown?,
    direction: unknown?,
    field_map: unknown?,
    property_selection: unknown?,
    properties: unknown?,
    all_properties: unknown?,
    resolve_labels: unknown?,
}
type RegistryEntry = { meta: unknown? }

local function is_json(value: unknown, depth: number): boolean
    if value == nil or type(value) == "boolean" or type(value) == "number" or type(value) == "string" then return true end
    if type(value) ~= "table" or depth >= 64 then return false end
    for key, child in pairs(value) do
        if type(key) ~= "string" and type(key) ~= "number" then return false end
        if not is_json(child, depth + 1) then return false end
    end
    return true
end

M.DEFAULTS_CONFIG = "kickside.hubspot.client:config_defaults"
M.DEFAULT_FIELD_MAPPING_REF = "kickside.hubspot.client:default_field_mapping.standard"
M._registry = registry

-- Config owns the provider's single readable-object vocabulary. The added
-- meetings, notes, emails, and calls are deliberately absent from the write
-- list below; tasks remain writable.
M.OBJECT_TYPES = { "contacts", "companies", "deals", "tasks", "meetings", "notes", "emails", "calls" }

M.OBJECT_SET = {}
for _, object_type in ipairs(M.OBJECT_TYPES) do
    M.OBJECT_SET[object_type] = true
end

M.WRITE_OBJECT_TYPES = { "contacts", "companies", "deals", "tasks" }
M.WRITE_OBJECT_SET = {}
for _, object_type in ipairs(M.WRITE_OBJECT_TYPES) do
    M.WRITE_OBJECT_SET[object_type] = true
end

-- HubSpot does not provide a pageable deleted-object collection for meetings.
-- Every other readable object exposed here supports the archived collection
-- used to materialize delete envelopes.
local ARCHIVED_ENUMERATION = {
    contacts = true,
    companies = true,
    deals = true,
    tasks = true,
    notes = true,
    emails = true,
    calls = true,
}

M.VERSION_PROPERTY = "hs_lastmodifieddate"
M.DEFAULT_WATERMARK_PROPERTY = {
    contacts = "lastmodifieddate",
    companies = "hs_lastmodifieddate",
    deals = "hs_lastmodifieddate",
    tasks = "hs_lastmodifieddate",
    meetings = "hs_lastmodifieddate",
    notes = "hs_lastmodifieddate",
    emails = "hs_lastmodifieddate",
    calls = "hs_lastmodifieddate",
}

local SYSTEM_PROPERTIES = {
    "hs_object_id",
    "createdate",
    "hs_createdate",
    "lastmodifieddate",
    "hs_lastmodifieddate",
}

local function copy_array(values: unknown): { string }
    local out: { string } = {}
    if type(values) ~= "table" then return out end
    for _, value in ipairs(values) do
        if type(value) == "string" and value ~= "" then out[#out + 1] = value end
    end
    return out
end

local function copy_map(values: unknown): { [string]: string }
    local out: { [string]: string } = {}
    if type(values) ~= "table" then return out end
    for k, v in pairs(values) do
        if type(k) == "string" and type(v) == "string" and v ~= "" then out[k] = v end
    end
    return out
end

local function non_empty_string(value: unknown): string?
    if type(value) ~= "string" then return nil end
    local s: string = value:gsub("^%s+", ""):gsub("%s+$", "")
    if s == "" then return nil end
    return s
end

local function registry_meta(id: string): (UnknownMap?, ConfigError?)
    if id == "" then return {} end
    local reg = M._registry or registry
    local entry, err = reg.get(id)
    if err then return nil, err end
    if not entry then return nil, "registry entry not found: " .. id end
    if type(entry) ~= "table" then return {} end
    local typed = entry :: RegistryEntry
    return type(typed.meta) == "table" and (typed.meta :: UnknownMap) or {}
end

local function default_field_mapping_ref(config: unknown): (string?, ConfigError?)
    if type(config) == "table" then
        local configured = non_empty_string((config :: Config).default_field_mapping_ref)
        if configured then return configured end
    end
    local meta, err = registry_meta(M.DEFAULTS_CONFIG)
    if err then return nil, err end
    return non_empty_string(meta.default_field_mapping_ref) or M.DEFAULT_FIELD_MAPPING_REF
end

local function default_field_mapping(config: unknown): (UnknownMap?, ConfigError?)
    local ref, err = default_field_mapping_ref(config)
    if err then return nil, err end
    return registry_meta(ref :: string)
end

local function merge_map(base: { [string]: string }, overrides: unknown)
    if type(overrides) ~= "table" then return end
    for k, v in pairs(overrides) do
        if type(k) == "string" then
            if v == false or v == "" then
                base[k] = nil
            elseif type(v) == "string" then
                base[k] = v
            end
        end
    end
end

local function object_config(config: unknown, object_type: string): ObjectConfig
    if type(config) ~= "table" then return {} end
    local objects = (config :: Config).objects
    if type(objects) ~= "table" then return {} end
    local obj = (objects :: UnknownMap)[object_type]
    if type(obj) ~= "table" then return {} end
    return obj :: ObjectConfig
end
M.object_config = object_config

function M.is_object_type(object_type: unknown): boolean
    return type(object_type) == "string" and M.OBJECT_SET[object_type] == true
end

function M.is_writable_object_type(object_type: unknown): boolean
    return type(object_type) == "string" and M.WRITE_OBJECT_SET[object_type] == true
end

function M.can_enumerate_archived(object_type: unknown): boolean
    return type(object_type) == "string" and ARCHIVED_ENUMERATION[object_type] == true
end

function M.direction_for(config: unknown, object_type: string): string
    local obj = object_config(config, object_type)
    local direction = type(obj.direction) == "string" and obj.direction or nil
    if direction == nil and type(config) == "table" then
        local configured = (config :: Config).direction
        if type(configured) == "string" then direction = configured end
    end
    if direction == "source" or direction == "sink" or direction == "bidirectional" or direction == "disabled" then
        return direction
    end
    return "bidirectional"
end

function M.enabled_for(config: unknown, object_type: string, direction: string): boolean
    local obj = object_config(config, object_type)
    if obj.enabled == false or obj.sync == false then return false end
    local d = M.direction_for(config, object_type)
    if d == "disabled" then return false end
    if direction == "source" then return d == "source" or d == "bidirectional" end
    if direction == "sink" then return d == "sink" or d == "bidirectional" end
    return true
end

function M.watermark_property_for(config: unknown, object_type: string): string
    local obj = object_config(config, object_type)
    local configured = non_empty_string(obj.watermark_property)
    if configured then return configured end
    return M.DEFAULT_WATERMARK_PROPERTY[object_type] or M.VERSION_PROPERTY
end

function M.field_map_for(config: unknown, object_type: string): ({ [string]: string }?, ConfigError?)
    local explicit_map: unknown = nil
    if type(config) == "table" and type((config :: Config).field_map) == "table" then
        explicit_map = ((config :: Config).field_map :: UnknownMap)[object_type]
    end
    local obj = object_config(config, object_type)
    if type(obj.field_map) == "table" then return copy_map(obj.field_map) end
    if type(explicit_map) == "table" then return copy_map(explicit_map) end

    local defaults, err = default_field_mapping(config)
    if err then return nil, err end
    local maps = defaults.field_map
    if type(maps) ~= "table" then return {} end
    return copy_map((maps :: UnknownMap)[object_type])
end

local function property_selection(config: unknown, object_type: string): (PropertySelection?, ConfigError?)
    if type(config) == "table" then
        local typed = config :: Config
        local selections = typed.property_selection
        if type(selections) == "table" and type((selections :: UnknownMap)[object_type]) == "table" then
            return { values = copy_array((selections :: UnknownMap)[object_type]), explicit = true }, nil
        end
        local obj = object_config(config, object_type)
        if type(obj.properties) == "table" then return { values = copy_array(obj.properties), explicit = true }, nil end
        if type(typed.properties) == "table" then return { values = copy_array(typed.properties), explicit = true }, nil end
    end
    local defaults, err = default_field_mapping(config)
    if err then return nil, err end
    local selections = defaults.property_selection
    if type(selections) ~= "table" then return { values = {}, explicit = false }, nil end
    return { values = copy_array((selections :: UnknownMap)[object_type]), explicit = false }, nil
end

function M.mirrors_all_properties(config: unknown, object_type: string): (boolean?, ConfigError?)
    local obj = object_config(config, object_type)
    if obj.all_properties == true then return true end
    if type(config) == "table" and (config :: Config).all_properties == true then return true end
    local selected, err = property_selection(config, object_type)
    if err then return nil, err end
    for _, key in ipairs(selected.values) do
        if key == "*" then return true end
    end
    return false
end

function M.resolves_labels(config: unknown, object_type: string): boolean
    local obj = object_config(config, object_type)
    if obj.resolve_labels ~= nil then return obj.resolve_labels == true end
    return type(config) == "table" and (config :: Config).resolve_labels == true
end

local function append_unique(out: { string }, seen: { [string]: boolean }, key: unknown)
    if type(key) ~= "string" or key == "" or seen[key] then return end
    seen[key] = true
    out[#out + 1] = key
end

function M.properties_for(config: unknown, object_type: string): ({ string }?, ConfigError?)
    local selected, err = property_selection(config, object_type)
    if err then return nil, err end
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, key in ipairs(selected.values) do
        if key ~= "*" then append_unique(out, seen, key) end
    end
    if not selected.explicit then
        local field_map, map_err = M.field_map_for(config, object_type)
        if map_err then return nil, map_err end
        for key, _ in pairs(field_map) do append_unique(out, seen, key) end
    end
    for _, key in ipairs(SYSTEM_PROPERTIES) do append_unique(out, seen, key) end
    append_unique(out, seen, M.watermark_property_for(config, object_type))
    return out
end

function M.apply_field_map(config: unknown, object_type: string, properties: unknown): (JsonObject?, ConfigError?)
    local out: JsonObject = {}
    local field_map, err = M.field_map_for(config, object_type)
    if err then return nil, err end
    if type(properties) ~= "table" then return out end
    local source = properties :: UnknownMap
    for hubspot_property, canonical_field in pairs(field_map) do
        local value = source[hubspot_property]
        if value ~= nil and value ~= "" and is_json(value, 0) then
            out[canonical_field] = value :: JsonValue
        end
    end
    return out
end

M.ConfigError = ConfigError
M.JsonObject = JsonObject

return M
