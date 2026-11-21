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

local function outcome(row: any): any
    if type(row) ~= "table" then return {} end
    if row.status == "failed" then return {status="failed",reason=type(row.error) == "string" and row.error or "Indexing failed"} end
    if row.status == "completed" then return {status="indexed"} end
    if row.status == "pending" then return {status="pending"} end
    return {}
end

local function lookup(component_service: any, store_service: any, refs: any): ({any}?,error?)
    if type(refs) ~= "table" or #refs > MAX_REFS then
        return nil,errors.new({kind=errors.INVALID,message="at most 100 publication references are required"})
    end
    local results: {any}={}
    local groups: { [string]: any }={}
    for index,ref in ipairs(refs) do
        if not valid(ref) then return nil,errors.new({kind=errors.INVALID,message="invalid Knowledge publication reference"}) end
        results[index]={}
        local group=groups[ref.kb_id] or {refs={},indexes={}}
        groups[ref.kb_id]=group;group.refs[#group.refs+1]=ref;group.indexes[#group.indexes+1]=index
    end
    for kb_id,group in pairs(groups) do
        local _,access_err=component_service.validate_access(kb_id,component_service.ACCESS.READ)
        if access_err then
            -- Do not disclose either a KB relationship or its failure reason.
        else
            local kb,store_err=store_service.get_store(kb_id)
            if store_err then return nil,store_err end
            local rows,read_err=store_service.publication_outcomes(kb.id,group.refs)
            if read_err then return nil,read_err end
            local by_receipt: {[string]: any}={}
            for _,row in ipairs(rows) do by_receipt[tostring(row.external_id) .. "\n" .. tostring(row.publication_id)]=row end
            for offset,ref in ipairs(group.refs) do
                results[group.indexes[offset]]=outcome(by_receipt[ref.external_id .. "\n" .. ref.publication_id])
            end
        end
    end
    return results,nil
end

function M.lookup(input: any): ({any}?,error?)
    local refs=type(input) == "table" and input.refs or input
    return lookup(component,store,refs)
end

M.classify_for_test=outcome
M.lookup_for_test=lookup

return M
