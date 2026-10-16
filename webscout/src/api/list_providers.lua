local http = require("http")
local funcs = require("funcs")
local config = require("config")
local providers = require("providers")

-- The installed search providers, for the settings card's picker. Read only,
-- and it carries nothing secret: each provider's credentials stay in its own
-- namespace and only the yes/no answer of its availability gate comes out.

local SETTING_KEY = "search_provider"

type JsonMap = { [string]: unknown }
type Deps = { config: any, providers: any, call: any }

local M = {}

-- build returns the payload the card renders. Availability is asked of each
-- descriptor's own gate, so the card never guesses from which keys are filled.
function M.build(deps: Deps?): (JsonMap?, error?)
    local d: any = deps or {}
    local cfg = d.config or config
    local registry = d.providers or providers
    local call: any = d.call or funcs.call

    local installed, err = registry.list()
    if err then return nil, err end
    if not installed then return nil, errors.new({ kind = errors.INTERNAL, message = "search provider list returned no providers" }) end

    local rows: {any} = {}
    for _, p in ipairs(installed) do
        local ready, ready_err = call(p.available_func, {})
        rows[#rows + 1] = {
            id = p.id,
            label = p.label,
            icon = p.icon,
            description = p.description,
            -- A gate that fails to answer is reported as not configured rather
            -- than as an outage: the card's job is to show what can serve.
            configured = (not ready_err) and type(ready) == "table"
                and (ready :: JsonMap).available == true,
            is_default = p.is_default,
        }
    end

    -- Two different facts, and the card needs both. `stored` is what the setting
    -- holds; `selected` is who would actually answer a search, resolved the same
    -- way the search tool resolves it. They differ when the saved choice names a
    -- provider that is not installed — the operator has to be told that, or the
    -- fallback looks like their own setting.
    local stored = cfg.get(SETTING_KEY)
    local selected = registry.selected(stored)
    return {
        success = true,
        providers = rows,
        stored = stored,
        selected = selected and selected.id or nil,
    }, nil
end

function M.handler()
    local res = http.response()
    if not res then return nil, "failed to get http context" end
    res:set_content_type(http.CONTENT.JSON)

    local payload, err = M.build()
    if not payload then
        res:set_status(http.STATUS.INTERNAL_SERVER_ERROR)
        res:write_json({ success = false, error = tostring(err), details = err and err:details() or nil })
        return
    end
    res:write_json(payload)
end

return M
