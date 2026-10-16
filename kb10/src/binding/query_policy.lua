local M = {}

-- Interactive retrieval must never inherit the provider's very large generation
-- budget or its long default timeout. These bounds cover the fixed schemas above
-- while keeping a failed analysis pass inside an interactive request budget.
M.DOCUMENT_ANALYSIS_MAX_TOKENS = 2048
M.DOCUMENT_ANALYSIS_TIMEOUT_SECONDS = 30
M.RERANK_MAX_TOKENS = 1024
M.RERANK_TIMEOUT_SECONDS = 20
M.QUERY_EMBED_TIMEOUT_SECONDS = 30

-- Query analysis is configured independently of document summarization.
-- An omitted or disabled analysis model selects raw vector retrieval.
function M.resolve_analysis_model(config: table?): string?
    local cfg = config or {}
    local configured = cfg.analysis_model
    if type(configured) ~= "string" or configured == "" then
        return nil
    end
    return configured
end

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

function M.resolve_hyde_model(config: table): (string?, any?)
    if config.query_strategy == nil or config.query_strategy == "plain" then return nil, nil end
    if config.query_strategy ~= "hyde" then
        return nil, errors.new({ kind = errors.INVALID, message = "query_strategy must be plain or hyde" })
    end
    local model = M.resolve_analysis_model(config)
    if not model then
        return nil, errors.new({ kind = errors.INVALID, message = "HyDE requires the KB analysis_model" })
    end
    return model, nil
end

function M.hyde_options(model: string): table
    return { model = model, temperature = 0.3, max_tokens = 400, timeout = 20 }
end

return M
