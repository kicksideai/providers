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
    local declared = type(metadata) == "table" and metadata.ocr or nil
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

local function new(runtime: any): any
    local deps = runtime or {}
    local llm = deps.llm or require("llm")
    local prompt = deps.prompt or require("prompt")
    local base64 = deps.base64 or require("base64")

    -- transcribe(image_bytes, opts) -> (text, err). opts = { model, mime?, prompt?,
    -- max_tokens?, timeout? }; opts.prompt and opts.max_tokens take precedence over
    -- the model card's OCR profile. Returns "" for a page with no readable text.
    local function transcribe(image_bytes: any, opts: any): (string?, string?)
        opts = type(opts) == "table" and opts or {}
        if type(image_bytes) ~= "string" or image_bytes == "" then
            return nil, "ocr: image bytes required"
        end
        local model = opts.model
        if type(model) ~= "string" or model == "" then
            return nil, "ocr: model required"
        end

        local mime = type(opts.mime) == "string" and opts.mime ~= "" and opts.mime or "image/png"
        local encoded, enc_err = base64.encode(image_bytes)
        if enc_err or type(encoded) ~= "string" or encoded == "" then
            return nil, "ocr: failed to encode image"
        end

        local card, resolve_err = llm.resolve_model(model)
        if not card then
            return nil, "ocr: resolve model failed: " .. tostring(resolve_err)
        end
        local profile, profile_err = request_profile(card)
        if not profile then
            return nil, "ocr: model " .. model .. ": " .. tostring(profile_err)
        end

        local instruction = prompt.text(type(opts.prompt) == "string" and opts.prompt ~= "" and opts.prompt
            or profile.prompt or DEFAULT_USER)
        local image = prompt.image_base64(mime, encoded)
        local p = prompt.new()
        if profile.system then
            p:add_system(profile.system)
        end
        p:add_message(prompt.ROLE.USER, profile.image_first and { image, instruction } or { instruction, image })

        local timeout_ms = clamp_timeout_ms(opts.timeout, PROVIDER_TIMEOUT_CAP_MS)
        local response, gen_err = llm.generate(p, {
            model = model,
            temperature = 0,
            max_tokens = tonumber(opts.max_tokens) or profile.output_limit or DEFAULT_MAX_TOKENS,
            timeout = timeout_ms and math.ceil(timeout_ms / 1000) or nil,
        })
        if gen_err or not response then
            return nil, "ocr: generate failed: " .. tostring(gen_err)
        end
        -- A generation cut at max_tokens is an incomplete transcription of the page.
        if (response :: any).finish_reason == llm.FINISH_REASON.LENGTH then
            return nil, "ocr: generation stopped at the token limit"
        end

        local out = (response :: any).result
        if type(out) ~= "string" then
            return nil, "ocr: unexpected model result"
        end
        if (out :: string):match("^%s*(.-)%s*$") == NO_TEXT_REPLY then
            return "", nil
        end
        return out, nil
    end

    return { transcribe = transcribe }
end

return {
    new = new,
    system_prompt = OCR_SYSTEM,
    NO_TEXT_REPLY = NO_TEXT_REPLY,
    clamp_timeout_ms = clamp_timeout_ms,
    to_ms = to_ms,
    PROVIDER_TIMEOUT_CAP_MS = PROVIDER_TIMEOUT_CAP_MS,
}
