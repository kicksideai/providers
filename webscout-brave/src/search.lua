local http_client = require("http_client")
local json = require("json")
local client = require("client")
local config = require("config")

-- Brave web search behind the WebScout search provider protocol. The dispatcher
-- hands over the tool's arguments as they are; normalizing Brave's answer into
-- the shared result shape is this function's job, which is why the dispatcher
-- never branches on who answered.

local SETTINGS_NS = "kickside.webscout.providers.brave"
local ENDPOINT = "https://api.search.brave.com/res/v1/web/search"
-- Brave's highest page offset.
local MAX_PAGE = 9

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

-- display_domain falls back to the host in the URL, because Brave only carries
-- a profile name for results it recognizes.
local function display_domain(item: any): string?
    local profile: any = item.profile
    if type(profile) == "table" and type(profile.long_name) == "string" then
        return profile.long_name :: string
    end
    return (item.link :: string):match("^https?://([^/%?#]+)")
end

function M.search(args: SearchArgs, deps: Deps?): (JsonMap?, string?)
    local d: any = deps or {}
    local cfg = d.config or config
    local transport = d.client or client

    local api_key = cfg.get("api_key", SETTINGS_NS)
    if not api_key then
        return nil, "Brave Search API key not configured"
    end

    -- Brave pages in whole pages: its offset counts pages of `count` results. The
    -- page size is the largest count up to num that the result offset is a whole
    -- number of pages of, so the page starts exactly at the requested result.
    local count = args.num
    while count > 1 and args.offset % count ~= 0 do count = count - 1 end
    local page = math.floor(args.offset / count)
    if page > MAX_PAGE then
        return { query = args.query, total_results = 0, results = {}, count = 0, has_more = false }
    end
    local url = ENDPOINT ..
        "?q=" .. http_client.encode_uri(args.query) ..
        "&count=" .. tostring(count) ..
        "&offset=" .. tostring(page)

    -- Brave's own two headers always travel; the User-Agent only when a caller
    -- owns it, otherwise the client supplies the deployment's.
    local headers: {[string]: string} = {
        ["Accept"] = "application/json",
        ["X-Subscription-Token"] = api_key,
    }
    if type(args.user_agent) == "string" and args.user_agent ~= "" then
        headers["User-Agent"] = args.user_agent :: string
    end

    -- Named with the transport's own option type, and the two transport values
    -- are SET only when the caller owns them: writing them as nil makes them
    -- present-but-empty, which is a different thing from absent both to the
    -- type checker and to the client that fills what nobody asked for.
    local options: http_client.RequestOptions = { headers = headers }
    if type(args.max_response_body) == "number" then
        options.max_response_body = args.max_response_body :: number
    end
    if type(args.timeout) == "number" then
        options.timeout = args.timeout :: number
    end
    local response, err = transport.get(url, options)
    if err then
        return nil, "Search request failed: " .. err
    end
    if type(response) ~= "table" then
        return nil, "Search request failed: invalid response"
    end
    if response.status_code ~= 200 then
        return nil, "Search API error: " .. response.status_code
    end
    if type(response.body or "") ~= "string" then
        return nil, "Search response body is not text"
    end

    local data, decode_err = json.decode(response.body or "")
    if not data then
        return nil, "Failed to parse search results: " .. tostring(decode_err)
    end

    local results = {}
    local web: any = data.web
    for _, item in ipairs(type(web) == "table" and web.results or {}) do
        local link = item.url
        if type(link) == "string" and link ~= "" then
            table.insert(results, {
                title = item.title,
                link = link,
                snippet = item.description,
                displayLink = display_domain({ profile = item.profile, link = link }),
            })
        end
    end

    -- Brave reports no corpus-wide estimate the way Google does, so the count
    -- returned is all this provider can honestly say.
    local query_info: any = type(data.query) == "table" and data.query or {}
    return {
        query = args.query,
        total_results = #results,
        results = results,
        count = #results,
        has_more = query_info.more_results_available == true and page < MAX_PAGE,
    }
end

return M
