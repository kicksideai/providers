-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

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

local function failed(failure: string, kind: string?, retryable: boolean?): error
    local failure_kind = kind or errors.UNAVAILABLE
    local transient = failure_kind == errors.UNAVAILABLE or failure_kind == errors.TIMEOUT or failure_kind == errors.RATE_LIMITED
    return errors.new({ kind = failure_kind, retryable = retryable ~= nil and retryable or transient, message = failure })
end

local function structured_output(args: any): (any, any)
    script.record("structured_output", args.schema, args.messages)
    local hold_err = script.await_release("structured_output")
    if hold_err then return nil, errors.new({ kind = errors.INTERNAL, retryable = false, message = hold_err }) end
    local response, failure, kind, retryable = script.take("structured_output")
    if failure then return nil, failed(failure, kind, retryable) end
    return { success = true, result = { data = response }, tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 }, finish_reason = "stop" }
end

local function generate(args: any): (any, any)
    script.record("generate", args, args.messages)
    local response, failure, kind, retryable = script.take("generate")
    if failure then return nil, failed(failure, kind, retryable) end
    return { success = true, result = { content = tostring(response) }, tokens = { prompt_tokens = 1, completion_tokens = 1, total_tokens = 2 }, finish_reason = "stop" }
end

return { embed = embed, structured_output = structured_output, generate = generate }
