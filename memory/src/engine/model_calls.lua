-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local llm = require("llm")
local json = require("json")
local types = require("types")
local error_envelope = require("error_envelope")
local schema = require("model_schema")

local M = {}

local TRANSIENT_KINDS = {
    [errors.UNAVAILABLE] = true,
    [errors.TIMEOUT] = true,
    [errors.RATE_LIMITED] = true,
}

local function messages(system: string, user: string): { any }
    return {
        { role = "system", content = { { type = "text", text = system } } },
        { role = "user", content = { { type = "text", text = user } } },
    }
end

local function malformed_error(step: string): error
    return types.unavailable("memory " .. step .. " returned malformed output", { step = step, code = "model_output_malformed" })
end

function M.invalid(step: string, reason: string): error
    local code = "model_output_invalid_" .. step .. "_" .. reason
    return types.unavailable("memory " .. step .. " returned invalid output: " .. code, { step = step, code = code })
end

function M.error(step: string, err: any): error
    local message = "memory " .. step .. " failed"
    if type(err) ~= "userdata" then
        return types.internal(message, { step = step, cause = { message = tostring(err), retryable = false } })
    end
    local details = err:details() or {}
    if details.error_type == "model_error" and type(details.raw_content) == "string" then
        local _, decode_err = json.decode(details.raw_content)
        if decode_err then return malformed_error(step) end
    end
    local retryable = err:retryable() == true and TRANSIENT_KINDS[err:kind()] == true
    return errors.new({
        kind = retryable and err:kind() or errors.INTERNAL,
        retryable = retryable,
        message = message,
        details = { step = step, cause_kind = err:kind(), cause = error_envelope.encode(err) },
    })
end

function M.structured(step: string, result_schema: any, system: string, user: string, model: string): (any?, error?)
    local budget, budget_err = schema.output_budget(result_schema, model)
    if budget_err then return nil, budget_err end
    local response, call_err = llm.structured_output(result_schema, messages(system, user), { model = model, max_tokens = budget })
    if call_err then return nil, M.error(step, call_err) end
    if response and response.finish_reason == "length" then
        return nil, types.unavailable("memory " .. step .. " output is truncated", { code = "model_output_truncated", step = step })
    end
    if not response or type(response.result) ~= "table" then return nil, malformed_error(step) end
    return response.result, nil
end

function M.validate(step: string, result_schema: any, result: any): (any?, error?)
    if not schema.validate(result_schema, result) then return nil, malformed_error(step) end
    return result, nil
end

function M.embed(model: string, texts: { string }): (any?, error?)
    local response, err = llm.embed(texts, { model = model, dimensions = types.EMBEDDING_DIMENSIONS })
    if err then return nil, M.error("embedding", err) end
    local vectors = response and response.result
    if type(vectors) ~= "table" or #vectors ~= #texts then
        return nil, types.unavailable("memory embedding returned " .. tostring(type(vectors) == "table" and #vectors or 0) ..
            " vectors for " .. tostring(#texts) .. " texts")
    end
    for _, vector in ipairs(vectors) do
        if type(vector) ~= "table" or #vector ~= types.EMBEDDING_DIMENSIONS then
            return nil, types.unavailable("memory embedding returned a vector that is not " .. types.EMBEDDING_DIMENSIONS .. "-dimensional")
        end
    end
    return vectors, nil
end

function M.summary(model: string, system: string, text: string, max_tokens: integer): (string?, any?, error?)
    local response, err = llm.generate(messages(system, text), { model = model, max_tokens = max_tokens })
    if err then return nil, nil, M.error("working summary", err) end
    if not response or response.finish_reason ~= "stop" or type(response.result) ~= "string" or types.trim(response.result) == "" then
        return nil, nil, types.unavailable("working summary did not complete")
    end
    return types.trim(response.result), response.tokens, nil
end

return M
