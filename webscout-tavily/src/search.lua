local http_client = require("http_client")
local json = require("json")
local client = require("client")
local config = require("config")

-- Tavily web search behind the WebScout search provider protocol. The dispatcher
-- hands over the tool's arguments as they are; normalizing Tavily's answer into
-- the shared result shape is this function's job.

local SETTINGS_NS = "kickside.webscout.providers.tavily"
local ENDPOINT = "https://api.tavily.com/search"

type JsonMap = { [string]: unknown }

-- What the dispatcher hands every provider: the query, the number of results
-- (already held to this provider's ceiling), the zero-based offset of the first
-- result, and the transport values, which are absent unless a caller owns them —
-- the client then applies the host's own.
type SearchArgs = {
    query: string,
    num: number,
    offset: number,
    max_response_body: number?,
    timeout: number?,
    user_agent: string?,
}

type Deps = { config: any, client: any }

local M = {}

-- error_detail reads Tavily's error body: {"detail":{"error":…}}, or for 422 a
-- list of validation failures [{msg, …}].
local function error_detail(body: unknown): string?
    if type(body) ~= "string" or body == "" then return nil end
    local data: any = json.decode(body :: string)
    if type(data) ~= "table" or type(data.detail) ~= "table" then return nil end
    local text = data.detail.error
    if type(text) ~= "string" and type(data.detail[1]) == "table" then
        text = data.detail[1].msg
    end
    if type(text) ~= "string" or text == "" then return nil end
    return text :: string
end

local function api_error(status: number, body: unknown): string
    local detail = error_detail(body)
    -- 432 is the plan's credit limit — on the free tier, the month's credits are gone.
    local message = status == 432
        and "Tavily monthly credit limit reached (432)"
        or "Search API error: " .. status
    if detail then return message .. ": " .. detail end
    return message
end

local function normalize(item: any): JsonMap?
    local link = item.url
    if type(link) ~= "string" then return nil end
    -- A row without an http(s) URL and a host is no link a person can follow.
    local host = link:match("^https?://([^/%?#]+)")
    if not host then return nil end
    local title = type(item.title) == "string" and item.title ~= "" and item.title or host
    local snippet = type(item.content) == "string" and item.content or ""
    return {
        title = title,
        link = link,
        snippet = snippet,
        displayLink = host,
    }
end

function M.search(args: SearchArgs, deps: Deps?): (JsonMap?, string?)
    local d: any = deps or {}
    local cfg = d.config or config
    local transport = d.client or client

    local api_key = cfg.get("api_key", SETTINGS_NS)
    if not api_key then
        return nil, "Tavily API key not configured"
    end
    -- Tavily answers one ranked page per query and offers no continuation.
    if args.offset ~= 0 then
        return nil, "Tavily returns a single page of results and cannot continue from offset " .. tostring(args.offset)
    end

    local headers: {[string]: string} = {
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
        ["Authorization"] = "Bearer " .. api_key,
    }
    if type(args.user_agent) == "string" and args.user_agent ~= "" then
        headers["User-Agent"] = args.user_agent :: string
    end

    -- basic is stated outright: it costs one credit, advanced two, and the
    -- default is Tavily's to change. Everything else stays at Tavily's defaults.
    local body = json.encode({
        query = args.query,
        max_results = args.num,
        search_depth = "basic",
    })

    local options: http_client.RequestOptions = { headers = headers, body = body }
    if type(args.max_response_body) == "number" then
        options.max_response_body = args.max_response_body :: number
    end
    if type(args.timeout) == "number" then
        options.timeout = args.timeout :: number
    end
    local response, err = transport.post(ENDPOINT, options)
    if err then
        return nil, "Search request failed: " .. err
    end
    if type(response) ~= "table" then
        return nil, "Search request failed: invalid response"
    end
    if response.status_code ~= 200 then
        return nil, api_error(response.status_code, response.body)
    end
    if type(response.body or "") ~= "string" then
        return nil, "Search response body is not text"
    end

    local data, decode_err = json.decode(response.body or "")
    if not data then
        return nil, "Failed to parse search results: " .. tostring(decode_err)
    end

    local results = {}
    local items: any = data.results
    for _, item in ipairs(type(items) == "table" and items or {}) do
        local result = normalize(item)
        if result then table.insert(results, result) end
    end

    -- Tavily reports no corpus-wide estimate, so the count returned is all this
    -- provider can honestly say.
    return {
        query = args.query,
        total_results = #results,
        results = results,
        count = #results,
        has_more = false,
    }
end

return M
