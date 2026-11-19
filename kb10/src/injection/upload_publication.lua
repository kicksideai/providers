-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component = require("component")
local ops = require("ops")
local store = require("store")
local uuid = require("uuid")

local function matches(input: any): (any?, error?)
    local req = type(input) == "table" and input or {}
    if type(req.kb_id) ~= "string" or not uuid.validate(req.kb_id)
        or type(req.external_id) ~= "string" or req.external_id == ""
        or type(req.publication_id) ~= "string" or not uuid.validate(req.publication_id) then
        return nil, errors.new({kind = errors.INVALID, message = "invalid Knowledge upload publication"})
    end
    local _, access_err = component.validate_access(req.kb_id, component.ACCESS.WRITE)
    if access_err then return nil, access_err end
    local row, store_err = store.get_store(req.kb_id)
    if store_err then return nil, store_err end
    local binding = ops.source_binding(row.id, "knowledge.kb", req.external_id, req.kb_id)
    if not binding then return nil, errors.new({kind = errors.INVALID, message = "invalid source identity"}) end
    local db, db_err = ops.get_db()
    if db_err then return nil, db_err end
    local dialect, dialect_err = ops.get_db_type(db)
    if dialect_err then db:release(); return nil, dialect_err end
    local id, read_err = ops.find_source_root_tx(db, dialect, row.id, binding, req.publication_id)
    local _, release_err = db:release()
    if read_err or release_err then return nil, read_err or release_err end
    return {current = id ~= nil}, nil
end

return {matches = matches}
