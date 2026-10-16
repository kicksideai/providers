local funcs = require("funcs")
local config = require("config")
local providers = require("providers")
local tool_result = require("tool_result")

-- The search tool is a dispatcher: it validates the tool's own arguments,
-- resolves the provider declared by the search_provider setting, and hands the
-- arguments to that provider's search function unchanged. It knows no provider
-- by name, and every message it writes about providers is built from the
-- installed descriptors.

type JsonMap = { [string]: unknown }
type Deps = { config: any, providers: any, call: any }

local SETTING_KEY = "search_provider"

local function is_available(call: any, provider: any): (boolean, error?)
    local result, err = call(provider.available_func, {})
    if err then return false, errors.wrap(err, "Search provider availability check failed") end
    return type(result) == "table" and (result :: JsonMap).available == true, nil
end

-- A provider that is installed but unconfigured is a configuration error with a
-- name on it, not a reason to quietly try someone else.
local function not_configured(registry: any, provider: any): string
    local message = "Search provider " .. provider.label .. " (" .. provider.id .. ") is not configured"
    local installed = registry.list()
    local others: {any} = {}
    for _, p in ipairs(installed or {}) do
        if p.id ~= provider.id then others[#others + 1] = p end
    end
    if #others == 0 then return message end
    return message .. "; other installed providers: " .. registry.describe(others)
end

local function handle(args: any, deps: Deps?): (JsonMap?, error?)
    args = args or {}

    if not args.query or args.query == "" then
        return tool_result.fail(errors.INVALID, "Query parameter is required and cannot be empty")
    end
    if type(args.query) ~= "string" then
        return tool_result.fail(errors.INVALID, "Query parameter must be a string")
    end
    if #args.query > 2000 then
        return tool_result.fail(errors.INVALID, "Query parameter is too long")
    end

    local d: any = deps or {}
    local cfg = d.config or config
    local registry = d.providers or providers
    local call: any = d.call or funcs.call

    local provider, select_err = registry.selected(cfg.get(SETTING_KEY))
    if not provider then return nil, select_err end

    -- Readiness is checked where the credential check used to be, so the same
    -- argument mistakes still surface in the same order as before.
    local available, check_err = is_available(call, provider)
    if check_err then return nil, check_err end
    if not available then return tool_result.fail(errors.UNAVAILABLE, not_configured(registry, provider)) end

    -- num is how many results this call returns; a provider answers at most its
    -- own max_results per request, so the tool pages the provider from the
    -- cursor's offset until num results are in or the provider has no more.
    -- next_cursor continues where this call stops.
    local num = args.num
    if num == nil then num = provider.max_results end
    if type(num) ~= "number" or num < 1 or num ~= math.floor(num) then
        return tool_result.fail(errors.INVALID, "num must be a positive integer")
    end
    local offset = 0
    if args.cursor ~= nil then
        local parsed = type(args.cursor) == "string" and tonumber(args.cursor) or nil
        if not parsed or parsed < 0 or parsed ~= math.floor(parsed) then
            return tool_result.fail(errors.INVALID, "cursor must be a next_cursor value from a previous WebSearch result")
        end
        offset = parsed :: number
    end

    local results: {any} = {}
    local total_results: unknown = 0
    local has_more = false
    while #results < num do
        local page, search_err = call(provider.search_func, {
            query = args.query,
            num = math.min(num - #results, provider.max_results),
            offset = offset,
            max_response_body = args.max_response_body,
            timeout = args.timeout,
            user_agent = args.user_agent,
        })
        if search_err then return nil, search_err end
        if tool_result.is_domain_error(page) then return page, nil end
        if type(page) ~= "table" or type((page :: JsonMap).results) ~= "table" then
            return tool_result.fail(errors.INTERNAL, "Search request failed: invalid response")
        end
        local p = page :: JsonMap
        if #results == 0 then total_results = p.total_results end
        local rows = p.results :: {any}
        for _, row in ipairs(rows) do results[#results + 1] = row end
        offset = offset + #rows
        has_more = p.has_more == true and #rows > 0
        if not has_more then break end
    end

    return {
        query = args.query,
        total_results = total_results,
        results = results,
        count = #results,
        next_cursor = has_more and tostring(offset) or nil,
    }, nil
end

return { handle = handle }
