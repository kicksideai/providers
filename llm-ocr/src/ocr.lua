-- LLM-based OCR. Transcribes the literal text of a page image via a vision model.
-- Dependencies are injectable (new(runtime)) so the transcription seam can be tested
-- without a live model, mirroring the converter libraries' new(runtime) shape.

local OCR_SYSTEM = "You are an OCR engine. Transcribe ALL text visible in the image " ..
    "exactly as it appears, preserving reading order and structure (headings, tables, " ..
    "labels, lists). Output only the transcribed text as Markdown -- no commentary, no " ..
    "description of the image. If the image contains no readable text, return an empty text field."

local TRANSCRIPT_SCHEMA = {
    type = "object",
    additionalProperties = false,
    required = { "text" },
    properties = {
        text = {
            type = "string",
            description = "Only readable text transcribed from the image as Markdown. Empty when the image has no readable text. Never include commentary or a description of the image.",
        },
    },
}

local DEFAULT_USER = "Transcribe the text in this page."
local DEFAULT_MAX_TOKENS = 4000
-- A dense page is slow, so OCR's per-call budget is larger than a chat call, but
-- always bounded: a hung inference returns a timeout error instead of pinning the
-- job. Values are milliseconds; the cap is the hard provider ceiling.
local DEFAULT_TIMEOUT_MS = 120000
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

-- Bound the requested per-call timeout to a positive value under the provider cap.
local function clamp_timeout_ms(requested_ms: any, cap_ms: integer): integer
    local ms = to_ms(requested_ms) or DEFAULT_TIMEOUT_MS
    if ms < 1000 then ms = 1000 end
    if ms > cap_ms then ms = cap_ms end
    return ms
end

local function new(runtime: any): any
    local deps = runtime or {}
    local llm = deps.llm or require("llm")
    local prompt = deps.prompt or require("prompt")
    local base64 = deps.base64 or require("base64")

    -- transcribe(image_bytes, opts) -> (text, err). opts = { model, mime?, prompt?,
    -- max_tokens?, timeout? }. Returns "" for a page with no readable text.
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

        local p = prompt.new()
        p:add_system(OCR_SYSTEM)
        p:add_message(prompt.ROLE.USER, {
            prompt.text(type(opts.prompt) == "string" and opts.prompt ~= "" and opts.prompt or DEFAULT_USER),
            prompt.image_base64(mime, encoded),
        })

        -- The call carries a bounded timeout (seconds) clamped under the provider
        -- cap, so a hung inference fails fast rather than holding the job open.
        local timeout_ms = clamp_timeout_ms(opts.timeout, PROVIDER_TIMEOUT_CAP_MS)
        local response, gen_err = llm.structured_output(TRANSCRIPT_SCHEMA, p, {
            model = model,
            temperature = 0,
            max_tokens = tonumber(opts.max_tokens) or DEFAULT_MAX_TOKENS,
            timeout = math.ceil(timeout_ms / 1000),
        })
        if gen_err or not response then
            return nil, "ocr: generate failed: " .. tostring(gen_err)
        end

        local out = (response :: any).result
        if type(out) ~= "table" or type(out.text) ~= "string" then
            return nil, "ocr: unexpected model result"
        end
        return out.text, nil
    end

    return { transcribe = transcribe }
end

return {
    new = new,
    system_prompt = OCR_SYSTEM,
    clamp_timeout_ms = clamp_timeout_ms,
    to_ms = to_ms,
    PROVIDER_TIMEOUT_CAP_MS = PROVIDER_TIMEOUT_CAP_MS,
}
