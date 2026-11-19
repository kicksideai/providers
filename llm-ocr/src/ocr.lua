local trim = require("text_trim").trim
-- LLM-based OCR. Transcribes the literal text of a page image via a vision model.
-- Dependencies are injectable (new(runtime)) so the transcription seam can be tested
-- without a live model, mirroring the converter libraries' new(runtime) shape.

-- The reply for a page without readable text. The model states the empty page with
-- this exact reply, so a description of the image is never the only way to say it.
local NO_TEXT_REPLY = "[[NO_TEXT]]"

local OCR_SYSTEM = "You are an OCR engine. Transcribe ALL text visible in the image " ..
    "exactly as it appears, preserving reading order and structure (headings, tables, " ..
    "labels, lists). Output only the transcribed text as Markdown -- no commentary, no " ..
    "description of the image. If the image contains no readable text, output exactly " ..
    NO_TEXT_REPLY .. " and nothing else."

local DEFAULT_USER = "Transcribe the text in this page."
local DEFAULT_MAX_TOKENS = 4000
-- The bytes of a length-cut generation kept in its error, enough to read a
-- repetition loop at the end of the output.
local LENGTH_TAIL_BYTES = 2048
-- A call's latency on a shared provider is admission wait plus generation, and
-- a non-streamed request cannot tell them apart. Without an explicit timeout the
-- model provider's configured request timeout governs the call; an explicit
-- value (milliseconds) is bounded under the hard provider ceiling.
local PROVIDER_TIMEOUT_CAP_MS = 600000

-- Coerce a timeout into milliseconds. Accepts a number of milliseconds or a
-- duration string ("90s", "120000ms", "2m"); returns nil when unparseable.
local function to_ms(value: any): integer?
    if type(value) == "number" then
        return math.floor(value) :: integer
    end
    if type(value) ~= "string" or value == "" then
        return nil
    end
    local num, unit = (value :: string):match("^%s*(%d+%.?%d*)%s*(%a*)%s*$")
    local n = tonumber(num)
    if not n then return nil end
    if unit == "ms" then return math.floor(n) :: integer end
    if unit == "s" or unit == "" then return math.floor(n * 1000) :: integer end
    if unit == "m" then return math.floor(n * 60000) :: integer end
    return nil
end

-- Bound an explicitly requested per-call timeout under the provider cap. Returns
-- nil when no positive timeout is requested, leaving the provider's timeout.
local function clamp_timeout_ms(requested_ms: any, cap_ms: integer): integer?
    local ms = to_ms(requested_ms)
    if ms == nil or ms <= 0 then return nil end
    if ms < 1000 then ms = 1000 end
    if ms > cap_ms then ms = cap_ms end
    return ms
end

-- A model card may declare the request shape its model expects for OCR in
-- metadata.ocr. Every field is optional and an absent field keeps the default:
--   system       false sends no system message; a string replaces OCR_SYSTEM
--   prompt       the instruction text sent with the image
--   image_first  true places the image before the instruction text
--   output_limit the generation's max_tokens
local function request_profile(card: any): (table?, string?)
    local metadata = type(card) == "table" and card.metadata or nil
    local declared = nil
    if type(metadata) == "table" then declared = metadata.ocr end
    if declared == nil then
        return {system = OCR_SYSTEM, image_first = false}, nil
    end
    if type(declared) ~= "table" then
        return nil, "ocr profile must be an object"
    end
    local system = declared.system
    if system == nil then
        system = OCR_SYSTEM
    elseif system == false then
        system = nil
    elseif type(system) ~= "string" or system == "" then
        return nil, "ocr profile system must be false or non-empty text"
    end
    local prompt = declared.prompt
    if prompt ~= nil and (type(prompt) ~= "string" or prompt == "") then
        return nil, "ocr profile prompt must be non-empty text"
    end
    local image_first = declared.image_first
    if image_first ~= nil and type(image_first) ~= "boolean" then
        return nil, "ocr profile image_first must be a boolean"
    end
    local output_limit = declared.output_limit
    if output_limit ~= nil and (type(output_limit) ~= "number" or output_limit < 1
        or output_limit ~= math.floor(output_limit)) then
        return nil, "ocr profile output_limit must be a positive integer"
    end
    return {system = system, prompt = prompt, image_first = image_first == true, output_limit = output_limit}, nil
end

-- The last `limit` bytes of text, starting on a UTF-8 character boundary.
local function utf8_tail(text: string, limit: integer): string
    local start = math.max(1, #text - limit + 1)
    while start <= #text do
        local byte = text:byte(start)
        if byte < 0x80 or byte >= 0xC0 then break end
        start = start + 1
    end
    return text:sub(start)
end

local function new(runtime: any): any
    local deps = runtime or {}
    local llm = deps.llm or require("llm")
    local prompt = deps.prompt or require("prompt")
    local base64 = deps.base64 or require("base64")

    -- Prepare the document's invariant request fields before any page work.
    local function prepare(opts: any): (any?, string?)
        opts = type(opts) == "table" and opts or {}
        local model = opts.model
        if type(model) ~= "string" or model == "" then
            return nil, "ocr: model required"
        end

        local configured_prompt = type(opts.prompt) == "string" and opts.prompt ~= "" and opts.prompt or nil
        local configured_limit = tonumber(opts.max_tokens)
        local timeout_ms = clamp_timeout_ms(opts.timeout, PROVIDER_TIMEOUT_CAP_MS)
        local timeout = timeout_ms and math.ceil(timeout_ms / 1000) or nil
        local profiles = {}
        local function prepared_profile(card: table): (table?, string?)
            local name = card.name
            local cached = profiles[name]
            if cached then return cached.profile, cached.err end
            local profile, err = request_profile(card)
            if profile then
                profile.instruction = prompt.text(configured_prompt or profile.prompt or DEFAULT_USER)
                profile.max_tokens = configured_limit or profile.output_limit or DEFAULT_MAX_TOKENS
            else
                err = "ocr: model " .. tostring(name) .. ": " .. tostring(err)
            end
            profiles[name] = {profile = profile, err = err}
            return profile, err
        end
        return function(image_bytes: any, page: any): (string?, string | error | nil)
            if type(image_bytes) ~= "string" or image_bytes == "" then
                return nil, "ocr: image bytes required"
            end
            local mime = type(page) == "table" and page.mime or opts.mime
            if type(mime) ~= "string" or mime == "" then mime = "image/png" end
            local encoded, enc_err = base64.encode(image_bytes)
            if enc_err or type(encoded) ~= "string" or encoded == "" then
                return nil, "ocr: failed to encode image"
            end
            local image = prompt.image_base64(mime, encoded)
            local function prepare_request(context: table): (table?, string?)
                local profile, err = prepared_profile(context.model)
                if not profile then return nil, err end
                local p = prompt.new()
                if profile.system then p:add_system(profile.system) end
                local instruction = profile.instruction
                p:add_message(prompt.ROLE.USER, profile.image_first and {image, instruction} or {instruction, image})
                return {messages = p, max_tokens = profile.max_tokens}, nil
            end
            local response, gen_err = llm.generate({messages = {}}, {
                model = model,
                temperature = 0,
                max_tokens = configured_limit or DEFAULT_MAX_TOKENS,
                timeout = timeout,
                prepare_request = prepare_request,
            })
            if gen_err then
                return nil, errors.new({kind = gen_err:kind(), retryable = gen_err:retryable(), details = gen_err:details(),
                    message = "ocr: generate failed: " .. gen_err:message()})
            end
            if not response then return nil, "ocr: generate failed: no response" end
            local out = (response :: any).result
            -- A generation cut at max_tokens is an incomplete transcription of the page.
            if (response :: any).finish_reason == llm.FINISH_REASON.LENGTH then
                local cut = type(out) == "string" and out or ""
                return nil, errors.new({kind = errors.INTERNAL, retryable = false,
                    message = "ocr: generation stopped at the token limit after " .. #cut .. " bytes",
                    details = {output_bytes = #cut, output_tail = utf8_tail(cut, LENGTH_TAIL_BYTES)}})
            end
            if type(out) ~= "string" then
                return nil, "ocr: unexpected model result"
            end
            if trim(out) == NO_TEXT_REPLY then
                return "", nil
            end
            return out, nil
        end, nil
    end

    -- Single-page callers retain the original API and option precedence.
    local function transcribe(image_bytes: any, opts: any): (string?, string | error | nil)
        local prepared, err = prepare(opts)
        if not prepared then return nil, err end
        return prepared(image_bytes, opts)
    end

    return { transcribe = transcribe, prepare = prepare }
end

return {
    new = new,
    system_prompt = OCR_SYSTEM,
    NO_TEXT_REPLY = NO_TEXT_REPLY,
    LENGTH_TAIL_BYTES = LENGTH_TAIL_BYTES,
    clamp_timeout_ms = clamp_timeout_ms,
    to_ms = to_ms,
    PROVIDER_TIMEOUT_CAP_MS = PROVIDER_TIMEOUT_CAP_MS,
}
