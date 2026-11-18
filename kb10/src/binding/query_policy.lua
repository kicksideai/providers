local M = {}

-- Interactive retrieval must never inherit the provider's very large generation
-- budget or its long default timeout. These bounds cover the fixed schemas above
-- while keeping a failed analysis pass inside an interactive request budget.
M.DOCUMENT_ANALYSIS_MAX_TOKENS = 2048
M.DOCUMENT_ANALYSIS_TIMEOUT_SECONDS = 30
M.RERANK_MAX_TOKENS = 1024
M.RERANK_TIMEOUT_SECONDS = 20
M.QUERY_EMBED_TIMEOUT_SECONDS = 30

function M.document_analysis_options(model: string): table
    return {
        model = model,
        temperature = 0.3,
        max_tokens = M.DOCUMENT_ANALYSIS_MAX_TOKENS,
        timeout = M.DOCUMENT_ANALYSIS_TIMEOUT_SECONDS
    }
end

function M.rerank_options(model: string): table
    return {
        model = model,
        temperature = 0,
        max_tokens = M.RERANK_MAX_TOKENS,
        timeout = M.RERANK_TIMEOUT_SECONDS
    }
end

function M.query_embed_options(model: string?, dimensions: number): table
    return {
        model = model,
        dimensions = dimensions,
        timeout = M.QUERY_EMBED_TIMEOUT_SECONDS
    }
end

function M.query_strategy(config: table): (string?, any?)
    local strategy = config.query_strategy
    if strategy == nil then return "plain", nil end
    if strategy ~= "plain" and strategy ~= "hyde" then
        return nil, errors.new({ kind = errors.INVALID, message = "query_strategy must be plain or hyde" })
    end
    return strategy, nil
end

function M.hyde_options(model: string): table
    return { model = model, temperature = 0.3, max_tokens = 400, timeout = 20 }
end

return M
