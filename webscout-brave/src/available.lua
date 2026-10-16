local config = require("config")

-- Brave needs one credential. The same answer serves both seams that ask it:
-- the search provider descriptor's available_func and the Research Source's
-- availability_ref.

local SETTINGS_NS = "kickside.webscout.providers.brave"

type JsonMap = { [string]: unknown }

local M = {}

function M.available(_value: unknown, injected_config: any?): JsonMap
    local cfg: any = injected_config or config
    return { available = cfg.get("api_key", SETTINGS_NS) ~= nil }
end

return M
