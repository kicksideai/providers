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

-- Transcribe sparse pages after rasterization, preserving the other pages from
-- the primary markdown. Page images stay stored and failures remain in metadata.

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
    local parts = {}
    for _, section in ipairs(sections) do
        local body = (section.text :: string):match("^%s*(.-)%s*$") or ""
        parts[#parts + 1] = "<!-- page " .. tostring(section.page) .. " -->" .. (body ~= "" and ("\n\n" .. body) or "")
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

-- Rendered screenshots and extracted images share explicit page identity.
local function resolve_pages(upload_id: string, max_text: integer, min_bytes: integer, mime: string): ({ any }, string, boolean)
    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    local content = not primary_err and type(primary) == "table" and type(primary.content) == "string" and primary.content or ""
    if mime ~= "" and mime ~= "application/pdf" and content:match("%S") then return {}, content, false end

    local candidates = page_images.page_set(upload_id, min_bytes)
    local text_pages = page_images.text_pages(content, primary and primary.metadata and primary.metadata.ocr_page_outcomes)
    local identified = true
    for _, image in ipairs(candidates) do
        local number = type(image.metadata) == "table" and tonumber(image.metadata.page) or nil
        if not number or number < 1 or number % 1 ~= 0 then identified = false; break end
    end
    if #text_pages > 0 and identified then
        local by_page = {}
        for _, image in ipairs(candidates) do by_page[image.metadata.page] = image end
        local selected = {}
        for _, page in ipairs(text_pages) do
            if page_images.needs_ocr_text(page.text, 1, max_text, page.status) then
                selected[#selected + 1] = by_page[page.page] or {metadata = {page = page.page}}
            end
        end
        return selected, content, true
    end
    if not page_images.needs_ocr_text(content, #candidates, max_text) then return {}, content, false end
    return candidates, content, false
end

-- Commit page text and outcomes together on the primary artifact.
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

local function persist_primary(upload_id: string, storage_id: any, markdown: string, params: any, page: any, outcomes: any): (boolean, string?)
    local primary, primary_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
    if not primary_err and primary then
        local _, upd_err = artifact_content_repo.update_content(upload_id, primary.artifact_id, markdown, { mime_type = "text/markdown", metadata = {ocr_page_outcomes = outcomes}, cancel_ref = params.cancel_ref })
        if upd_err then return false, tostring(upd_err) end
        return true, nil
    end
    if primary_err and not errors.is(primary_err, errors.NOT_FOUND) then return false, tostring(primary_err) end
    local metadata = transcript_metadata(upload_id, params, page)
    metadata.ocr_page_outcomes = outcomes
    local _, create_err = artifact_content_repo.create_artifact({
        upload_id = upload_id,
        cancel_ref = params.cancel_ref,
        kind = "markdown",
        role = "primary",
        mime_type = "text/markdown",
        label = "ocr.md",
        ordinal = 1,
        content = markdown,
        storage_id = storage_id,
        metadata = metadata,
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
            local running, err = jobs.lease_valid(ref.job_id, {token = ref.lease_token, execution_seq = ref.execution_seq})
            if err ~= nil then error(tostring(err)) end
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
    local original: string = ""
    local per_page = true
    if mime:sub(1, 6) == "image/" then
        -- SVG is markup, not a raster image. Trim the declared base type first so
        -- valid `image/svg+xml ; charset=utf-8` forms cannot bypass this guard.
        if mime == "image/svg+xml" then return { success = true } end
        if not setting_bool("ocr_images", true) then return { success = true } end
        pages = image_page(upload_id)
    else
        pages, original, per_page = resolve_pages(upload_id, max_text, min_bytes, mime)
    end
    local primary, primary_err = artifact_parts_repo.read_primary_content(upload_id)
    if primary_err and not errors.is(primary_err, errors.NOT_FOUND) then
        return {success = false, error = tostring(primary_err)}
    end
    if original == "" and primary then original = primary.content :: string end
    local previous = primary and primary.metadata and primary.metadata.ocr_page_outcomes or {}
    local outcomes, by_page = {}, {}
    for _, outcome in ipairs(previous) do by_page[outcome.page] = outcome end
    local document_pages = per_page and page_images.text_pages(original) or {}
    local targets = {}
    for index, page in ipairs(pages) do
        local number = page_number(page, index)
        local outcome = by_page[number]
        if not outcome or (outcome.status ~= "readable" and outcome.status ~= "blank") then targets[#targets + 1] = {page = page, index = number} end
    end
    if #document_pages == 0 then
        for index, page in ipairs(pages) do
            document_pages[#document_pages + 1] = {page = page_number(page, index), text = ""}
        end
    end
    if #document_pages == 0 then return {success = true} end
    local target_numbers = {}
    for _, item in ipairs(targets) do target_numbers[item.index] = true end
    for _, page in ipairs(document_pages) do
        local outcome = by_page[page.page]
        if not outcome then
            outcome = {page = page.page, source = target_numbers[page.page] and "ocr" or "text"}
            if not target_numbers[page.page] then outcome.status = "readable" end
        end
        outcomes[#outcomes + 1], by_page[page.page] = outcome, outcome
    end

    local model = setting_str("ocr_model", DEFAULT_MODEL)
    local user_prompt = setting_str("ocr_prompt", "")
    local batch_size = math.max(1, math.floor(tonumber(deps.batch_size) or setting_int(SETTINGS_NS, "ocr_batch_size", DEFAULT_BATCH_SIZE))) :: integer
    local call_timeout = setting_int(SETTINGS_NS, "ocr_call_timeout_ms", DEFAULT_CALL_TIMEOUT_MS)
    local should_continue = build_should_continue(deps, params)
    local sections, page_errors = {}, {}
    local function transcribe_page(item: any): any
        local page = item.page
        if not page.artifact_id then return nil, "page image is unavailable" end
        local bytes, read_err = artifact_content_repo.read_artifact_content(upload_id, page.artifact_id)
        if read_err or type(bytes) ~= "string" then return nil, tostring(read_err or "page image content is unavailable") end
        local text, ocr_err = transcribe(bytes, {mime = page.mime_type, model = model, prompt = user_prompt, timeout = call_timeout})
        if ocr_err then return nil, tostring(ocr_err) end
        if type(text) ~= "string" then return nil, "OCR returned invalid text" end
        return {page = item.index, text = text}
    end
    local function checkpoint(): (boolean, string?)
        local markdown
        if per_page and #page_images.text_pages(original) > 0 then markdown = page_images.replace_pages(original, sections)
        else
            local replacements = {}
            for _, section in ipairs(sections) do replacements[section.page] = section.text end
            local ordered = {}
            for _, page in ipairs(document_pages) do ordered[#ordered + 1] = {page = page.page, text = replacements[page.page] or page.text} end
            markdown = build_markdown(ordered)
        end
        return persist(upload_id, params.storage_id, markdown, params, pages[1], outcomes)
    end
    local start, persist_error, cancelled = 1, nil, false
    while start <= #targets do
        if not should_continue() then cancelled = true; break end
        local last = math.min(start + batch_size - 1, #targets)
        local batch = {}
        for index = start, last do batch[#batch + 1] = targets[index] end
        local results = parallel_map(batch, transcribe_page, batch_size)
        for index, item in ipairs(batch) do
            local result = results[index]
            local outcome = by_page[item.index]
            if result.error ~= nil then
                outcome.status, outcome.error = "failed", "transcription_failed"
                page_errors[#page_errors + 1] = "Page " .. item.index .. ": " .. tostring(result.error)
            else
                local text = result.value.text
                outcome.status, outcome.error = text:match("%S") and "readable" or "blank", nil
                sections[#sections + 1] = result.value
            end
        end
        local ok, err = checkpoint()
        if not ok then persist_error = tostring(err); break end
        start = last + 1
    end
    if #targets == 0 and #previous == 0 then
        local ok, err = checkpoint()
        if not ok then persist_error = tostring(err) end
    end
    local failed, transcribed = 0, 0
    for _, outcome in ipairs(outcomes) do
        if outcome.status == "readable" then
            if outcome.source == "ocr" then transcribed = transcribed + 1 end
        elseif outcome.status == "failed" then failed = failed + 1 end
    end
    local code: any = persist_error and "persist_failed" or (failed > 0 and "transcription_failed" or false)
    if persist_error then page_errors[#page_errors + 1] = "Transcript checkpoint: " .. persist_error end
    local metadata = {ocr_pages = transcribed, ocr_total_pages = #document_pages, ocr_page_outcomes = outcomes,
        ocr_error = code, _ocr_error_detail = #page_errors > 0 and table.concat(page_errors, "\n"):sub(1, MAX_ERROR_DETAIL_BYTES) or false}
    if code or cancelled then return {success = false, error = code or "OCR cancelled", metadata = metadata} end
    log:info("ocr transcribed document", {upload_id = upload_id, pages = transcribed, total_pages = #document_pages, model = model})
    return {success = true, metadata = metadata}
end

local function process(params: any): any
    return run(params, {})
end

return { process = process, run = run, build_markdown = build_markdown }
