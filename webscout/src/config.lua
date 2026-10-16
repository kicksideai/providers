local contract = require("contract")

-- Single source for webscout configuration: the admin-editable settings
-- (kickside.settings:settings contract), encrypted at rest and set in the
-- Settings UI. There is no env fallback -- the settings store is canonical.
-- The settings service resolves values under its own identity, so opening the
-- contract as the caller is enough. Best-effort: an unset value or any error
-- resolves to nil so callers report a clear "not configured".
local M = {}

local NS = "kickside.webscout"
local CONTRACT_ID = "kickside.settings:settings"

-- get resolves a config value from the settings contract; nil when unset.
-- A provider module reads its own settings by passing the namespace its
-- descriptor declares as settings_ns, so it needs no reader of its own.
function M.get(key: string, namespace: string?): string?
    local def, def_err = contract.get(CONTRACT_ID)
    if def_err or not def then return nil end
    local inst, open_err = (def :: any):open()
    if open_err or not inst then return nil end
    local r, get_err = inst:get({ namespace = namespace or NS, key = key })
    if get_err then return nil end
    if r and r.success and type(r.value) == "string" and r.value ~= "" then
        return r.value :: string
    end
    return nil
end

return M
