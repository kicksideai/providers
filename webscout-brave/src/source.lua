local config = require("config")
local http_client = require("http_client")
local json = require("json")
local operation_policy = require("operation_policy")

local M = {}

type JsonMap = { [string]: unknown }
type JsonList = { unknown }
type HttpResponse = { status_code: number, body: unknown }
type Client = { get: (string, unknown) -> (HttpResponse?, string?) }

local SETTINGS_NS = "kickside.webscout.providers.brave"
local SOURCE_ID = "kickside.webscout.providers.brave:source"
local WEB_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"
local NEWS_ENDPOINT = "https://api.search.brave.com/res/v1/news/search"
local NEWS_OPERATION = "company_news"
local WEB_OPERATIONS: { [string]: boolean } = {
    company_discovery = true,
    prospect_context = true,
    person_context = true,
    product_proof = true,
    relationship_context = true,
}
local OPERATION_CAPABILITIES: { [string]: string } = {
    company_discovery = "market.company.discovery",
    prospect_context = "prospect.current_context",
    person_context = "person.current_context",
    product_proof = "product.relevant_proof",
    relationship_context = "relationship.external_context",
    company_news = "company.news.discovery",
}
local NON_ESCALATABLE_OUTCOMES: { [string]: boolean } = {
    connection_not_configured = true,
    access_denied = true,
    login_required = true,
    captcha_required = true,
    robots_disallowed = true,
    rate_limited = true,
}
local ESCALATABLE_OUTCOMES: { [string]: boolean } = {
    javascript_required = true,
    interactive_required = true,
    dynamic_content = true,
}

local function map(value: unknown): JsonMap
    return type(value) == "table" and value :: JsonMap or {}
end

local function list(value: unknown): JsonList
    return type(value) == "table" and value :: JsonList or {}
end

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function bounded_text(value: unknown, maximum: number): string
    local text = trim(value)
    if #text <= maximum then return text end
    local marker = "... [content truncated]"
    local body_limit = math.max(0, maximum - #marker)
    return text:sub(1, body_limit) .. marker
end

local function private_host(host_value: string): boolean
    local host = host_value:lower()
    if host == "localhost" or host:sub(-10) == ".localhost" then return true end
    if host == "::1" or host == "0:0:0:0:0:0:0:1" or host:sub(1, 2) == "fc" or host:sub(1, 2) == "fd" then
        return true
    end
    local first, second, third, fourth = host:match("^(%d+)%.(%d+)%.(%d+)%.(%d+)$")
    if not first then return false end
    local a, b, c, d = tonumber(first) or -1, tonumber(second) or -1, tonumber(third) or -1, tonumber(fourth) or -1
    if a < 0 or a > 255 or b < 0 or b > 255 or c < 0 or c > 255 or d < 0 or d > 255 then return true end
    if a == 0 or a == 10 or a == 127 or a == 169 and b == 254 or a == 192 and b == 168 then return true end
    if a == 172 and b >= 16 and b <= 31 then return true end
    return false
end

-- Search results are discovery pointers, but they still become canonical
-- evidence keys. Reject credentials and obvious local destinations before a
-- later Research step can promote one to page_read.
local function safe_result_url(value: unknown): string?
    local url = trim(value)
    if url == "" or #url > 8192 or url:find("[%c%s]") then return nil end
    if not url:match("^https?://") then return nil end
    local authority = url:match("^https?://([^/%?#]+)")
    if not authority or authority == "" or authority:find("@", 1, true) then return nil end
    local host = authority:match("^%[(.-)%]") or authority:match("^([^:]+)") or authority
    if private_host(host) then return nil end
    return (url:gsub("#.*$", ""))
end

local function normalize_code(value: unknown): string
    return trim(value):lower():gsub("[%s%-]+", "_")
end

local function error_text(value: unknown): string
    if type(value) == "table" then
        local row = value :: JsonMap
        for _, key in ipairs({ "message", "error", "detail", "reason", "code" }) do
            local candidate = trim(row[key])
            if candidate ~= "" then return candidate end
        end
        if type(row.status_code) == "number" then return "HTTP status " .. tostring(row.status_code) end
    end
    return trim(tostring(value or ""))
end

local function classify_retrieval_error(value: unknown): string
    local row = map(value)
    local direct = normalize_code(row.code)
    if NON_ESCALATABLE_OUTCOMES[direct] or ESCALATABLE_OUTCOMES[direct] then return direct end
    local message = error_text(value):lower()
    if message:find("not configured", 1, true)
        or message:find("api key", 1, true) then return "connection_not_configured" end
    if message:find("captcha", 1, true) or message:find("recaptcha", 1, true)
        or message:find("human verification", 1, true) then return "captcha_required" end
    if message:find("login", 1, true) or message:find("sign in", 1, true)
        or message:find("authentication required", 1, true) or message:find("unauthorized", 1, true)
        or message:find("http status 401", 1, true) or message:find("status 401", 1, true) then return "login_required" end
    if message:find("robots", 1, true) or message:find("robots.txt", 1, true) then return "robots_disallowed" end
    if message:find("rate limit", 1, true) or message:find("too many requests", 1, true)
        or message:find("throttl", 1, true) or message:find("http status 429", 1, true)
        or message:find("status 429", 1, true) then return "rate_limited" end
    if message:find("access denied", 1, true) or message:find("forbidden", 1, true)
        or message:find("blocked", 1, true) or message:find("not allowed", 1, true)
        or message:find("permission denied", 1, true) or message:find("private ip", 1, true)
        or message:find("http status 403", 1, true) or message:find("status 403", 1, true) then return "access_denied" end
    if message:find("javascript", 1, true) or message:find("enable js", 1, true) then return "javascript_required" end
    if message:find("interactive", 1, true) or message:find("browser required", 1, true) then return "interactive_required" end
    if message:find("dynamic content", 1, true) or message:find("client rendered", 1, true) then return "dynamic_content" end
    return "provider_error"
end

local function failure(code: string, message: string): JsonMap
    return { code = code, message = message }
end

local function reject_unknown(value: unknown, allowed: { [string]: boolean }, label: string): string?
    if type(value) ~= "table" then return label .. " must be an object" end
    for key in pairs(value :: JsonMap) do
        if not allowed[key] then return label .. " contains an unsupported field: " .. tostring(key) end
    end
    return nil
end

local function subject(value: unknown, required: boolean): (JsonMap?, string?)
    if value == nil and not required then return {}, nil end
    if type(value) ~= "table" then return nil, "subject is required" end
    local row = value :: JsonMap
    local unknown_err = reject_unknown(row, { kind = true, ref = true, names = true, identifiers = true }, "subject")
    if unknown_err then return nil, unknown_err end
    local kind, ref = trim(row.kind), trim(row.ref)
    if kind == "" or ref == "" then return nil, "subject.kind and subject.ref are required" end
    return { kind = kind, ref = ref }, nil
end

local function subject_refs(value: unknown): JsonList
    local row = map(value)
    local refs: JsonList = table.create(0, 0)
    if trim(row.kind) ~= "" and trim(row.ref) ~= "" then
        refs[1] = { kind = trim(row.kind), ref = trim(row.ref) }
    end
    return refs
end

type NormalizedRequest = {
    operation: string,
    capability: string,
    case_id: string,
    idempotency_key: string,
    subject: JsonMap,
    query: string, user_agent: string, freshness: string, safe_search: string,
    requested_limits: JsonMap,
    control_bounds: JsonMap, operation_policy: JsonMap,
}

local function normalize_request(value: unknown): (NormalizedRequest?, JsonMap?)
    local envelope = map(value)
    local outer = map(envelope.input)
    local config = map(envelope.config)
    local config_unknown = reject_unknown(config, { control_bounds = true, operation_policy = true }, "config")
    if config_unknown then return nil, failure("invalid_input", config_unknown) end
    if type(config.control_bounds) ~= "table" then return nil, failure("invalid_input", "config.control_bounds is required") end
    if type(config.operation_policy) ~= "table" then return nil, failure("invalid_input", "config.operation_policy is required") end
    local unknown_err = reject_unknown(outer, { case_id = true, idempotency_key = true, operation = true, capability = true, subject = true, input = true, limits = true }, "source input")
    if unknown_err then return nil, failure("invalid_input", unknown_err) end
    local case_id, idempotency_key = trim(outer.case_id), trim(outer.idempotency_key)
    if case_id == "" then return nil, failure("invalid_input", "case_id is required") end
    if idempotency_key == "" then return nil, failure("invalid_input", "idempotency_key is required") end
    local operation, capability = trim(outer.operation), trim(outer.capability)
    local expected = OPERATION_CAPABILITIES[operation]
    if not expected then return nil, failure("invalid_input", "unsupported Brave Research operation: " .. operation) end
    if capability ~= expected then return nil, failure("invalid_input", "capability does not match operation") end
    local subject_value, subject_err = subject(outer.subject, true)
    if not subject_value then return nil, failure("invalid_input", subject_err or "subject is invalid") end
    local operation_input = map(outer.input)
    local input_err = reject_unknown(operation_input, { query = true, user_agent = true, freshness = true, safe_search = true }, "input")
    if input_err then return nil, failure("invalid_input", input_err) end
    local query, user_agent = trim(operation_input.query), trim(operation_input.user_agent)
    local freshness, safe_search = trim(operation_input.freshness):lower(), trim(operation_input.safe_search):lower()
    if outer.limits ~= nil and type(outer.limits) ~= "table" then
        return nil, failure("invalid_input", "limits must be an object")
    end
    local requested_limits = map(outer.limits)
    local limits_unknown = reject_unknown(requested_limits, { max_results = true, timeout_seconds = true }, "limits")
    if limits_unknown then return nil, failure("invalid_input", limits_unknown) end
    if query == "" then return nil, failure("invalid_input", "input.query is required") end
    if #query > 2000 then return nil, failure("invalid_input", "input.query is too long") end
    if user_agent == "" then return nil, failure("invalid_input", "input.user_agent is required") end
    if freshness == "" then return nil, failure("invalid_input", "input.freshness is required") end
    if safe_search == "" then return nil, failure("invalid_input", "input.safe_search is required") end
    return { operation = operation, capability = capability, case_id = case_id, idempotency_key = idempotency_key,
        subject = subject_value :: JsonMap, query = query, user_agent = user_agent, freshness = freshness,
        safe_search = safe_search, requested_limits = requested_limits,
        control_bounds = config.control_bounds :: JsonMap,
        operation_policy = config.operation_policy :: JsonMap }, nil
end

local function display_domain(row: JsonMap, uri: string): string
    local profile = map(row.profile)
    local provider_name = trim(profile.long_name)
    if provider_name ~= "" then return provider_name end
    return uri:match("^https?://([^/%?#]+)") or ""
end

local function result_artifact(row: JsonMap, query: string, operation: string, subject_value: unknown, index: number): JsonMap?
    local uri = safe_result_url(row.url)
    local title = bounded_text(row.title, 512)
    if not uri or title == "" then return nil end
    local artifact: JsonMap = {
        source_artifact_key = "brave:" .. uri,
        canonical_uri = uri,
        title = title,
        media_type = "application/vnd.kickside.brave-search-result+json",
        content = {
            query = query,
            snippet = bounded_text(row.description, 4000),
            display_domain = bounded_text(display_domain(row, uri), 512),
            provider = "brave",
            result_kind = operation == NEWS_OPERATION and "news" or "web",
        },
        subject_refs = subject_refs(subject_value),
        ordinal = index,
    }
    local published_at = bounded_text(row.page_age, 256)
    if published_at ~= "" then artifact.published_at = published_at end
    return artifact
end

local function decode_response(response: HttpResponse): (JsonMap?, string?)
    if type(response.body) == "table" then return response.body :: JsonMap, nil end
    local decoded, decode_err = json.decode(tostring(response.body or ""))
    if decode_err or type(decoded) ~= "table" then return nil, "Brave Search returned invalid JSON" end
    return decoded :: JsonMap, nil
end

function M.run(value: unknown, injected_client: Client?, injected_key: string?): (JsonMap?, JsonMap?)
    local request, request_err = normalize_request(value)
    if not request then return nil, request_err end
    local control, control_err = operation_policy.validate_bounds(request.control_bounds)
    if not control then return nil, failure("invalid_input", control_err or "control_bounds is invalid") end
    local policy, policy_err = operation_policy.validate(request.operation_policy, {
        operation_id = request.operation,
        control_bounds = control,
        limits = true,
        storage = true,
        controls = true,
        search = true,
    })
    if not policy then return nil, failure("invalid_input", policy_err or "operation_policy is invalid") end
    local selected_limits = map((policy :: JsonMap).limits)
    local selected_controls = map((policy :: JsonMap).controls)
    if type(selected_limits.max_results) ~= "number" or type(selected_limits.timeout_seconds) ~= "number" then
        return nil, failure("invalid_input", "operation_policy.limits must select max_results and timeout_seconds")
    end
    if type(selected_controls.response_body_bytes) ~= "number" then
        return nil, failure("invalid_input", "operation_policy.controls.response_body_bytes is required")
    end
    local requested = request.requested_limits
    for key, value_limit in pairs(requested) do
        local actual = key == "max_results" and selected_limits.max_results or selected_limits.timeout_seconds
        if actual ~= value_limit then
            return nil, failure("invalid_input", "input.limits must match operation_policy")
        end
    end
    local selected_search = map((policy :: JsonMap).search)
    if selected_search.freshness ~= request.freshness or selected_search.safe_search ~= request.safe_search then
        return nil, failure("invalid_input", "input freshness and safe_search must match operation_policy")
    end
    local api_key = trim(injected_key or config.get("api_key", SETTINGS_NS))
    if api_key == "" then return nil, failure("connection_not_configured", "Brave Search API key not configured") end
    local endpoint = request.operation == NEWS_OPERATION and NEWS_ENDPOINT or WEB_ENDPOINT
    local url = endpoint .. "?q=" .. http_client.encode_uri(request.query)
        .. "&count=" .. tostring(selected_limits.max_results)
        .. "&freshness=" .. http_client.encode_uri(request.freshness)
        .. "&safesearch=" .. http_client.encode_uri(request.safe_search)
    local client = injected_client or {
        get = function(request_url: string, options: unknown): (HttpResponse?, string?)
            local response, request_err = http_client.get(request_url, options)
            if request_err then return nil, tostring(request_err) end
            return response :: HttpResponse, nil
        end,
    }
    local response, request_err = client.get(url, {
        timeout = selected_limits.timeout_seconds,
        max_response_body = selected_controls.response_body_bytes,
        headers = { ["Accept"] = "application/json", ["X-Subscription-Token"] = api_key, ["User-Agent"] = request.user_agent },
    })
    if request_err or not response then
        local detail = request_err or "no response"
        return nil, failure(classify_retrieval_error(detail), "Brave Search request failed: " .. tostring(detail))
    end
    if response.status_code ~= 200 then
        return nil, failure(classify_retrieval_error({ status_code = response.status_code }), "Brave Search returned status " .. tostring(response.status_code))
    end
    local body, decode_err = decode_response(response)
    if not body then return nil, failure("provider_error", decode_err or "Brave Search returned invalid JSON") end
    local rows = request.operation == NEWS_OPERATION and list(body.results) or list(map(body.web).results)
    local artifacts: JsonList = table.create(0, 0)
    for index, row in ipairs(rows) do
        if #artifacts >= selected_limits.max_results then break end
        local artifact = result_artifact(map(row), request.query, request.operation, request.subject, index)
        if artifact then artifacts[#artifacts + 1] = artifact end
    end
    if #artifacts == 0 then return nil, failure("no_attributable_results", "Brave Search returned no attributable results") end
    return {
        source_id = SOURCE_ID,
        operation = request.operation,
        artifacts = artifacts,
        receipt = {
            case_id = request.case_id,
            idempotency_key = request.idempotency_key,
            policy_receipt = operation_policy.receipt(policy :: JsonMap),
            control_receipt = operation_policy.control_receipt(control :: JsonMap),
            operation_input = { query = request.query, user_agent = request.user_agent, freshness = request.freshness, safe_search = request.safe_search },
        },
        retrieval = { transport = "brave", status = "succeeded", outcome_code = "static_content", escalatable = false },
    }, nil
end

M._test = {
    result_artifact = result_artifact,
    display_domain = display_domain,
    classify_retrieval_error = classify_retrieval_error,
    escalatable_outcomes = ESCALATABLE_OUTCOMES,
    non_escalatable_outcomes = NON_ESCALATABLE_OUTCOMES,
}

return M
