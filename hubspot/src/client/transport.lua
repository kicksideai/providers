local component = require("component")
local ctx = require("ctx")
local api = require("api")
local config = require("config")
local types = require("types")

local M = {}

type Context = {
    api_key: unknown?,
    component_id: unknown?,
}

-- Resolve the connection's stored context: an explicit component_id, else the
-- single HubSpot connection in scope (trusted read of its private context).
local function context(component_id: string?): (Context?, error?)
    if component_id and component_id ~= "" then
        local stored, err = component.get_context(component_id, component.ACCESS.READ)
        if err then return nil, err end
        if type(stored) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "HubSpot connection context is invalid" }) end
        return stored :: Context, nil
    end
    local stored, err = component.get_context_by_meta({
        class = types.CONNECTION_CLASS,
        provider = types.PROVIDER,
    }, component.ACCESS.READ)
    if err then
        return nil, errors.new({ kind = errors.INVALID, message = "no HubSpot connection selected; configure the trait connection when there is no single default" })
    end
    if type(stored) ~= "table" then return nil, errors.new({ kind = errors.INVALID, message = "HubSpot connection context is invalid" }) end
    return stored :: Context, nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    local context_value, err = context(component_id)
    if err or not context_value then return nil, err end
    local api_key = context_value.api_key
    if type(api_key) ~= "string" or api_key == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "HubSpot connection is missing api_key" })
    end
    local cid = type(context_value.component_id) == "string" and (context_value.component_id :: string) or nil
    -- A sync round opens the source with its work deadline; every request and
    -- rate-limit backoff this connection makes ends inside it.
    local deadline = ctx.get("deadline")
    return ({ component_id = cid, api_key = api_key,
        deadline = type(deadline) == "string" and deadline ~= "" and deadline or nil } :: types.Conn), nil
end

-- Config owns the only object-type lists. All listed types are readable; the
-- smaller write list is the side-effect boundary.
M.OBJECT_TYPES = config.OBJECT_TYPES
M.WRITE_OBJECT_TYPES = config.WRITE_OBJECT_TYPES

-- Whether object_type is one of the supported CRM objects.
function M.is_object_type(object_type: unknown): boolean
    return config.is_object_type(object_type)
end

-- Whether object_type accepts writes.
function M.is_writable_object_type(object_type: unknown): boolean
    return config.is_writable_object_type(object_type)
end

M.account_info = api.account_info
M.test_connection = api.test_connection
M.list_objects = api.list_objects
M.get_object = api.get_object
M.batch_read_objects = api.batch_read_objects
M.batch_read_associations = api.batch_read_associations
M.search_objects = api.search_objects
M.search_incremental = api.search_incremental
M.watermark_value = api.watermark_value
M.list_owners = api.list_owners
M.list_pipelines = api.list_pipelines
M.list_properties = api.list_properties
M.get_property = api.get_property
M.get_pipeline = api.get_pipeline
M.get_owner = api.get_owner
M.create_object = api.create_object
M.update_object = api.update_object
M.archive_object = api.archive_object
M.create_association = api.create_association

return M
