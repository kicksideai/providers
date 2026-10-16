local contract = require("contract")
local fs = require("fs")
local logger = require("logger")
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")

local SETTINGS_CONTRACT = "kickside.settings:settings"
local TRANSCRIBER_CONTRACT = "kickside.asr:transcriber"
local SETTINGS_NS = "kickside.asr"

-- A transcriber holds the whole clip in memory.
local DEFAULT_MAX_BYTES = 25 * 1024 * 1024
local DEFAULT_MAX_TRANSCRIPT_BYTES = 5 * 1024 * 1024
local DEFAULT_CALL_TIMEOUT_MS = 120000

local log = logger:named("asr")

-- Video is in because the speech is: extracting the audio track is the binding's
-- side of the contract.
local function is_transcribable(mime: any): boolean
    if type(mime) ~= "string" then return false end
    local family = (mime :: string):lower()
    return family:sub(1, 6) == "audio/" or family:sub(1, 6) == "video/"
end

local function get_setting(key: string): any
    local def = contract.get(SETTINGS_CONTRACT)
    if not def then return nil end
    local inst = def:open()
    if not inst then return nil end
    local result = inst:get({ namespace = SETTINGS_NS, key = key })
    if result and result.success then return result.value end
    return nil
end

local function setting_bool(key: string, default: boolean): boolean
    local value = get_setting(key)
    if value == nil or value == "" then return default end
    return value == true or tostring(value):lower() == "true"
end

local function setting_str(key: string, default: string): string
    local value = get_setting(key)
    if type(value) == "string" and (value :: string) ~= "" then return value :: string end
    return default
end

local function setting_int(key: string, default: integer): integer
    local value = tonumber(get_setting(key))
    if value == nil then return default end
    return math.floor(value) :: integer
end

-- Stat before reading so an untrusted upload size cannot make us allocate a
-- whole over-limit object. The post-read check remains necessary because a
-- storage object may change between stat and read.
local function read_audio(storage_id: any, storage_path: any, max_bytes: integer, get_storage: any): (string?, string?, string?)
    if type(storage_id) ~= "string" or type(storage_path) ~= "string" then
        return nil, "storage_pointer_missing", "upload has no storage pointer"
    end

    local storage, storage_err = get_storage(storage_id :: string)
    if not storage then
        return nil, "storage_unavailable", "storage " .. tostring(storage_id) .. " is unavailable: " .. tostring(storage_err)
    end

    local info, stat_err = storage:stat(storage_path :: string)
    if stat_err ~= nil or type(info) ~= "table" then
        return nil, "storage_stat_failed", tostring(stat_err)
    end
    local reported_size = tonumber((info :: any).size)
    if reported_size == nil or reported_size < 0 then
        return nil, "storage_stat_failed", "storage returned an invalid object size"
    end
    if reported_size > max_bytes then
        return nil, "too_large", "storage reported " .. tostring(reported_size) .. " bytes"
    end

    local bytes, read_err = storage:readfile(storage_path :: string)
    if type(bytes) ~= "string" or (bytes :: string) == "" then
        return nil, "storage_read_failed", tostring(read_err)
    end
    if #(bytes :: string) > max_bytes then
        return nil, "too_large", "storage returned " .. tostring(#(bytes :: string)) .. " bytes after stat"
    end
    return bytes :: string, nil, nil
end

-- No binding means no transcriber is installed, which is a no-op rather than an
-- error.
local function transcribe_through_contract(request: any): (string?, string?, boolean?)
    local def = contract.get(TRANSCRIBER_CONTRACT)
    if not def then return nil, nil end

    -- Treated as "no transcriber": the alternative fails every audio upload on a
    -- misconfigured host.
    local instance, open_err = def:open()
    if open_err or not instance then
        log:debug("asr: no transcriber binding could be opened", { error = tostring(open_err) })
        return nil, nil
    end

    local result, call_err = instance:transcribe(request)
    if call_err then return nil, tostring(call_err) end
    if type(result) ~= "table" then return nil, "transcriber returned no result" end

    local reported = tostring((result :: any).error or "")
    if reported ~= "" then return nil, reported end

    local text = (result :: any).text
    if type(text) ~= "string" then return nil, "transcriber returned no text" end
    return text :: string, nil, (result :: any).truncated == true
end

-- Primary content, so the thread, the agent and the knowledge base read words
-- rather than a file name.
-- get_info answers "unknown" when the primary artifact carries no filename, so a
-- voice note would lose its name the moment it was transcribed.
local CANONICAL_METADATA_FIELDS = {
    "source", "source_url", "source_mime", "external_id", "external_version",
    "source_ref", "title", "reference_component_id", "reference_context",
}

local function put_if_present(target: any, key: string, value: any)
    if value == nil or (type(value) == "string" and value == "") then return end
    target[key] = value
end

local function transcript_metadata(params: any): any
    local upload_metadata = type(params.metadata) == "table" and params.metadata or {}
    local carried: any = { converter = "asr", conversion = true }
    for _, key in ipairs(CANONICAL_METADATA_FIELDS) do
        put_if_present(carried, key, upload_metadata[key])
    end
    put_if_present(carried, "filename", upload_metadata.filename)
    put_if_present(carried, "original_filename", upload_metadata.original_filename or upload_metadata.filename)
    put_if_present(carried, "original_mime_type", params.mime_type)
    put_if_present(carried, "source_mime", carried.source_mime or params.mime_type)
    put_if_present(carried, "original_upload_id", params.upload_id)
    put_if_present(carried, "original_storage_id", params.storage_id)
    put_if_present(carried, "original_storage_path", params.storage_path)
    put_if_present(carried, "original_size", params.size)
    return carried
end

local function persist_primary(upload_id: string, storage_id: any, text: string, metadata: any): (boolean, string?)
    local primary, primary_err = artifact_parts_repo.get_primary_content_artifact(upload_id)
    if not primary_err and primary then
        local _, update_err = artifact_content_repo.update_content(upload_id, primary.artifact_id, text, { mime_type = "text/markdown" })
        if update_err then return false, tostring(update_err) end
        return true, nil
    end

    local _, create_err = artifact_content_repo.create_artifact({
        upload_id = upload_id,
        kind = "markdown",
        role = "primary",
        mime_type = "text/markdown",
        label = "transcript.md",
        ordinal = 1,
        content = text,
        storage_id = storage_id,
        metadata = metadata,
    })
    if create_err then return false, tostring(create_err) end
    return true, nil
end

local function positive_limit(value: any, default: integer): integer
    local parsed = tonumber(value)
    if parsed == nil or parsed < 1 then return default end
    return math.floor(parsed) :: integer
end

local function public_read_error(code: any): string
    local allowed = {
        storage_pointer_missing = true,
        storage_unavailable = true,
        storage_stat_failed = true,
        storage_read_failed = true,
        too_large = true,
    }
    local name = tostring(code or "")
    if allowed[name] then return name end
    return "storage_read_failed"
end

local function run(params: any, deps: any): any
    deps = type(deps) == "table" and deps or {}
    local transcribe = type(deps.transcribe) == "function" and deps.transcribe or transcribe_through_contract
    local read = type(deps.read) == "function" and deps.read or function(storage_id: any, storage_path: any, max_bytes: integer)
        local get_storage = type(deps.get_storage) == "function" and deps.get_storage or fs.get
        return read_audio(storage_id, storage_path, max_bytes, get_storage)
    end
    local persist = type(deps.persist) == "function" and deps.persist or persist_primary

    -- Throwing here would record the upload as failed.
    if type(params) ~= "table" or type(params.upload_id) ~= "string" then
        return { success = true }
    end
    local upload_id = params.upload_id :: string

    if not is_transcribable(params.mime_type) then return { success = true } end
    if not setting_bool("asr_enabled", true) then return { success = true } end

    local max_bytes = positive_limit(deps.max_bytes or setting_int("asr_max_bytes", DEFAULT_MAX_BYTES), DEFAULT_MAX_BYTES)
    local max_transcript_bytes = positive_limit(
        deps.max_transcript_bytes or setting_int("asr_max_transcript_bytes", DEFAULT_MAX_TRANSCRIPT_BYTES),
        DEFAULT_MAX_TRANSCRIPT_BYTES
    )
    local size = tonumber(params.size) or 0
    if size > max_bytes then
        log:info("asr: audio larger than the configured cap", { upload_id = upload_id, size = size, max_bytes = max_bytes })
        return { success = true, metadata = { asr_error = "too_large" } }
    end

    local bytes, read_code, read_detail = read(params.storage_id, params.storage_path, max_bytes)
    if read_code ~= nil or bytes == nil then
        log:warn("asr: could not read the stored audio", {
            upload_id = upload_id,
            code = tostring(read_code),
            error = tostring(read_detail),
        })
        return { success = true, metadata = { asr_error = public_read_error(read_code) } }
    end

    if #(bytes :: string) > max_bytes then
        log:info("asr: stored audio larger than the configured cap", { upload_id = upload_id, bytes = #(bytes :: string), max_bytes = max_bytes })
        return { success = true, metadata = { asr_error = "too_large" } }
    end

    local text, transcribe_err, truncated = transcribe({
        audio = bytes,
        mime = tostring(params.mime_type),
        language = setting_str("asr_language", ""),
        timeout_ms = setting_int("asr_call_timeout_ms", DEFAULT_CALL_TIMEOUT_MS),
    })
    -- Record a stable public code; raw transcriber errors stay in logs only.
    if transcribe_err ~= nil then
        log:warn("asr: transcription failed", { upload_id = upload_id, error = tostring(transcribe_err) })
        return { success = true, metadata = { asr_error = "transcription_failed" } }
    end
    if type(text) ~= "string" or not (text :: string):match("%S") then
        return { success = true, metadata = { asr_error = false } }
    end

    local trimmed = ((text :: string):match("^%s*(.-)%s*$")) :: string
    if #trimmed > max_transcript_bytes then
        log:warn("asr: transcript larger than the configured cap", {
            upload_id = upload_id,
            bytes = #trimmed,
            max_transcript_bytes = max_transcript_bytes,
        })
        return { success = true, metadata = { asr_error = "transcript_too_large" } }
    end
    local ok, persist_err = persist(upload_id, params.storage_id, trimmed, transcript_metadata(params))
    if not ok then
        log:warn("asr: could not store the transcript", { upload_id = upload_id, error = tostring(persist_err) })
        return { success = true, metadata = { asr_error = "persist_failed" } }
    end

    log:info("asr transcribed audio", { upload_id = upload_id, bytes = #trimmed })
    return { success = true, metadata = { asr_bytes = #trimmed, asr_error = false, asr_truncated = truncated == true } }
end

local function process(params: any): any
    return run(params, {})
end

return { process = process, run = run, is_transcribable = is_transcribable }
