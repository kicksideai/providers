local html = require("html")
local client = require("client")
local tool_result = require("tool_result")

local function clean_content(html_content)
    local policy, err = html.sanitize.strict_policy()
    if err then
        return html_content
    end

    local clean_text = policy:sanitize(html_content)
    return clean_text:gsub("%s+", " "):gsub("^%s+", ""):gsub("%s+$", "")
end

-- Transport values the model no longer supplies: absent, the client applies the
-- deployment's own. A caller that owns them -- the Research Source, under its
-- operation policy -- still passes them and is still honoured.
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

    local headers = response.headers or {}
    local content_type = headers["content-type"] or headers["Content-Type"] or ""
    local content = response.body or ""
    if type(content) ~= "string" then
        return tool_result.fail(errors.INVALID, "Page response body is not text")
    end

    if content_type:find("text/html") then
        content = clean_content(content)
    elseif not (content_type:find("application/json") or content_type:find("text/")) then
        return tool_result.fail(errors.INVALID, "Unsupported content type: " .. content_type)
    end

    -- A page that yields no text is not a successful read. Handing back an empty
    -- string tells the caller the fetch went fine and leaves it with nothing,
    -- which reads as "there was nothing to contradict me". The typed Research
    -- Source already refuses this (research/source.lua, no_content); the tool
    -- was the odd one out.
    if content:match("^%s*$") then
        return tool_result.fail(errors.NOT_FOUND, "Page returned no readable text")
    end

    return content
end

return { handle = handle }
