-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local apply = require("apply")
local component = require("component")
local component_types = require("component_types")
local contract = require("contract")
local enrollment = require("enrollment")
local ops = require("ops")
local uuid = require("uuid")

local M = {}

local function read_store(component_id: string): (any?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local rows, err = db:query([[SELECT id, source_publication_token, placement_cursor_id,
        EXISTS (SELECT 1 FROM kb10_nodes WHERE store_id = kb10_stores.id AND placement_wake_id IS NOT NULL) AS has_pending
        FROM kb10_stores WHERE component_id = $1 AND kb_type = 'wiki' AND COALESCE(enrichment_agent_id, '') = '']],
        {component_id})
    local _, release_err = db:release()
    if err or release_err then return nil, err or release_err end
    return rows and rows[1], nil
end

local function ensure_thread(component_id: string): error?
    local definition, get_err = contract.get("kickside.core:threads")
    if not definition then return get_err end
    local threads, open_err = definition:open()
    if not threads then return open_err end
    local found, find_err = threads:find({thread_id = component_id})
    if find_err or found then return find_err end
    local _, err = threads:ensure_thread({component_id = component_id, impl_id = "kickside.kb10:engine_wiki"})
    return err
end

local function attach(component_id: string, store: any, cursor_id: string): error?
    local db, open_err = ops.get_db()
    if not db then return open_err end
    local result, update_err = db:execute([[UPDATE kb10_stores SET placement_cursor_id = $1
        WHERE component_id = $2 AND id = $3 AND COALESCE(source_publication_token, '') = $4
        AND kb_type = 'wiki' AND COALESCE(enrichment_agent_id, '') = ''
        AND (placement_cursor_id IS NULL OR placement_cursor_id = $1)]],
        {cursor_id, component_id, store.id, store.source_publication_token or ""})
    local _, release_err = db:release()
    if update_err or release_err then return update_err or release_err end
    if not result or tonumber(result.rows_affected) ~= 1 then
        return errors.new({kind = errors.CONFLICT, retryable = true, message = "Wiki store changed during placement enrollment"})
    end
    return nil
end

-- Call Core from the native producer frame. Store eligibility and the owner
-- incarnation are read here, independently of any lifecycle caller's payload.
function M.enroll(args: any): (any?, error?)
    local id = type(args) == "table" and args.component_id or nil
    if type(id) ~= "string" or not uuid.validate(id) then
        return nil, errors.new({kind = errors.INVALID, message = "Wiki component ID is required"})
    end
    local _, access_err = component.validate_access(id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local store, store_err = read_store(id)
    if store_err then return nil, store_err end
    if not store then return {status = "ineligible"}, nil end
    local db_id = ops.db_id()
    if db_id ~= component_types.db_id() then
        return {status = "unresolved", code = "split_database",
            reason = "Wiki placement enrollment requires a shared Component database"}, nil
    end
    local shared, shared_err = apply.require_shared_database(db_id)
    if not shared then return {status = "unresolved", code = "split_database", reason = tostring(shared_err)}, nil end
    if store.placement_cursor_id == nil and (store.has_pending == true or store.has_pending == 1) then
        return {status = "unresolved", code = "unbound_placement_intent",
            reason = "persisted placement intent has no enrolled cursor"}, nil
    end
    local owner, owner_err = component.get_identity_receipt(id)
    if owner_err then return nil, owner_err end
    if not owner or type(owner.component_incarnation) ~= "string" or not uuid.validate(owner.component_incarnation) then
        return {status = "unresolved", code = "component_incarnation_missing",
            reason = "component has no immutable incarnation"}, nil
    end
    local thread_err = ensure_thread(id)
    if thread_err then return nil, thread_err end
    local admitted, enroll_err = enrollment.enroll({component_id = id, incarnation = owner.component_incarnation, key = "placement"})
    if enroll_err then return nil, enroll_err end
    if not admitted or type(admitted.cursor_id) ~= "string" or not uuid.validate(admitted.cursor_id) then
        return nil, errors.new({kind = errors.INTERNAL, message = "Core returned no placement cursor"})
    end
    local attach_err = attach(id, store, admitted.cursor_id)
    if attach_err then return nil, attach_err end
    return {status = "enrolled", cursor_id = admitted.cursor_id, created = admitted.created}, nil
end

return M
