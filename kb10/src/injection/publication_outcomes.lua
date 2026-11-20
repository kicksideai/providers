-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Read-only Activity projection for Automation. The publication receipt is an
-- immutable Knowledge event ID; the source document row is the KB-owned
-- materialization read model for that event.
local component = require("component")
local store = require("store")
local uuid = require("uuid")

local M = {}
local MAX_REFS = 100

local function valid(ref: any): boolean
    return type(ref) == "table" and type(ref.kb_id) == "string" and uuid.validate(ref.kb_id)
        and type(ref.external_id) == "string" and ref.external_id ~= ""
        and type(ref.publication_id) == "string" and uuid.validate(ref.publication_id)
end

local function outcome(rows: any, publication_id: string): any
    for _,node in ipairs(type(rows) == "table" and rows or {}) do
        local meta = type(node.metadata) == "table" and node.metadata or {}
        local published = meta.upload_publication_id
        if node.parent_id == nil and node.node_type == "document" and type(published) == "string" then
            if published == publication_id then
                if meta.status == "failed" then
                    return {status="failed",reason=type(meta.error) == "string" and meta.error or "Indexing failed"}
                end
                if meta.status == "completed" then return {status="indexed"} end
                return {status="pending"}
            end
        end
    end
    -- A source row for another publication does not establish an ordering:
    -- delivery and materialization can run on different hosts. Until an
    -- authoritative source publication record says otherwise, an unmatched
    -- accepted receipt is still pending rather than falsely superseded.
    return {status="pending"}
end

function M.lookup(refs: any): ({any}?,error?)
    if type(refs) ~= "table" or #refs > MAX_REFS then
        return nil,errors.new({kind=errors.INVALID,message="at most 100 publication references are required"})
    end
    local results: {any}={}
    for index,ref in ipairs(refs) do
        if not valid(ref) then return nil,errors.new({kind=errors.INVALID,message="invalid Knowledge publication reference"}) end
        local _,access_err=component.validate_access(ref.kb_id,component.ACCESS.READ)
        if access_err then
            -- Do not disclose either a KB relationship or its failure reason.
            results[index]={}
        else
            local kb,store_err=store.get_store(ref.kb_id)
            if store_err then return nil,store_err end
            local rows,read_err=store.find_by_external_id(kb.id,"knowledge.kb",ref.external_id)
            if read_err then return nil,read_err end
            results[index]=outcome(rows,ref.publication_id)
        end
    end
    return results,nil
end

return M
