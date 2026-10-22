-- Deterministic provider: hashed bag-of-words vectors, scripted structured
-- output and generation.

local hash = require("hash")
local script = require("script")

local DIMENSIONS = 512

local function vector(text: string): { number }
    local v: { number } = {}
    for i = 1, DIMENSIONS do v[i] = 0 end
    for token in text:lower():gmatch("[%w]+") do
        local digest = hash.sha256(token)
        local slot = (tonumber(digest:sub(1, 6), 16) or 0) % DIMENSIONS + 1
        v[slot] = v[slot] + 1
    end
    local norm = 0
    for i = 1, DIMENSIONS do norm = norm + v[i] * v[i] end
    if norm == 0 then v[1] = 1; norm = 1 end
    norm = math.sqrt(norm)
    for i = 1, DIMENSIONS do v[i] = v[i] / norm end
    return v
end

local function embed(args: any): (any, any)
    local input = args.input
    if type(input) == "string" then input = { input } end
    local out = {}
    for i, text in ipairs(input) do out[i] = vector(tostring(text)) end
    return { success = true, result = { embeddings = out }, tokens = { prompt_tokens = 1, total_tokens = 1 } }
end

local function structured_output(_args: any): (any, any)
    local response, failure = script.take("structured_output")
    if failure then return nil, failure end
    return { success = true, result = { data = response }, tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 }, finish_reason = "stop" }
end

local function generate(_args: any): (any, any)
    local response, failure = script.take("generate")
    if failure then return nil, failure end
    return { success = true, result = { content = tostring(response) }, tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 }, finish_reason = "stop" }
end

return { embed = embed, structured_output = structured_output, generate = generate }
