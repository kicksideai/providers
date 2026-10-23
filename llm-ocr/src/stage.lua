local contract = require("contract")
local logger = require("logger")
local channel = require("channel")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local ocr = require("ocr")
local page_images = require("page_images")
local jobs = require("jobs")

-- Bounded-concurrency map: page transcription is network-bound (one vision call each),
-- so fan the pages across a few cooperative workers and overlap the calls. Results are
-- placed back by index, so page order is preserved regardless of completion order.
local function parallel_map(items: { any }, fn: any, concurrency: integer): { any }
    local n = #items
    local out: { any } = {}
    if n == 0 then return out end
    local workers = concurrency
    if workers > n then workers = n end
    if workers < 1 then workers = 1 end

    local work = channel.new(n)
    local results = channel.new(n)
    for i = 1, n do work:send({ index = i, value = items[i] }) end
    work:close()

    for _ = 1, workers do
        coroutine.spawn(function()
            while true do
                local job, ok = work:receive()
                if not ok then return end
                local call_ok, value, err = pcall(fn, job.value)
                if not call_ok then err, value = value, nil end
                results:send({ index = job.index, value = value, error = err })
            end
        end)
    end

    for _ = 1, n do
        local res = results:receive()
        out[res.index] = { value = res.value, error = res.error }
    end
    return out
end

-- Universal upload stage that runs after the rasterizer. It transcribes the document's
-- page images with an LLM and replaces the empty primary markdown with the text, so the
-- knowledge base embeds the real document text. The page images are the rendered
-- screenshots when the rasterizer produced them, otherwise the large images doc2md
-- already extracted (image-paged PDFs). Page images stay stored; only the primary
-- content changes. Failures remain visible in document metadata; the file stays available.

local SETTINGS_CONTRACT = "kickside.settings:settings"
local SETTINGS_NS = "kickside.llm_ocr"
local RASTERIZE_NS = "kickside.uploads.rasterize"
local DEFAULT_MODEL = "class:fast"
local MAX_ERROR_DETAIL_BYTES = 2000
-- Pages are transcribed in small batches so a cancel/terminate is honored between
-- batches and each batch's text is checkpointed as it completes -- a later failure
-- or termination keeps the pages already transcribed.
local DEFAULT_BATCH_SIZE = 4
-- Per-page OCR call budget. Larger than a chat call (a dense page is slow) but
-- still bounded, so a hung inference returns an error instead of pinning the job.
local DEFAULT_CALL_TIMEOUT_MS = 120000

local log = logger:named("llm_ocr")

local function get_setting(ns: string, key: string): any
    local def = contract.get(SETTINGS_CONTRACT)
    if not def then return nil end
    local inst = def:open()
    if not inst then return nil end
    local r = inst:get({ namespace = ns, key = key })
    if r and r.success then return r.value end
    return nil
end

local function setting_bool(key: string, default: boolean): boolean
    local v = get_setting(SETTINGS_NS, key)
    if v == nil or v == "" then return default end
    return v == true or tostring(v):lower() == "true"
end

local function setting_str(key: string, default: string): string
    local v = get_setting(SETTINGS_NS, key)
    if type(v) == "string" and (v :: string) ~= "" then return v :: string end
    return default
end

local function setting_int(ns: string, key: string, default: integer): integer
    local v = tonumber(get_setting(ns, key))
    if v == nil then return default end
    return math.floor(v) :: integer
end

local function page_number(artifact: any, fallback: integer): integer
    local meta = type(artifact.metadata) == "table" and artifact.metadata or {}
    return (tonumber(meta.page) or fallback) :: integer
end

local function build_markdown(sections: { any }): string
    local multi = #sections > 1
    local parts = {}
    for _, s in ipairs(sections) do
        local body = (s.text :: string):match("^%s*(.-)%s*$") or ""
        if body ~= "" then
            if multi then parts[#parts + 1] = "## Page " .. tostring(s.page) .. "\n\n" .. body
            else parts[#parts + 1] = body end
        end
    end
    return table.concat(parts, "\n\n")
end

-- The image processor stores the uploaded image as its own primary artifact; it
-- is not a text primary and therefore is deliberately distinct from the markdown
-- primary created after OCR.
local function image_page(upload_id: string): { any }
    local artifacts = artifact_parts_repo.list_artifacts(upload_id) or {}
    for _, artifact in ipairs(artifacts) do
        if artifact.kind == "image" and artifact.role == "primary" then return { artifact } end
    end
    return {}
end

-- Resolve the page images to transcribe: rendered screenshots when present, else the
-- large extracted images -- but extracted images are transcribed only when the document
-- has no text of its own (an image-paged scan), never a text document with figures.
local function resolve_pages(upload_id: string, max_text: integer, min_bytes: integer, mime: string): { any }
    local rendered = (page_images.rendered(upload_id) or {}) :: { any }
    if #rendered > 0 then return rendered end

    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    if primary_err or type(primary) ~= "table" then return {} end
    if mime ~= "" and mime ~= "application/pdf" and type(primary.content) == "string" and primary.content:match("%S") then
        return {}
    end

    local extracted = (page_images.extracted_pages(upload_id, min_bytes) or {}) :: { any }
    if #extracted == 0 then return {} end
    if not page_images.needs_ocr_text(primary.content, #extracted, max_text) then return {} end
    return extracted
end

-- Replace (or create) the document's primary markdown with the transcribed text.
-- Best-effort: returns (ok, err?) so a checkpoint failure stops further work
-- without failing the whole upload.
local CANONICAL_METADATA_FIELDS = {
    "source", "source_url", "source_mime", "external_id", "external_version",
    "source_ref", "title", "reference_component_id", "reference_context",
}

local function put_if_present(target: any, key: string, value: any)
    if value == nil or (type(value) == "string" and value == "") then return end
    target[key] = value
end

-- Creating the transcript makes it the upload's primary content, so it must carry
-- the provenance normally established by the text/document processors. Upload
-- metadata has the caller-supplied source fields; the image artifact has fields
-- produced by the images processor itself.
local function transcript_metadata(upload_id: string, params: any, page: any): any
    local upload_meta = type(params.metadata) == "table" and params.metadata or {}
    local image_meta = type(page) == "table" and type(page.metadata) == "table" and page.metadata or {}
    local out: any = { converter = "llm-ocr", conversion = true, original_upload_id = upload_id }
    for _, key in ipairs(CANONICAL_METADATA_FIELDS) do
        put_if_present(out, key, upload_meta[key])
    end
    put_if_present(out, "source_mime", out.source_mime or params.mime_type)
    put_if_present(out, "filename", upload_meta.filename or image_meta.original_filename)
    put_if_present(out, "original_filename", upload_meta.original_filename or upload_meta.filename or image_meta.original_filename)
    put_if_present(out, "original_mime_type", params.mime_type or image_meta.original_mime_type or (page and page.mime_type))
    put_if_present(out, "original_size", params.size or image_meta.original_size or image_meta.file_size or (page and page.size))
    put_if_present(out, "original_storage_id", params.storage_id or image_meta.original_storage_id)
    put_if_present(out, "original_storage_path", params.storage_path or image_meta.original_storage_path)
    put_if_present(out, "original_image_artifact_id", page and page.artifact_id)
    return out
end

local function persist_primary(upload_id: string, storage_id: any, markdown: string, params: any, page: any): (boolean, string?)
    local primary, primary_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
    if not primary_err and primary then
        local _, upd_err = artifact_content_repo.update_content(upload_id, primary.artifact_id, markdown, { mime_type = "text/markdown" })
        if upd_err then return false, tostring(upd_err) end
        return true, nil
    end
    local _, create_err = artifact_content_repo.create_artifact({
        upload_id = upload_id,
        kind = "markdown",
        role = "primary",
        mime_type = "text/markdown",
        label = "ocr.md",
        ordinal = 1,
        content = markdown,
        storage_id = storage_id,
        metadata = transcript_metadata(upload_id, params, page),
    })
    if create_err then return false, tostring(create_err) end
    return true, nil
end

-- The cancellation gate checked between batches. An injected deps.should_continue
-- wins (tests); otherwise the job lease carried in params.cancel_ref is polled so a
-- cancelled or reclaimed job stops promptly. With neither, OCR runs to completion.
local function build_should_continue(deps: any, params: any): () -> boolean
    if type(deps.should_continue) == "function" then
        return function(): boolean return deps.should_continue() ~= false end
    end
    local ref = type(params.cancel_ref) == "table" and params.cancel_ref or nil
    if ref and type(ref.job_id) == "string" and ref.job_id ~= "" and type(ref.lease_token) == "string" and ref.lease_token ~= "" then
        return function(): boolean
            local running, err = jobs.still_running({ id = ref.job_id, lease_token = ref.lease_token })
            -- A transient lookup error must not abort a live job; only a definitive
            -- "no longer running" stops the loop.
            if err ~= nil then return true end
            return running == true
        end
    end
    return function(): boolean return true end
end

local function run(params: any, deps: any): any
    deps = type(deps) == "table" and deps or {}
    local transcribe = deps.transcribe
    if transcribe == nil then transcribe = ocr.new().transcribe end
    local persist = type(deps.persist) == "function" and deps.persist or persist_primary

    -- A universal best-effort stage must never fail the upload: malformed params is a
    -- no-op, not a throw (which the pipeline would record as a failed upload).
    if type(params) ~= "table" or type(params.upload_id) ~= "string" then
        return { success = true }
    end
    local upload_id = params.upload_id :: string

    if not setting_bool("ocr_enabled", true) then return { success = true } end

    local default_max_text = (tonumber(page_images.DEFAULT_MAX_TEXT_BYTES_PER_PAGE) or 800) :: integer
    local default_min_bytes = (tonumber(page_images.DEFAULT_MIN_PAGE_BYTES) or 200000) :: integer
    local max_text = setting_int(SETTINGS_NS, "ocr_max_text_bytes", default_max_text)
    local min_bytes = setting_int(RASTERIZE_NS, "rasterize_min_page_bytes", default_min_bytes)
    local declared = type(params.mime_type) == "string" and (params.mime_type :: string):lower() or ""
    local mime = ((declared:match("^[^;]*") or ""):match("^%s*(.-)%s*$")) :: string
    local pages: { any } = {}
    if mime:sub(1, 6) == "image/" then
        -- SVG is markup, not a raster image. Trim the declared base type first so
        -- valid `image/svg+xml ; charset=utf-8` forms cannot bypass this guard.
        if mime == "image/svg+xml" then return { success = true } end
        if not setting_bool("ocr_images", true) then return { success = true } end
        pages = image_page(upload_id)
    else
        pages = resolve_pages(upload_id, max_text, min_bytes, mime)
    end
    if #pages == 0 then return { success = true } end

    local model = setting_str("ocr_model", DEFAULT_MODEL)
    local user_prompt = setting_str("ocr_prompt", "")
    local batch_size = (math.floor(tonumber(deps.batch_size) or setting_int(SETTINGS_NS, "ocr_batch_size", DEFAULT_BATCH_SIZE))) :: integer
    if batch_size < 1 then batch_size = 1 end
    local call_timeout = setting_int(SETTINGS_NS, "ocr_call_timeout_ms", DEFAULT_CALL_TIMEOUT_MS)

    local should_continue = build_should_continue(deps, params)

    local page_errors: { string } = {}
    local persist_failed = false
    local function transcribe_page(item: any): any
        local page = item.page
        local bytes, read_err = artifact_content_repo.read_artifact_content(upload_id, page.artifact_id)
        if read_err or type(bytes) ~= "string" then
            log:warn("ocr: failed to read page image", { upload_id = upload_id, error = tostring(read_err) })
            return nil, tostring(read_err or "page image content is unavailable")
        end
        local text, ocr_err = transcribe(bytes, { mime = page.mime_type, model = model, prompt = user_prompt, timeout = call_timeout })
        if ocr_err then
            log:warn("ocr: transcription failed", { upload_id = upload_id, page = page_number(page, item.index), error = tostring(ocr_err) })
            return nil, tostring(ocr_err)
        end
        if type(text) == "string" and text:match("%S") then
            return { page = page_number(page, item.index), text = text }
        end
        return nil
    end

    local sections = {}
    local persisted = false
    local total = #pages
    local start = 1
    while start <= total do
        -- The pipeline already gated before invoking the stage, so the first batch
        -- runs unconditionally; honor cancellation before each subsequent batch.
        if start > 1 and not should_continue() then
            log:info("ocr: cancelled between batches", { upload_id = upload_id, transcribed = #sections })
            break
        end

        local last = math.min(start + batch_size - 1, total)
        local batch = {}
        for i = start, last do batch[#batch + 1] = { page = pages[i], index = i } end

        local results = parallel_map(batch, transcribe_page, batch_size)
        for index = 1, #batch do
            local result = results[index]
            if result.error ~= nil then
                page_errors[#page_errors + 1] = "Page " .. tostring(page_number(batch[index].page, batch[index].index)) .. ": " .. tostring(result.error)
            end
            if type(result.value) == "table" then sections[#sections + 1] = result.value end
        end

        -- Checkpoint after each batch so a later failure/terminate keeps these pages.
        local markdown = build_markdown(sections)
        if markdown ~= "" then
            local ok, perr = persist(upload_id, params.storage_id, markdown, params, pages[1])
            if not ok then
                log:warn("ocr: failed to persist transcription checkpoint", { upload_id = upload_id, error = tostring(perr) })
                page_errors[#page_errors + 1] = "Transcript checkpoint: " .. tostring(perr)
                persist_failed = true
                break
            end
            persisted = true
        end

        start = last + 1
    end

    -- Public metadata carries only a stable code; provider text stays in the log and
    -- in the private _ocr_error_detail field.
    local error_code: any = false
    local error_detail: any = false
    if #page_errors > 0 then
        error_code = persist_failed and "persist_failed" or "transcription_failed"
        error_detail = table.concat(page_errors, "\n"):sub(1, MAX_ERROR_DETAIL_BYTES)
    end

    if not persisted or #sections == 0 then
        if #pages > 0 then
            return { success = true, metadata = { ocr_error = error_code or "no_text_detected", _ocr_error_detail = error_detail } }
        end
        return { success = true }
    end

    log:info("ocr transcribed document", { upload_id = upload_id, pages = #sections, total_pages = #pages, model = model })
    return { success = true, metadata = { ocr_pages = #sections, ocr_total_pages = #pages, ocr_error = error_code, _ocr_error_detail = error_detail } }
end

local function process(params: any): any
    return run(params, {})
end

return { process = process, run = run, build_markdown = build_markdown }
