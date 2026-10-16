local config = require("config")

local M = {}

type Properties = { [string]: unknown }
type Row = {
    id: unknown, properties: Properties?, createdAt: unknown, updatedAt: unknown,
    archived: boolean?,
}
type SourceConfig = { connection_id: string? }
-- The CRM objects an engagement is associated with, as raw HubSpot ids. A
-- consumer placing the engagement on a timeline resolves them through its own
-- external alias index, which is why they travel with the item.
type Associations = { contacts: { string }, deals: { string } }
type Provenance = {
    external_source: string, external_id: string, external_version: string,
    object_type: string, object_id: string,
}
type Origin = { mode: string, backfill: boolean }
type Candidate = {
    external_source: string, external_id: string, external_version: string, record_type: string,
}
type RecordSource = { type: string, id: string, version: string? }
type SourceRecord = { id: string, source: RecordSource, fields: config.JsonObject }
type Payload = {
    id: string, object_type: string, entity: string,
    title: string, content: string, content_type: string, source_url: string,
    properties: Properties, raw: Row,
    provenance: Provenance, origin: Origin, candidate: Candidate, record: SourceRecord,
    created_at: string?, updated_at: string, archived: boolean,
    associations: Associations?,
}
type Item = {
    item_key: string, dedup_key: string, op: string,
    source_version: string?, occurred_at: string?,
    payload: Payload, ref: string?,
}

local TITLE_FIELDS: { [string]: { string } } = {
    contacts = { "firstname", "lastname", "email" },
    companies = { "name", "domain" },
    deals = { "dealname" },
    tasks = { "hs_task_subject" },
    meetings = { "hs_meeting_title" },
    notes = {},
    emails = { "hs_email_subject" },
    calls = { "hs_call_title" },
}

local BODY_FIELDS: { [string]: { string } } = {
    contacts = { "email", "company", "phone" },
    companies = { "domain", "website", "phone" },
    deals = { "description", "amount", "dealstage", "pipeline", "closedate" },
    tasks = { "hs_task_body", "hs_task_status", "hs_task_priority", "hs_timestamp" },
    meetings = { "hs_meeting_body", "hs_meeting_outcome", "hs_meeting_start_time", "hs_meeting_end_time" },
    notes = { "hs_note_body", "hs_timestamp" },
    emails = { "hs_email_text", "hs_email_direction", "hs_email_from_email", "hs_email_to_email", "hs_timestamp" },
    calls = {
        "hs_call_body", "hs_call_direction", "hs_call_status", "hs_call_disposition",
        "hs_call_duration", "hs_call_has_voicemail", "hs_timestamp",
    },
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return value:gsub("^%s+", ""):gsub("%s+$", "")
end

local function clean_text(value: unknown): string
    if type(value) ~= "string" then return "" end
    local text = value:gsub("\r\n", "\n")
        :gsub("<[bB][rR]%s*/?>", "\n")
        :gsub("</[pP]>", "\n")
        :gsub("</[dD][iI][vV]>", "\n")
        :gsub("<[^>]+>", "")
        :gsub("&nbsp;", " ")
        :gsub("&amp;", "&")
        :gsub("&lt;", "<")
        :gsub("&gt;", ">")
        :gsub("&quot;", '"')
        :gsub("&#39;", "'")
        :gsub("[ \t]+\n", "\n")
        :gsub("\n[ \t]+", "\n")
        :gsub("\n\n\n+", "\n\n")
    return trim(text)
end

local function version_of(row: Row, watermark_property: string): string
    local props = type(row.properties) == "table" and row.properties or {}
    local value = props[watermark_property]
    if value == nil or value == "" then return "" end
    return tostring(value)
end

local function created_of(row: Row): string?
    local props = type(row.properties) == "table" and row.properties or {}
    local value = row.createdAt or props.createdate or props.hs_createdate
    if type(value) == "string" then return value end
    return nil
end

local function labelize(key: string): string
    local text = key:gsub("^hs_", ""):gsub("_", " ")
    return text == "" and text or text:sub(1, 1):upper() .. text:sub(2)
end

local function title_of(row: Row, object_type: string): string
    local props = type(row.properties) == "table" and row.properties or {}
    local parts: { string } = {}
    for _, field in ipairs(TITLE_FIELDS[object_type] or {}) do
        local text = clean_text(props[field])
        if text ~= "" then parts[#parts + 1] = text end
    end
    return #parts > 0 and table.concat(parts, " ") or object_type .. " " .. tostring(row.id or "")
end

local function content_of(row: Row, object_type: string): string
    local props = type(row.properties) == "table" and row.properties or {}
    local lines: { string } = { "# " .. title_of(row, object_type) }
    for _, field in ipairs(BODY_FIELDS[object_type] or {}) do
        local text = clean_text(props[field])
        if text ~= "" then lines[#lines + 1] = labelize(field) .. ": " .. text end
    end
    return table.concat(lines, "\n")
end

function M.from_row(
    row: Row,
    object_type: string,
    op: string,
    origin_mode: string,
    watermark_property: string,
    source_config: SourceConfig,
    associations: Associations?
): (Item?, config.ConfigError?)
    local properties = type(row.properties) == "table" and row.properties or {}
    local id = tostring(row.id or properties.hs_object_id or "")
    local version = version_of(row, watermark_property)
    local occurred_at = version ~= "" and version or row.updatedAt or row.createdAt or created_of(row)
    local external_id = object_type .. "/" .. id
    local key = "hubspot:" .. object_type .. ":" .. id
    local fields, mapping_err = config.apply_field_map(source_config, object_type, properties)
    if mapping_err then return nil, mapping_err end
    local payload: Payload = {
        id=id, object_type=object_type, entity=object_type,
        title=title_of(row, object_type), content=content_of(row, object_type),
        content_type="text/markdown", source_url="hubspot://" .. object_type .. "/" .. id,
        properties=properties, raw=row,
        provenance={ external_source="hubspot", external_id=external_id, external_version=version, object_type=object_type, object_id=id },
        origin={ mode=origin_mode, backfill=origin_mode == "backfill" },
        candidate={ external_source="hubspot", external_id=external_id, external_version=version, record_type=object_type },
        record={
            id=id,
            source={ type="hubspot.crm", id=tostring(source_config.connection_id or ""), version=version ~= "" and version or nil },
            fields=fields :: config.JsonObject,
        },
        created_at=created_of(row), updated_at=version, archived=row.archived == true,
        -- Absent for the object types that carry no engagement associations, so
        -- an empty set stays distinguishable from a type that never has one.
        associations=associations,
    }
    return {
        item_key=key, dedup_key=key .. ":" .. op .. ":" .. version, op=op,
        source_version=version ~= "" and version or nil,
        occurred_at=type(occurred_at) == "string" and occurred_at ~= "" and occurred_at or nil,
        payload=payload, ref=nil,
    }
end

M.Item = Item
M.Associations = Associations

return M
