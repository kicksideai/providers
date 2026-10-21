local M = {}
local artifact_content_repo = require("artifact_content_repo")

local EVENT_CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
local EVENT_CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
local EXTERNAL_SOURCE = "knowledge.kb"

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function shallow_copy(input)
    local out = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function external_tuple(event, body, metadata)
    local external = type(event.external) == "table" and event.external or {}
    local source = trim(external.external_source)
    if source == "" then source = trim(metadata.external_source) end
    if source == "" then source = EXTERNAL_SOURCE end

    local id = trim(external.external_id)
    if id == "" then id = trim(metadata.external_id) end
    if id == "" then
        local upload_id = trim(metadata.upload_id)
        if upload_id ~= "" then id = "upload:" .. upload_id end
    end
    if id == "" then
        local url = trim(metadata.source_url)
        if url ~= "" then id = "url:" .. url end
    end

    local version = trim(external.external_version)
    if version == "" then version = trim(metadata.external_version) end

    return source, id, version
end

function M.run(input)
    input = type(input) == "table" and input or {}
    local event = type(input.event) == "table" and input.event or {}
    local body = type(event.body) == "table" and event.body or {}
    local metadata = shallow_copy(body.metadata)
    local source_ref = type(body.source_ref) == "table" and shallow_copy(body.source_ref) or nil
    if source_ref then
        metadata.source_ref = source_ref
    end

    if event.type == EVENT_CONTENT_DELETED then
        local source, external_id, external_version = external_tuple(event, body, metadata)
        if external_id == "" then
            return { documents = {}, deletes = {}, error = "delete event missing external_id" }
        end
        metadata.external_source = source
        metadata.external_id = external_id
        if external_version ~= "" then metadata.external_version = external_version end
        metadata.thread_event_id = trim(event.id)
        metadata.thread_event_seq = tonumber(event.seq) or metadata.thread_event_seq
        local user_id = trim(body.actor_id or metadata.actor_id)
        return {
            documents = {},
            deletes = {
                {
                    external_source = source,
                    external_id = external_id,
                    external_version = external_version ~= "" and external_version or nil,
                    source_ref = source_ref,
                    metadata = metadata,
                    thread_event_id = metadata.thread_event_id,
                    thread_event_seq = metadata.thread_event_seq,
                    user_id = user_id ~= "" and user_id or nil,
                },
            },
        }
    end

    if event.type ~= EVENT_CONTENT_UPSERTED then
        return { documents = {}, deletes = {} }
    end

    local content = body.content
    if content == nil and body.content_omitted == true then
        local ref = source_ref or {}
        local read_err
        content, read_err = artifact_content_repo.read_artifact_content(ref.upload_id, ref.artifact_id)
        if read_err then
            return { documents = {}, deletes = {}, error = "content artifact read failed: " .. tostring(read_err) }
        end
    end
    if type(content) ~= "string" or trim(content) == "" then
        return { documents = {}, deletes = {}, error = "content event missing content" }
    end

    local kb_id = trim(body.kb_id or metadata.kb_id)
    if kb_id ~= "" then metadata.kb_id = kb_id end

    local source, external_id, external_version = external_tuple(event, body, metadata)
    if external_id == "" then
        return { documents = {}, deletes = {}, error = "content event missing external_id" }
    end

    metadata.external_source = source
    metadata.external_id = external_id
    if external_version ~= "" then metadata.external_version = external_version end
    metadata.thread_event_id = trim(event.id)
    metadata.thread_event_seq = tonumber(event.seq) or metadata.thread_event_seq
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "knowledge"

    local title = trim(body.title or metadata.title or metadata.filename or metadata.source_url)

    return {
        documents = {
            {
                external_source = source,
                external_id = external_id,
                external_version = external_version ~= "" and external_version or nil,
                content = content,
                content_type = trim(body.content_type) ~= "" and trim(body.content_type) or "text/plain",
                title = title ~= "" and title or nil,
                metadata = metadata,
                source_ref = source_ref,
            },
        },
        deletes = {},
    }
end

return { run = M.run }
