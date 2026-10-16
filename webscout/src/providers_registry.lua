-- Search provider discovery.
--
-- A search provider is a registry.entry with meta.type = PROVIDER_TYPE that
-- carries the ids of its own search and availability functions. The search tool
-- resolves the selected provider from these entries instead of naming one in
-- code, so a new provider ships as a module and changes nothing here.
--
-- Descriptor shape is checked in this one place, per
-- app:documentation.discovery-addressing-context: a descriptor that cannot be
-- called is a declaration error and is reported with the entry and the missing
-- field, never dropped silently.
--
-- The library lazy-requires `registry` (the importing entry must list it in
-- `modules`); callers may pass their own finder instead.

local PROVIDER_TYPE = "kickside.webscout:search_provider"

type JsonMap = { [string]: unknown }
type Finder = (JsonMap) -> ({any}?, unknown?)

-- Normalized descriptor.
--
--   entry_id        registry id of the declaration, used in diagnostics
--   id              value stored in the search_provider setting
--   label           how the provider is named to an operator
--   search_func     function id called with the tool's search arguments
--   available_func  function id returning { available = bool }
--   settings_ns     namespace holding this provider's own settings
--   max_results     the provider's own per-request ceiling; the search tool
--                   pages the provider in requests of at most this many
type Provider = {
    entry_id: string,
    id: string,
    label: string,
    icon: string?,
    description: string?,
    search_func: string,
    available_func: string,
    settings_ns: string?,
    max_results: number,
    is_default: boolean,
    order: number,
}

-- The fields the search tool cannot work without: id selects the provider,
-- label names it in operator-facing errors, the two func ids are the only way
-- to reach it, and max_results is the ceiling every provider request is held to.
-- Everything else is presentation or declared data.
local REQUIRED = { "id", "label", "search_func", "available_func", "max_results" }

local M = {}

M.PROVIDER_TYPE = PROVIDER_TYPE

local function text(value: unknown): string?
    if type(value) == "string" and value ~= "" then return value :: string end
    return nil
end

-- shape normalizes one descriptor entry, or reports the first field it lacks.
-- Declared fields arrive under `data` whether the entry spells them at its top
-- level or nests them; `entry.id` is the registry id of the declaration itself.
local function shape(entry: any): (Provider?, error?)
    local d: any = entry.data or {}
    local provider: any = {
        entry_id = tostring(entry.id),
        id = text(d.id),
        label = text(d.label),
        icon = text(d.icon),
        description = text(d.description),
        search_func = text(d.search_func),
        available_func = text(d.available_func),
        settings_ns = text(d.settings_ns),
        max_results = tonumber(d.max_results),
        is_default = d.default == true,
        order = tonumber(d.order) or 0,
    }
    for _, field in ipairs(REQUIRED) do
        if provider[field] == nil then
            return nil, errors.new({ kind = errors.INVALID, message = "search provider " .. provider.entry_id .. " declares no " .. field,
                details = { entry_id = provider.entry_id, field = field } })
        end
    end
    return provider :: Provider, nil
end

-- list: every installed provider, ordered by declared order then id. Two
-- descriptors claiming one id is an error rather than a silent first-wins,
-- because the loser would be unreachable without any sign of it.
function M.list(finder: Finder?): ({Provider}?, error?)
    local find = finder or (require("registry") :: any).find
    local entries, err = find({ [".kind"] = "registry.entry", ["meta.type"] = PROVIDER_TYPE })
    if err then return nil, errors.wrap(err, "search provider discovery failed") end
    local out: {Provider} = {}
    local seen: { [string]: string } = {}
    for _, entry in ipairs(entries or {}) do
        local provider, shape_err = shape(entry)
        if not provider then return nil, shape_err end
        local p = provider :: Provider
        if seen[p.id] then
            return nil, errors.new({ kind = errors.INVALID, message = "search provider id '" .. p.id .. "' is declared by both "
                .. seen[p.id] .. " and " .. p.entry_id, details = { id = p.id, entry_ids = { seen[p.id], p.entry_id } } })
        end
        seen[p.id] = p.entry_id
        out[#out + 1] = p
    end
    table.sort(out, function(a: Provider, b: Provider): boolean
        if a.order ~= b.order then return a.order < b.order end
        return a.id < b.id
    end)
    return out, nil
end

-- resolve: the provider with this id, or (nil, err) naming the id that nothing
-- claims.
function M.resolve(id: unknown, finder: Finder?): (Provider?, error?)
    local providers, err = M.list(finder)
    if not providers then return nil, err end
    for _, p in ipairs(providers :: {Provider}) do
        if p.id == id then return p, nil end
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "no search provider installed with id '" .. tostring(id) .. "'" })
end

-- default: the provider marked default, or the only installed one.
function M.default(finder: Finder?): (Provider?, error?)
    local providers, err = M.list(finder)
    if not providers then return nil, err end
    local installed = providers :: {Provider}
    for _, p in ipairs(installed) do
        if p.is_default then return p, nil end
    end
    if #installed == 1 then return installed[1], nil end
    return nil, errors.new({ kind = errors.UNAVAILABLE, message = "no default search provider installed" })
end

-- selected: the provider that will actually answer a search. The setting stores
-- an id and the module answering to it can be removed while the value stays
-- behind, so a stale or unset id falls back to the declared default rather than
-- stopping research silently. One place decides this, so the settings card and
-- the search tool can never disagree about who is in effect.
function M.selected(setting_value: unknown, finder: Finder?): (Provider?, error?)
    if setting_value ~= nil and setting_value ~= "" then
        local provider = M.resolve(setting_value, finder)
        if provider then return provider, nil end
    end
    return M.default(finder)
end

-- describe: an operator-facing "Label (id)" list built from the descriptors, so
-- a message about what is available can never name a provider that is not.
function M.describe(providers: {Provider}): string
    local names: {string} = {}
    for _, p in ipairs(providers) do
        names[#names + 1] = p.label .. " (" .. p.id .. ")"
    end
    return table.concat(names, ", ")
end

-- validate_setting is the search_provider setting's validate_func: an id no
-- installed descriptor claims is refused before it is stored.
function M.validate_setting(args: any, finder: Finder?): JsonMap
    local providers, err = M.list(finder)
    if not providers then return { valid = false, error = tostring(err) } end
    local value = (args or {}).value
    for _, p in ipairs(providers :: {Provider}) do
        if p.id == value then return { valid = true } end
    end
    return { valid = false, error = "unknown search provider '" .. tostring(value)
        .. "'; installed: " .. M.describe(providers :: {Provider}) }
end

return M
