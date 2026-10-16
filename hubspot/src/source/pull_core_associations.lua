-- Per-item association hydration for HubSpot engagements.
--
-- An engagement's CRM placement is decided by what it is associated with, not by
-- what its own properties say: a note carries no addresses at all, and a call
-- carries them only when the portal recorded them. So every pulled engagement
-- travels with the raw HubSpot ids of the contacts and deals it is associated
-- with, and the consumer resolves those ids through its own external alias
-- index.
--
-- The reads are the batch association reads the association source already runs,
-- with the same paging discipline (association_batch.lua): capped at 100 objects
-- per request and drained through per-input continuations, so a high-fanout
-- engagement arrives complete. A failed read fails the page rather than handing
-- the consumer an association set it cannot tell from an empty one.
local batch = require("association_batch")
local types = require("types")

local M = {}

type ErrorResult = {
    success: boolean,
    error: string?,
    status_code: integer?,
    retry_after_ms: number?,
}
type Row = { id: unknown }
type Associations = { contacts: { string }, deals: { string } }
type Transport = {
    batch_read_associations: fun(
        conn: types.Conn,
        from_type: string,
        to_type: string,
        inputs: { types.AssociationInput }
    ): (types.AssociationBatchResult?, unknown?),
}

-- The object types whose placement is association-decided. Tasks are excluded:
-- they are the writable activity type, not an engagement a timeline is built
-- from.
local ENGAGEMENT_TYPES: { [string]: boolean } = {
    calls = true, meetings = true, notes = true, emails = true,
}
M.ENGAGEMENT_TYPES = ENGAGEMENT_TYPES

-- The associated object types every engagement carries: the contacts that name
-- its participants, and the deals that name the record it belongs on.
local TO_TYPES: { string } = { "contacts", "deals" }

local function trim(value: unknown): string
    if type(value) ~= "string" and type(value) ~= "number" then return "" end
    return (tostring(value):gsub("^%s+", ""):gsub("%s+$", ""))
end

function M.is_engagement(object_type: unknown): boolean
    return type(object_type) == "string" and ENGAGEMENT_TYPES[object_type] == true
end

-- hydrate(tp, conn, object_type, rows) -> ({ [object_id]: Associations }, err).
-- Nil with no error for an object type that carries no engagement associations,
-- so the caller leaves the payload field off entirely rather than writing an
-- empty set onto a contact.
--
-- The transport and the connection arrive unknown and are narrowed here: this
-- module states the ONE operation it needs of them, rather than the pull's own
-- full transport surface travelling into a reader that uses one method of it.
function M.hydrate(
    tp: unknown,
    conn: unknown,
    object_type: string,
    rows: { Row }
): ({ [string]: Associations }?, unknown?)
    if not M.is_engagement(object_type) then return nil, nil end
    if type(tp) ~= "table" or type(conn) ~= "table" then
        return nil, {
            success = false,
            error = "HubSpot association hydration requires a connected transport",
            status_code = 0,
        }
    end
    local reader = tp :: Transport
    local connection = conn :: types.Conn

    local ids: { string } = {}
    local seen: { [string]: boolean } = {}
    for _, row in ipairs(rows) do
        local id = trim(row.id)
        if id ~= "" and not seen[id] then
            seen[id] = true
            ids[#ids + 1] = id
        end
    end

    local out: { [string]: Associations } = {}
    for _, id in ipairs(ids) do out[id] = { contacts = {}, deals = {} } end
    if #ids == 0 then return out, nil end

    for _, to_type in ipairs(TO_TYPES) do
        local by_id, err = batch.read_ids(reader, connection, object_type, to_type, ids)
        if err or not by_id then return nil, err end
        for id, to_ids in pairs(by_id :: { [string]: { string } }) do
            local target = out[id]
            if target ~= nil then
                if to_type == "contacts" then target.contacts = to_ids else target.deals = to_ids end
            end
        end
    end
    return out, nil
end

return M
