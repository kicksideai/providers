local text = require("text")
local client = require("client")
local tool_result = require("tool_result")

local function extract_links(html_content, base_url, absolute_only)
    local links = {}
    local seen = {}

    local href_regex, _ = text.regexp.compile('<a[^>]+href="([^"]+)"')
    local src_regex, _ = text.regexp.compile('<(?:img|script|link)[^>]+(?:src|href)="([^"]+)"')

    local function process_matches(matches)
        for _, match in ipairs(matches) do
            if #match >= 2 then
                local url = match[2]

                if url:sub(1, 1) == "#" or url:sub(1, 11) == "javascript:" or url:sub(1, 7) == "mailto:" then
                    goto continue
                end

                if url:sub(1, 1) == "/" and base_url then
                    url = base_url .. url
                elseif url:sub(1, 4) ~= "http" and base_url then
                    if url:sub(1, 2) ~= "//" then
                        url = base_url .. "/" .. url
                    else
                        url = "https:" .. url
                    end
                end

                if absolute_only and not url:match("^https?://") then
                    goto continue
                end

                if not url:match("^https?://") then
                    goto continue
                end

                if not seen[url] then
                    seen[url] = true
                    table.insert(links, url)
                end

                ::continue::
            end
        end
    end

    if href_regex then
        local href_matches = href_regex:find_all_string_submatch(html_content)
        process_matches(href_matches)
    end

    if src_regex then
        local src_matches = src_regex:find_all_string_submatch(html_content)
        process_matches(src_matches)
    end

    return links
end

local function get_base_url(url: string): string?
    local domain_regex, _ = text.regexp.compile("^(https?://[^/]+)")
    if domain_regex then
        local matches = domain_regex:find_string_submatch(url)
        if matches and #matches >= 2 then
            return tostring(matches[2])
        end
    end
    return nil
end

-- Links per page when the caller names no limit; the page ends with next_cursor
-- when more links follow.
local DEFAULT_LIMIT = 200

-- See read.lua: transport values the model no longer supplies, still honoured
-- from a caller that owns them.
local function caller_user_agent(args: any): {[string]: string}?
    if type(args.user_agent) == "string" and args.user_agent ~= "" then
        return { ["User-Agent"] = args.user_agent }
    end
    return nil
end

local function caller_number(value: any): number?
    if type(value) == "number" then return value :: number end
    return nil
end

local function handle(args: any, deps: any?)
    args = args or {}
    local transport_client = (deps or {}).client or client

    if not args.url or args.url == "" then
        return tool_result.fail(errors.INVALID, "URL parameter is required")
    end
    if type(args.url) ~= "string" then
        return tool_result.fail(errors.INVALID, "URL parameter must be a string")
    end

    local absolute_only = args.absolute_only
    if type(absolute_only) ~= "boolean" then absolute_only = true end
    local limit = args.limit
    if limit == nil then limit = DEFAULT_LIMIT end
    if type(limit) ~= "number" or limit < 1 or limit ~= math.floor(limit) then
        return tool_result.fail(errors.INVALID, "limit must be a positive integer")
    end
    local offset = 0
    if args.cursor ~= nil then
        local parsed = type(args.cursor) == "string" and tonumber(args.cursor) or nil
        if not parsed or parsed < 0 or parsed ~= math.floor(parsed) then
            return tool_result.fail(errors.INVALID, "cursor must be a next_cursor value from a previous FetchAllLinks result")
        end
        offset = parsed :: number
    end

    local response, err = transport_client.get(args.url, {
        timeout = caller_number(args.timeout),
        max_response_body = caller_number(args.max_response_body),
        headers = caller_user_agent(args),
    })
    if err then
        return tool_result.fail(errors.UNAVAILABLE, "Failed to fetch page: " .. tostring(err))
    end
    if type(response) ~= "table" then
        return tool_result.fail(errors.INTERNAL, "Failed to fetch page: invalid response")
    end

    if response.status_code ~= 200 then
        return client.response_error(response, "Page returned status " .. tostring(response.status_code))
    end

    if type(response.body or "") ~= "string" then
        return tool_result.fail(errors.INVALID, "Page response body is not text")
    end
    local base_url = get_base_url(args.url)
    local links = extract_links(response.body or "", base_url, absolute_only)
    local page = {}
    for index = offset + 1, math.min(offset + limit, #links) do page[#page + 1] = links[index] end

    return {
        url = args.url,
        base_url = base_url,
        total_links = #links,
        absolute_only = absolute_only,
        links = page,
        next_cursor = offset + limit < #links and tostring(offset + limit) or nil,
    }
end

return { handle = handle }
