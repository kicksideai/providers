local funcs = require("funcs")
local operation_policy = require("operation_policy")

local M = {}
type JsonMap = { [string]: unknown }
type JsonList = { unknown }
type FunctionCaller = { call: (string, unknown) -> (unknown?, unknown?) }

local SEARCH = "kickside.webscout.traits:search"
local READ = "kickside.webscout.traits:read"
local LINKS = "kickside.webscout.traits:links"
local SOURCE_ID = "kickside.webscout.research:source"
local SEARCH_OPERATIONS: { [string]: boolean } = {
    company_discovery = true, prospect_context = true, person_context = true,
    product_proof = true, relationship_context = true,
}
local OPERATION_CAPABILITIES: { [string]: string } = {
    company_discovery = "market.company.discovery", prospect_context = "prospect.current_context",
    person_context = "person.current_context", product_proof = "product.relevant_proof",
    relationship_context = "relationship.external_context", page_read = "web.page.read",
    site_links = "web.site.links",
}
local READ_OPERATION, LINKS_OPERATION = "page_read", "site_links"
local ESCALATABLE_OUTCOMES = { javascript_required = true, interactive_required = true, dynamic_content = true }
local NON_ESCALATABLE_OUTCOMES = {
    connection_not_configured = true, access_denied = true, login_required = true,
    captcha_required = true, robots_disallowed = true, rate_limited = true,
}

local function map(value: unknown): JsonMap return type(value) == "table" and value :: JsonMap or {} end
local function list(value: unknown): JsonList return type(value) == "table" and value :: JsonList or {} end
local function is_domain_error(value: unknown): boolean
    return type(value) == "table" and (value :: JsonMap).success == false
end
local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end
local function bounded_text(value: unknown, maximum: number): string
    local text = trim(value)
    if #text <= maximum then return text end
    local marker = "... [content truncated]"
    return text:sub(1, math.max(0, maximum - #marker)) .. marker
end
local function normalize_code(value: unknown): string return trim(value):lower():gsub("[%s%-]+", "_") end
local function error_text(value: unknown): string
    if type(value) == "table" then
        local row = value :: JsonMap
        for _, key in ipairs({ "message", "error", "detail", "reason", "code" }) do
            local candidate = trim(row[key]); if candidate ~= "" then return candidate end
        end
        if type(row.status_code) == "number" then return "HTTP status " .. tostring(row.status_code) end
    end
    return trim(tostring(value or ""))
end

local function classify_retrieval_error(value: unknown): string
    local row = map(value)
    local direct = normalize_code(row.code)
    if NON_ESCALATABLE_OUTCOMES[direct] or ESCALATABLE_OUTCOMES[direct] then return direct end
    local status = tonumber(row.status_code)
    if status == 401 then return "login_required" end
    if status == 403 then return "access_denied" end
    if status == 429 then return "rate_limited" end
    local message = error_text(value):lower()
    if message:find("not configured", 1, true) or message:find("api key", 1, true)
        or message:find("engine id", 1, true) then return "connection_not_configured" end
    if message:find("captcha", 1, true) or message:find("recaptcha", 1, true)
        or message:find("human verification", 1, true) then return "captcha_required" end
    if message:find("login", 1, true) or message:find("sign in", 1, true)
        or message:find("authentication required", 1, true) or message:find("unauthorized", 1, true)
        or message:find("status 401", 1, true) then return "login_required" end
    if message:find("robots", 1, true) then return "robots_disallowed" end
    if message:find("rate limit", 1, true) or message:find("too many requests", 1, true)
        or message:find("throttl", 1, true) or message:find("status 429", 1, true) then return "rate_limited" end
    if message:find("access denied", 1, true) or message:find("forbidden", 1, true)
        or message:find("blocked", 1, true) or message:find("not allowed", 1, true)
        or message:find("permission denied", 1, true) or message:find("private ip", 1, true)
        or message:find("status 403", 1, true) then return "access_denied" end
    if message:find("javascript", 1, true) or message:find("enable js", 1, true) then return "javascript_required" end
    if message:find("interactive", 1, true) or message:find("browser required", 1, true)
        or message:find("requires a browser", 1, true) then return "interactive_required" end
    if message:find("dynamic content", 1, true) or message:find("client rendered", 1, true)
        or message:find("not in the static response", 1, true) then return "dynamic_content" end
    return "provider_error"
end
local function failure(code: string, message: string): JsonMap return { code = code, message = message } end
local function retrieval_failure(prefix: string, value: unknown): JsonMap
    local detail = error_text(value); if detail == "" then detail = "provider did not return a response" end
    return failure(classify_retrieval_error(value), prefix .. ": " .. detail)
end
local function reject_unknown(value: unknown, allowed: { [string]: boolean }, label: string): string?
    if type(value) ~= "table" then return label .. " must be an object" end
    for key in pairs(value :: JsonMap) do if not allowed[key] then return label .. " contains an unsupported field: " .. tostring(key) end end
    return nil
end

local function private_host(host_value: string): boolean
    local host = host_value:lower()
    if host == "localhost" or host:sub(-10) == ".localhost" or host == "::1" or host:sub(1, 2) == "fc" or host:sub(1, 2) == "fd" then return true end
    local a, b, c, d = host:match("^(%d+)%.(%d+)%.(%d+)%.(%d+)$")
    if not a then return false end
    local first, second = tonumber(a) or -1, tonumber(b) or -1
    if first < 0 or first > 255 or tonumber(c) > 255 or tonumber(d) > 255 then return true end
    return first == 0 or first == 10 or first == 127 or (first == 169 and second == 254)
        or (first == 172 and second >= 16 and second <= 31) or (first == 192 and second == 168)
end
local function safe_url(value: unknown): (string?, string?)
    local url = trim(value)
    if url == "" then return nil, "url is required" end
    if #url > 8192 or url:find("[%c%s]") then return nil, "url must not contain whitespace or control characters" end
    if not url:match("^https?://") then return nil, "url must use http or https" end
    local authority = url:match("^https?://([^/%?#]+)")
    if not authority or authority == "" then return nil, "url host is required" end
    if authority:find("@", 1, true) then return nil, "url must not contain credentials" end
    local host = authority:match("^%[(.-)%]") or authority:match("^([^:]+)") or authority
    if private_host(host) then return nil, "url targets a private network address" end
    return (url:gsub("#.*$", "")), nil
end
local function subject(value: unknown, required: boolean): (JsonMap?, string?)
    if value == nil and not required then return {}, nil end
    if type(value) ~= "table" then return nil, "subject is required" end
    local row = value :: JsonMap
    local unknown = reject_unknown(row, { kind = true, ref = true, names = true, identifiers = true }, "subject")
    if unknown then return nil, unknown end
    if trim(row.kind) == "" or trim(row.ref) == "" then return nil, "subject.kind and subject.ref are required" end
    return { kind = trim(row.kind), ref = trim(row.ref) }, nil
end
local function subject_refs(value: unknown): JsonList
    local row = map(value); if trim(row.kind) == "" or trim(row.ref) == "" then return {} end
    return { { kind = trim(row.kind), ref = trim(row.ref) } }
end

type NormalizedRequest = {
    operation: string, capability: string, case_id: string, idempotency_key: string,
    subject: JsonMap, operation_input: JsonMap, requested_limits: JsonMap,
    control_bounds: JsonMap, operation_policy: JsonMap,
}

local function normalize_request(value: unknown): (NormalizedRequest?, JsonMap?)
    local envelope, outer = map(value), map(map(value).input)
    local config = map(envelope.config)
    local unknown = reject_unknown(config, { control_bounds = true, operation_policy = true }, "config")
    if unknown then return nil, failure("invalid_input", unknown) end
    if type(envelope.config) ~= "table" then return nil, failure("invalid_input", "config with control_bounds and operation_policy is required") end
    if type(config.control_bounds) ~= "table" then return nil, failure("invalid_input", "config.control_bounds is required") end
    if type(config.operation_policy) ~= "table" then return nil, failure("invalid_input", "config.operation_policy is required") end
    if outer.limits ~= nil and type(outer.limits) ~= "table" then return nil, failure("invalid_input", "limits must be an object") end
    local outer_unknown = reject_unknown(outer, {
        case_id = true, idempotency_key = true, operation = true, capability = true,
        subject = true, input = true, limits = true,
    }, "source input")
    if outer_unknown then return nil, failure("invalid_input", outer_unknown) end
    local case_id, idempotency_key = trim(outer.case_id), trim(outer.idempotency_key)
    if case_id == "" then return nil, failure("invalid_input", "case_id is required") end
    if idempotency_key == "" then return nil, failure("invalid_input", "idempotency_key is required") end
    local operation = trim(outer.operation)
    local capability = trim(outer.capability)
    local expected = OPERATION_CAPABILITIES[operation]
    if not expected then return nil, failure("invalid_input", "unsupported WebScout Research operation: " .. operation) end
    if capability ~= expected then return nil, failure("invalid_input", "capability does not match operation") end
    local subject_value, subject_err = subject(outer.subject, true)
    if not subject_value then return nil, failure("invalid_input", subject_err or "subject is invalid") end
    local operation_input = map(outer.input)
    return {
        operation = operation, capability = capability, case_id = case_id,
        idempotency_key = idempotency_key, subject = subject_value :: JsonMap,
        operation_input = operation_input, requested_limits = map(outer.limits),
        control_bounds = config.control_bounds :: JsonMap,
        operation_policy = config.operation_policy :: JsonMap,
    }, nil
end

local function normalize_operation_input(request: NormalizedRequest): (JsonMap?, JsonMap?)
    local input = request.operation_input
    local allowed = SEARCH_OPERATIONS[request.operation]
        and { query = true, user_agent = true }
        or { url = true, user_agent = true }
    local unknown = reject_unknown(input, allowed, "input")
    if unknown then return nil, failure("invalid_input", unknown) end
    local user_agent = trim(input.user_agent)
    if user_agent == "" then return nil, failure("invalid_input", "input.user_agent is required") end
    if #user_agent > 512 then return nil, failure("invalid_input", "input.user_agent is too long") end
    if SEARCH_OPERATIONS[request.operation] then
        local query = trim(input.query)
        if query == "" then return nil, failure("invalid_input", "input.query is required") end
        if #query > 2000 then return nil, failure("invalid_input", "input.query is too long") end
        return { query = query, user_agent = user_agent }, nil
    end
    local url, url_err = safe_url(input.url)
    if not url then return nil, failure("invalid_input", url_err or "input.url is invalid") end
    return { url = url :: string, user_agent = user_agent }, nil
end

local function selected_limits(policy: JsonMap, operation: string): (JsonMap?, JsonMap?)
    local limits = map(policy.limits)
    local storage = map(policy.storage)
    local controls = map(policy.controls)
    if type(limits.max_results) ~= "number" or type(limits.timeout_seconds) ~= "number" then
        return nil, failure("invalid_input", "operation_policy.limits must select max_results and timeout_seconds")
    end
    if type(controls.response_body_bytes) ~= "number" then
        return nil, failure("invalid_input", "operation_policy.controls.response_body_bytes is required")
    end
    local result: JsonMap = {
        max_results = limits.max_results, timeout_seconds = limits.timeout_seconds,
        response_body_bytes = controls.response_body_bytes,
    }
    if operation == READ_OPERATION then
        if type(storage.limit_chars) ~= "number" then return nil, failure("invalid_input", "operation_policy.storage.limit_chars is required for page_read") end
        result.max_content_chars = storage.limit_chars
    elseif operation == LINKS_OPERATION then
        result.max_links = limits.max_results
    end
    return result, nil
end

local function search_artifact(row: JsonMap, query: string, subject_value: unknown, index: number): JsonMap?
    local uri = safe_url(row.link); if not uri then return nil end
    local title = bounded_text(row.title, 512); if title == "" then title = uri :: string end
    return { source_artifact_key = uri, canonical_uri = uri, title = title,
        media_type = "application/vnd.kickside.web-search-result+json",
        content = { query = query, snippet = bounded_text(row.snippet, 4000), display_domain = bounded_text(row.displayLink, 512) },
        subject_refs = subject_refs(subject_value), ordinal = index }
end
local function page_artifact(uri: string, content: string, subject_value: unknown): JsonMap
    return { source_artifact_key = uri, canonical_uri = uri, title = bounded_text(uri, 512), media_type = "text/plain", content = content, subject_refs = subject_refs(subject_value) }
end
local function links_artifact(uri: string, result: JsonMap, subject_value: unknown, max_links: number): JsonMap
    local links: JsonList, seen = {}, {}
    for _, value in ipairs(list(result.links)) do
        if #links >= max_links then break end
        local link = safe_url(value)
        if link and not seen[link :: string] then seen[link :: string] = true; links[#links + 1] = link end
    end
    return { source_artifact_key = uri .. "#links", canonical_uri = uri, title = bounded_text("Links from " .. uri, 512),
        media_type = "application/vnd.kickside.web-links+json", content = { url = uri, links = links, total_links = #links }, subject_refs = subject_refs(subject_value) }
end
local function success(operation: string, artifacts: JsonList, policy: JsonMap, bounds: JsonMap, input: JsonMap, case_id: string, idempotency_key: string): JsonMap
    return { source_id = SOURCE_ID, operation = operation, artifacts = artifacts,
        receipt = { case_id = case_id, idempotency_key = idempotency_key,
            policy_receipt = policy, control_receipt = bounds, operation_input = input },
        retrieval = { transport = "http", status = "succeeded", outcome_code = "static_content", escalatable = false } }
end

function M.run(value: unknown, caller: FunctionCaller?): (JsonMap?, JsonMap?)
    local request, request_err = normalize_request(value); if not request then return nil, request_err end
    local normalized, input_err = normalize_operation_input(request :: NormalizedRequest); if not normalized then return nil, input_err end
    local req = request :: NormalizedRequest
    local control, control_err = operation_policy.validate_bounds(req.control_bounds)
    if not control then return nil, failure("invalid_input", control_err or "control_bounds is invalid") end
    local policy, policy_err = operation_policy.validate(req.operation_policy, {
        operation_id = req.operation,
        control_bounds = control,
        limits = true,
        storage = true,
        controls = true,
    })
    if not policy then return nil, failure("invalid_input", policy_err or "operation_policy is invalid") end
    local selected, selected_err = selected_limits(policy :: JsonMap, req.operation)
    if not selected then return nil, selected_err end
    local requested = req.requested_limits
    for key, value_limit in pairs(requested) do
        if key ~= "max_results" and key ~= "max_content_chars" and key ~= "max_links"
            and key ~= "timeout_seconds" then
            return nil, failure("invalid_input", "limits contains unsupported field: " .. tostring(key))
        end
        local actual = key == "max_results" and selected.max_results
            or key == "max_content_chars" and selected.max_content_chars
            or key == "max_links" and selected.max_links
            or selected.timeout_seconds
        if actual ~= value_limit then return nil, failure("invalid_input", "input.limits must match operation_policy") end
    end
    local call = caller and caller.call or funcs.call
    local request_args: JsonMap = {
        timeout = selected.timeout_seconds,
        max_response_body = selected.response_body_bytes,
        user_agent = normalized.user_agent,
    }
    local artifacts: JsonList = {}
    if req.operation == READ_OPERATION then
        request_args.url = normalized.url
        local content, read_err = call(READ, request_args)
        if read_err then return nil, retrieval_failure("WebScout page read failed", read_err) end
        if is_domain_error(content) then return nil, retrieval_failure("WebScout page read failed", content) end
        if type(content) ~= "string" or trim(content) == "" then return nil, failure("no_content", "WebScout page read returned no content") end
        artifacts[1] = page_artifact(normalized.url :: string, bounded_text(content, selected.max_content_chars :: number), req.subject)
    elseif req.operation == LINKS_OPERATION then
        request_args.url = normalized.url
        request_args.absolute_only = true
        request_args.limit = selected.max_links
        local result, links_err = call(LINKS, request_args)
        if links_err then return nil, retrieval_failure("WebScout link discovery failed", links_err) end
        if is_domain_error(result) then return nil, retrieval_failure("WebScout link discovery failed", result) end
        if type(result) ~= "table" then return nil, retrieval_failure("WebScout link discovery failed", "invalid response") end
        artifacts[1] = links_artifact(normalized.url :: string, result :: JsonMap, req.subject, selected.max_links :: number)
    else
        request_args.query = normalized.query
        request_args.num = selected.max_results
        local result, search_err = call(SEARCH, request_args)
        if search_err then return nil, retrieval_failure("WebScout search failed", search_err) end
        if is_domain_error(result) then return nil, retrieval_failure("WebScout search failed", result) end
        if type(result) ~= "table" then return nil, retrieval_failure("WebScout search failed", "invalid response") end
        for index, value_row in ipairs(list((result :: JsonMap).results)) do
            if #artifacts >= (selected.max_results :: number) then break end
            local item = search_artifact(map(value_row), normalized.query :: string, req.subject, index)
            if item then artifacts[#artifacts + 1] = item end
        end
        if #artifacts == 0 then return nil, failure("no_attributable_results", "WebScout search returned no attributable results") end
    end
    return success(req.operation, artifacts, operation_policy.receipt(policy :: JsonMap), operation_policy.control_receipt(control :: JsonMap), normalized, req.case_id, req.idempotency_key), nil
end

M._test = { classify_retrieval_error = classify_retrieval_error, normalize_request = normalize_request, safe_url = safe_url,
    links_artifact = links_artifact, page_artifact = page_artifact, search_artifact = search_artifact,
    escalatable_outcomes = ESCALATABLE_OUTCOMES, non_escalatable_outcomes = NON_ESCALATABLE_OUTCOMES }
return M
