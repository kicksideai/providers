-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component = require("component")
local security = require("security")
local store = require("store")
local uuid = require("uuid")

local M = {}

function M.current(node: any, actor_id: string): any?
    local metadata = node and node.metadata
    if type(metadata) ~= "table" or node.parent_id ~= nil or node.node_type ~= "document"
        or metadata.status ~= "failed" or metadata.actor_id ~= actor_id
        or metadata.external_source ~= "knowledge.kb"
        or type(metadata.external_id) ~= "string" or metadata.external_id == ""
        or type(metadata.external_version) ~= "string" or metadata.external_version:sub(1, 9) ~= "delivery:"
        or type(metadata.upload_publication_id) ~= "string" or not uuid.validate(metadata.upload_publication_id)
        or type(metadata.thread_event_id) ~= "string" or not uuid.validate(metadata.thread_event_id) then
        return nil
    end
    return {external_id = metadata.external_id, external_version = metadata.external_version,
        publication_id = metadata.upload_publication_id, failed_event_id = metadata.thread_event_id}
end

function M.read(input: any): (any?, error?)
    if type(input) ~= "table" or type(input.kb_id) ~= "string" or not uuid.validate(input.kb_id)
        or type(input.node_id) ~= "string" or not uuid.validate(input.node_id) then
        return nil, errors.new({kind = errors.INVALID, message = "Knowledge base and document IDs are required"})
    end
    local actor = security.actor()
    if not actor then return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "An uploader is required"}) end
    local _, access_err = component.validate_access(input.kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local kb, kb_err = store.get_store(input.kb_id)
    if kb_err then return nil, kb_err end
    local node, node_err = store.get_node(kb.id, input.node_id)
    if node_err then return nil, node_err end
    local proof = M.current(node, actor:id())
    if not proof or proof.failed_event_id ~= input.failed_event_id then
        return nil, errors.new({kind = errors.CONFLICT, message = "The failed document is no longer available to retry"})
    end
    return proof, nil
end

return M
