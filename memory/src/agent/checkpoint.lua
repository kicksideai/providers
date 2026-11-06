-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local types = require("types")
local context = require("agent_context")
local history = require("agent_history")
local capture = require("agent_capture")
local models = require("memory_models")

local M = {}

local CHECKPOINT_SOURCE_MAX_CHARS = 12000

function M.create(payload: any): (any?, error?)
    local invalid = context.validate(payload)
    if invalid then return nil, invalid end
    local options = type(payload.options) == "table" and payload.options or {}
    local model = types.trim(options.model)
    if model == "" then return nil, types.invalid("checkpoint options require a model") end
    local max_tokens = options.max_tokens
    if type(max_tokens) ~= "number" or max_tokens < 1 or math.floor(max_tokens) ~= max_tokens then
        return nil, types.invalid("checkpoint options require a positive integer max_tokens")
    end
    local inst, err = history.open(payload.run_context)
    if err then return nil, err end
    local selector = type(payload.selector) == "table" and payload.selector or { mode = "since_checkpoint" }
    selector.max_chars = selector.max_chars or CHECKPOINT_SOURCE_MAX_CHARS
    local prompt, prompt_err = (inst :: any):get_prompt({
        host = payload.run_context.host or payload.host,
        agent = payload.run_context.agent or payload.agent,
        selector = selector,
        format = "text",
    })
    if prompt_err then return nil, types.failed("checkpoint source failed", prompt_err) end
    local text = types.trim((prompt :: any).text)
    local summary, tokens = "No working conversation state.", nil
    if text ~= "" then
        local generated, used, summary_err = models.working_summary(model, text, math.floor(max_tokens))
        if summary_err then return nil, summary_err end
        summary, tokens = generated :: string, used
    end
    local range = (prompt :: any).range or {}
    local captured, capture_err = capture.capture(payload, types.trim(range.to_id) ~= "" and range.to_id or nil)
    if capture_err then return nil, capture_err end
    return { summary = summary, tokens = tokens, metadata = { source = types.SOURCE, capture = captured } }, nil
end

return M
