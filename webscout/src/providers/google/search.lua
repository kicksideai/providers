local endpoints = require("endpoints")
local json = require("json")
local client = require("client")
local http_client = require("http_client")
local config = require("config")
local tool_result = require("tool_result")

-- Google Custom Search behind the search provider protocol. Normalizing the
-- response into the shared result shape is the provider's job, which is why the
-- dispatcher never has to know who answered.

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

-- The config reader and the transport arrive on a seam, the same one the Brave
-- provider carries. Without it nothing here is provable: Google Custom Search
-- is closed to new clients, so no test and no operator can reach the real
-- endpoint, and a scripted client is the only way to see what this function
-- builds and how it reads an answer.
type Deps = {
    config: any?,
    client: any?,
}

local M = {}

-- Only what the caller actually owns travels; the client fills the rest from the
-- deployment.
local function caller_headers(args: SearchArgs): {[string]: string}?
    if type(args.user_agent) == "string" and args.user_agent ~= "" then
        return { ["User-Agent"] = args.user_agent :: string }
    end
    return nil
end

function M.search(args: SearchArgs, deps: Deps?): (JsonMap?, string?)
    local d: any = deps or {}
    local cfg: any = d.config or config
    local transport: any = d.client or client

    local api_key = cfg.get("google_search_api_key")
    if not api_key then
        return nil, "Google Search API key not configured"
    end

    local engine_id = cfg.get("google_search_engine_id")
    if not engine_id then
        return nil, "Google Search Engine ID not configured"
    end

    local url = endpoints.get("kickside.webscout.providers.google:provider", "api")
    local query_params = "?key=" .. api_key ..
        "&cx=" .. engine_id ..
        "&q=" .. http_client.encode_uri(args.query) ..
        "&num=" .. tostring(args.num) ..
        "&start=" .. tostring(args.offset + 1)

    local response, err = transport.get(url .. query_params, {
        max_response_body = args.max_response_body,
        timeout = args.timeout,
        headers = caller_headers(args),
    })
    if err then
        return tool_result.fail(errors.UNAVAILABLE, "Search request failed: " .. tostring(err))
    end
    if type(response) ~= "table" then
        return nil, "Search request failed: invalid response"
    end

    if response.status_code ~= 200 then
        return client.response_error(response, "Search API error: " .. tostring(response.status_code))
    end

    if type(response.body or "") ~= "string" then
        return nil, "Search response body is not text"
    end
    local data, decode_err = json.decode(response.body or "")
    if not data then
        return nil, "Failed to parse search results: " .. tostring(decode_err)
    end

    local results = {}
    if data.items then
        for _, item in ipairs(data.items) do
            table.insert(results, {
                title = item.title,
                link = item.link,
                snippet = item.snippet,
                displayLink = item.displayLink
            })
        end
    end

    local queries: any = type(data.queries) == "table" and data.queries or {}
    return {
        query = args.query,
        total_results = data.searchInformation and data.searchInformation.totalResults or 0,
        results = results,
        count = #results,
        has_more = type(queries.nextPage) == "table" and queries.nextPage[1] ~= nil,
    }
end

return M
