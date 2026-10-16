local http_client = require("http_client")
local config = require("config")
local tool_result = require("tool_result")

-- Transport limits belong to the deployment, not to the asking model. The
-- timeout and the byte ceiling are owned here; the User-Agent is a setting. A
-- caller that legitimately owns these -- the Research Source, under its
-- operation policy -- still passes them and is honoured.
--
-- MAX_RESPONSE_BODY is deliberately generous: it is a stop against a runaway
-- response, not a content budget. A page longer than a caller wants is trimmed
-- after it arrives; a page cut off during transport is lost whole, which is
-- what a guessed-low ceiling used to do to ordinary pages.
local CONFIG = {
    DEFAULT_TIMEOUT = 30,
    MAX_RESPONSE_BODY = 10 * 1024 * 1024,
}

local DEFAULT_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

local function get_user_agent(): string
    return config.get("user_agent") or DEFAULT_USER_AGENT
end

local function validate_public_url(url_value: unknown): (string?, string?)
    if type(url_value) ~= "string" then return nil, "URL must be a string" end
    local url = (url_value:gsub("^%s*(.-)%s*$", "%1"))
    if url == "" then return nil, "URL is required" end
    if #url > 8192 then return nil, "URL is too long" end
    if url:find("[%c%s]") then return nil, "URL must not contain whitespace or control characters" end
    if not url:match("^https?://") then return nil, "URL must use http or https" end
    local authority = url:match("^https?://([^/%?#]+)")
    if not authority or authority == "" then return nil, "URL host is required" end
    if authority:find("@", 1, true) then return nil, "URL must not contain credentials" end
    local canonical = url:gsub("#.*$", "") :: string
    return canonical, nil
end

local function check_final_url(response: any): (any?, string?)
    if type(response) ~= "table" then return response, nil end
    local final_url = response.url
    if type(final_url) ~= "string" or final_url == "" then
        return nil, "Response URL missing; refusing an unverified redirect target"
    end
    local _, final_err = validate_public_url(final_url)
    if final_err then return nil, "Redirect target rejected: " .. final_err end
    local status = tonumber(response.status_code) or 0
    if status >= 300 and status < 400 then
        return nil, "Redirect was not resolved to a public page" end
    return response, nil
end

local function get_default_headers(): {[string]: string}
    return {
        ["User-Agent"] = get_user_agent(),
        ["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        ["Accept-Language"] = "en-US,en;q=0.5",
        ["DNT"] = "1",
        ["Connection"] = "keep-alive",
        ["Upgrade-Insecure-Requests"] = "1",
        ["Sec-Fetch-Dest"] = "document",
        ["Sec-Fetch-Mode"] = "navigate",
        ["Sec-Fetch-Site"] = "none",
    }
end

local function merge_headers(custom_headers: {[string]: string}?): {[string]: string}
    local headers = get_default_headers()
    if type(custom_headers) == "table" then
        for k, v in pairs(custom_headers) do headers[k] = v end
    end
    return headers
end

-- apply_limits fills in whatever the caller did not state.
local function apply_limits(options: http_client.RequestOptions): http_client.RequestOptions
    options.headers = merge_headers(options.headers)
    if type(options.timeout) ~= "number" or options.timeout <= 0 then
        options.timeout = CONFIG.DEFAULT_TIMEOUT
    end
    if type(options.max_response_body) ~= "number" or options.max_response_body < 1 then
        options.max_response_body = CONFIG.MAX_RESPONSE_BODY
    end
    return options
end

local function get(url: string, options: http_client.RequestOptions?): (any?, any?)
    local canonical_url, url_err = validate_public_url(url)
    if url_err then return nil, url_err end
    local request_options = apply_limits(options or {})
    local response, request_err = http_client.get(canonical_url :: string, request_options)
    if request_err then return response, request_err end
    return check_final_url(response)
end

local function post(url: string, options: http_client.RequestOptions?): (any?, any?)
    local canonical_url, url_err = validate_public_url(url)
    if url_err then return nil, url_err end
    local request_options = apply_limits(options or {})
    local response, request_err = http_client.post(canonical_url :: string, request_options)
    if request_err then return response, request_err end
    return check_final_url(response)
end

local function request(method: string, url: string, options: http_client.RequestOptions?): (any?, any?)
    local canonical_url, url_err = validate_public_url(url)
    if url_err then return nil, url_err end
    local request_options = apply_limits(options or {})
    local response, request_err = http_client.request(method, canonical_url :: string, request_options)
    if request_err then return response, request_err end
    return check_final_url(response)
end

local function response_error(response: any, message: string): (any?, error?)
    local status = type(response) == "table" and tonumber(response.status_code) or nil
    if status and status >= 500 and status < 600 then
        return tool_result.fail(errors.UNAVAILABLE, message, { status_code = status })
    end
    return tool_result.domain_error(message, { status_code = status })
end

return {
    get = get,
    post = post,
    request = request,
    CONFIG = CONFIG,
    get_user_agent = get_user_agent,
    merge_headers = merge_headers,
    validate_public_url = validate_public_url,
    check_final_url = check_final_url,
    response_error = response_error,
}
