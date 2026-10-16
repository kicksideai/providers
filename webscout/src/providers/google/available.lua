local config = require("config")

-- Google needs both the API key and the engine id; either one missing means the
-- provider cannot serve a query.

type JsonMap = { [string]: unknown }

local M = {}

-- The config reader arrives on a seam, as it does in the Brave provider: this
-- gate is the only thing standing between "configured" and a search that cannot
-- run, and Google Custom Search cannot be exercised live -- the JSON API has
-- been closed to new clients since January 2026 -- so a scripted reader is the
-- only way to hold it to its own rule.
function M.available(_value: unknown, injected_config: any?): JsonMap
    local cfg: any = injected_config or config
    return {
        available = cfg.get("google_search_api_key") ~= nil
            and cfg.get("google_search_engine_id") ~= nil,
    }
end

return M
