local ctx = require("ctx")
local thread_ingest = require("thread_ingest")

type Map = { [string]: any }

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function shallow_copy(input: any): Map
    local out: Map = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function default_source_ref(request: Map, metadata: Map, content_type: string, title: string): Map
    if type(request.source_ref) == "table" then return shallow_copy(request.source_ref) end
    if type(metadata.source_ref) == "table" then return shallow_copy(metadata.source_ref) end

    local kind = trim(metadata.kind)
    if kind == "" then
        if trim(metadata.upload_id) ~= "" then
            kind = "upload"
        elseif trim(metadata.source_url) ~= "" then
            kind = "url"
        elseif trim(metadata.reference_component_id) ~= "" then
            kind = "reference"
        else
            kind = "manual"
        end
    end

    return {
        kind = kind,
        origin = "kb10.embed_content",
        title = title,
        content_type = content_type,
        upload_id = metadata.upload_id,
        source_url = metadata.source_url,
        reference_component_id = metadata.reference_component_id,
        reference_context = metadata.reference_context,
    }
end

local function handle(request: any)
    local req = (type(request) == "table" and request or {}) :: Map

    local component_id = trim(ctx.get("component_id"))
    if component_id == "" then
        return { success = false, error = "component_id not found in context" }
    end

    local content = req.content
    if type(content) ~= "string" or trim(content) == "" then
        return { success = false, error = "content is required" }
    end

    local content_type = trim(req.content_type)
    if content_type == "" then content_type = "text/plain" end

    local metadata = shallow_copy(req.metadata)
    metadata.source = trim(metadata.source) ~= "" and metadata.source or "kb10.embed_content"
    local title = trim(req.title or metadata.title or metadata.filename or metadata.source_url)

    local queued, ingest_err = thread_ingest.append_content(component_id, {
        content = content,
        content_type = content_type,
        metadata = metadata,
        title = title ~= "" and title or nil,
        external_id = req.external_id,
        external_version = req.external_version,
        source_ref = default_source_ref(req, metadata, content_type, title),
        trace_context = req.trace_context,
    })
    if ingest_err or not queued then
        return { success = false, error = "ingest enqueue failed: " .. tostring(ingest_err) }
    end

    return {
        success = true,
        status = "queued",
        kb_id = component_id,
        thread_id = queued.thread_id,
        projection_id = queued.projection_id,
        cursor_id = queued.cursor_id,
        external_source = queued.external_source,
        external_id = queued.external_id,
        external_version = queued.external_version,
        source_ref = queued.source_ref,
        trace_context = queued.trace_context,
        content_length = #content,
    }
end

return { handle = handle }
