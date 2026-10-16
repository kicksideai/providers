local config = require("config")

-- Tavily needs one credential; the search provider descriptor's available_func
-- asks whether it is set.

local SETTINGS_NS = "kickside.webscout.providers.tavily"

type JsonMap = { [string]: unknown }

local M = {}

function M.available(_value: unknown, injected_config: any?): JsonMap
    local cfg: any = injected_config or config
    return { available = cfg.get("api_key", SETTINGS_NS) ~= nil }
end

return M
