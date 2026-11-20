local M = {}
local artifact_input = require("artifact_input")
local hash = require("hash")
local uuid = require("uuid")
local trim = require("text_trim").trim

local EVENT_CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
local EVENT_CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
local EXTERNAL_SOURCE = "knowledge.kb"
local VERSIONED_DELETE_SOURCE = "knowledge.kb.versioned_delete"

local function shallow_copy(input)
    local out = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function external_tuple(event, metadata)
    local external = type(event.external) == "table" and event.external or {}
    local source = trim(external.external_source)
    if event.type == EVENT_CONTENT_DELETED and source == VERSIONED_DELETE_SOURCE then source = EXTERNAL_SOURCE end
    local stored_source, stored_id = trim(metadata.external_source), trim(metadata.external_id)
    local id = trim(external.external_id)
    if (source ~= "" and stored_source ~= "" and source ~= stored_source) or
        (id ~= "" and stored_id ~= "" and id ~= stored_id) then
        return nil, nil, nil, "knowledge event contains contradictory external identity"
    end
    if source == "" then source = stored_source end
    if source == "" then source = EXTERNAL_SOURCE end

    if id == "" then id = stored_id end
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

local function extract(input)
    input = type(input) == "table" and input or {}
    local event = type(input.event) == "table" and input.event or {}
    if event.type ~= EVENT_CONTENT_UPSERTED and event.type ~= EVENT_CONTENT_DELETED then
        return { documents = {}, deletes = {} }
    end
    local body = type(event.body) == "table" and event.body or {}
    local metadata = shallow_copy(body.metadata)
    local source_ref = type(body.source_ref) == "table" and shallow_copy(body.source_ref) or nil
    if source_ref then
        metadata.source_ref = source_ref
    end

    local source, external_id, external_version, tuple_err = external_tuple(event, metadata)
    if tuple_err then return { documents = {}, deletes = {}, error = tuple_err } end
    if event.type == EVENT_CONTENT_DELETED then
        local expected
        if type(event.external) == "table" and event.external.external_source == VERSIONED_DELETE_SOURCE then
            expected = body.expected_publication_id
            if type(expected) ~= "string" or not uuid.validate(expected) then
                return {documents = {}, deletes = {}, error = "versioned delete requires an upload publication ID"}
            end
        end
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
                    expected_publication_id = expected,
                    user_id = user_id ~= "" and user_id or nil,
                },
            },
        }
    end

    local content = body.content
    local rejection
    if content == nil and body.content_omitted == true then
        local ref = source_ref or {}
        local read_err, recorded_blob
        content, read_err, rejection, recorded_blob = artifact_input.read(
            ref.upload_id, ref.artifact_id, body.content_bytes, body.content_sha256)
        if read_err and not rejection then
            -- A missing storage binding or locator configuration cannot prove
            -- that the selected immutable artifact is gone.
            if errors.is(read_err, errors.NOT_FOUND) then
                return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true, message = tostring(read_err)})
            end
            return nil, read_err
        end
        if not rejection and (type(content) ~= "string" or #content ~= body.content_bytes) then
            if not recorded_blob then
                return { documents = {}, deletes = {}, error = "content artifact byte length changed", retryable = true }
            end
            rejection = "artifact_length_mismatch"
        elseif not rejection and body.content_sha256 ~= nil then
            local digest, digest_err = hash.sha256(content :: string)
            if digest_err or digest ~= body.content_sha256 then
                if not recorded_blob or digest_err or type(digest) ~= "string" or #digest ~= 64 then
                    return { documents = {}, deletes = {}, error = "content artifact digest changed", retryable = true }
                end
                rejection = "artifact_digest_mismatch"
            end
        end
    end
    if not rejection and trim(content) == "" then
        return { documents = {}, deletes = {}, error = "content event missing content" }
    end

    local kb_id = trim(body.kb_id or metadata.kb_id)
    if kb_id ~= "" then metadata.kb_id = kb_id end

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

    local document = {
        external_source = source,
        external_id = external_id,
        external_version = external_version ~= "" and external_version or nil,
        content = not rejection and content or nil,
        content_type = trim(body.content_type) ~= "" and trim(body.content_type) or "text/plain",
        title = title ~= "" and title or nil,
        metadata = metadata,
        source_ref = source_ref,
    }
    if rejection then return {rejection = {document = document, code = rejection}} end
    return {documents = {document}, deletes = {}}
end

function M.run(input)
    return extract(input)
end

-- The primary worker can group independent inputs by the same canonical
-- identity without opening an immutable artifact or invoking a model.
function M.source_identity(event, metadata)
    return external_tuple({type = event.type, external = event}, metadata)
end

function M.checkpoint_input(event)
    return extract({event = event})
end

return M
