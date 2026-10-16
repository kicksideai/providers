local component = require("component")

-- Sets or clears the enrichment attention flags on a KB's public component meta,
-- so graph-enrichment failures are visible on the KB surface instead of log-only.
-- Dispatched under the KB owner identity (via execution_identity.run_as) since the
-- enrichment process actor has no write grant on the KB.
--
-- Clearing writes empty values through the plain fields upsert rather than
-- deleting the keys: readers (the kb10 graph API) normalize empty to absent, and
-- the fields-only set_meta path is the one every meta writer exercises.
--
-- args:
--   component_id          required
--   error                 sets enrichment_error (the failure reason of the last pass)
--   enrichment_agent_id   sets enrichment_agent_missing + enrichment_agent_error
--                         (a configured enrichment agent no longer resolves)
--   clear                 "error" resets enrichment_error only (agent flags persist
--                         while the dangling agent reference remains configured);
--                         "all" or true resets every attention flag
local ERROR_KEY = "enrichment_error"

local function current_meta(component_id: string): (any, any?)
    local service, service_err = component.get_service()
    if service_err then return nil, service_err end
    local comp, read_err = (service :: any):get({ component_id = component_id })
    if read_err then return nil, read_err end
    return comp.meta or {}, nil
end

local function flag_set(value: any): boolean
    if value == nil or value == false or value == "" then return false end
    return true
end

local function run(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local component_id = args.component_id
    if type(component_id) ~= "string" or component_id == "" then
        return nil, "component_id is required"
    end

    if args.clear ~= nil and args.clear ~= false then
        local clear_all = args.clear == "all" or args.clear == true
        local meta, read_err = current_meta(component_id :: string)
        if read_err then return nil, read_err end
        local fields: { [string]: any } = {}
        local dirty = false
        if flag_set(meta[ERROR_KEY]) then
            fields[ERROR_KEY] = ""
            dirty = true
        end
        if clear_all and (flag_set(meta.enrichment_agent_missing) or flag_set(meta.enrichment_agent_error)) then
            fields.enrichment_agent_missing = false
            fields.enrichment_agent_error = ""
            dirty = true
        end
        -- Skip the write (and its meta-changed broadcast) when nothing is set.
        if not dirty then
            return { ok = true, skipped = true }, nil
        end
        local ok, err = component.set_meta(component_id :: string, fields)
        if not ok then
            return nil, err
        end
        return { ok = true }, nil
    end

    local fields: { [string]: any } = {}
    local has_fields = false
    if type(args.enrichment_agent_id) == "string" and args.enrichment_agent_id ~= "" then
        fields.enrichment_agent_missing = true
        fields.enrichment_agent_error = "configured enrichment agent is unavailable: " .. tostring(args.enrichment_agent_id)
        has_fields = true
    end
    if type(args.error) == "string" and args.error ~= "" then
        fields[ERROR_KEY] = args.error
        has_fields = true
    end
    if not has_fields then
        return nil, "nothing to update: pass error, enrichment_agent_id, or clear"
    end

    local ok, err = component.set_meta(component_id :: string, fields)
    if not ok then
        return nil, err
    end
    return { ok = true }, nil
end

return { run = run }
