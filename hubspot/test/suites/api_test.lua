local test = require("test")
local api = require("api")
local json = require("json")
local types = require("types")
local time = require("time")

type CapturedRequest = {
    method: string,
    url: string,
    body: string,
}

local function define_tests()
    test.describe("HubSpot API client", function()
        test.it("builds a bearer authorization header", function()
            local headers = api.headers("hs-token")
            test.eq(headers["Authorization"], "Bearer hs-token")
            test.eq(headers["Content-Type"], "application/json")
        end)

        test.it("encodes query parameters", function()
            local url = api.build_url("/crm/v3/objects/contacts", { limit = 2, after = "a b" })
            test.is_true(url:find("limit=2", 1, true) ~= nil, url)
            test.is_true(url:find("after=a%%20b") ~= nil, url)
        end)

        test.it("maps common HubSpot errors", function()
            local msg, code = api.extract_error({ status_code = 401, body = "" })
            test.is_true(msg:find("unauthorized", 1, true) ~= nil, msg)
            test.eq(code, 401)

            msg, code = api.extract_error({ status_code = 400, body = '{"message":"Invalid object type"}' })
            test.eq(msg, "Invalid object type")
            test.eq(code, 400)
        end)

        test.it("reads and clamps provider rate-limit retry windows", function()
            test.eq(api.retry_after_ms({ body = '{"retryAfter":"2"}' }), 2000)
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "3" } }), 3000)
            test.eq(api.retry_after_ms({ headers = { ["X-HubSpot-RateLimit-Interval-Milliseconds"] = "250" } }), 250)
            test.eq(api.retry_after_ms({ body = "" }), 1000)
            test.eq(api.retry_after_ms({ headers = { ["Retry-After"] = "9999" } }), 60000)
        end)

        test.it("backs off and retries 429 responses", function()
            local calls = 0
            local sleeps: { number } = {}
            api._set_http_client_for_test({
                request = function(_method: string, _url: string, _opts: any): (any, string?)
                    calls = calls + 1
                    if calls == 1 then
                        return { status_code = 429, headers = { ["Retry-After"] = "2" }, body = '{"message":"rate"}' }, nil
                    end
                    return { status_code = 200, body = '{"ok":true}' }, nil
                end,
            })
            api._set_sleep_for_test(function(ms: number) sleeps[#sleeps + 1] = ms end)

            local res = api.get({ api_key = "pat" }, "/crm/v3/objects/contacts", nil)

            api._set_http_client_for_test(nil)
            api._set_sleep_for_test(nil)
            test.eq(calls, 2)
            test.eq(sleeps[1], 2000)
            test.eq(res.success, true)
            test.eq(res.status_code, 200)
            test.eq(res.data.ok, true)
        end)

        test.it("bounds every request by an explicit timeout", function()
            local seen: any = nil
            api._set_http_client_for_test({
                request = function(_method: string, _url: string, opts: any): (any, string?)
                    seen = opts
                    return { status_code = 200, body = '{"ok":true}' }, nil
                end,
            })
            local res = api.get({ api_key = "pat" }, "/crm/v3/objects/contacts", nil)
            api._set_http_client_for_test(nil)
            test.eq(res.success, true)
            test.eq(seen.timeout, 30)
        end)

        test.it("bounds a request by the caller's remaining deadline", function()
            local seen: any = nil
            api._set_http_client_for_test({
                request = function(_method: string, _url: string, opts: any): (any, string?)
                    seen = opts
                    return { status_code = 200, body = '{"ok":true}' }, nil
                end,
            })
            local deadline = time.now():add(5 * time.SECOND):utc():format(time.RFC3339)
            local res = api.get({ api_key = "pat", deadline = deadline }, "/crm/v3/objects/contacts", nil)
            api._set_http_client_for_test(nil)
            test.eq(res.success, true)
            test.is_true(seen.timeout > 0 and seen.timeout <= 5, tostring(seen.timeout))
        end)

        test.it("answers a rate limit with its retry window instead of sleeping past the caller's deadline", function()
            local calls = 0
            local sleeps: { number } = {}
            api._set_http_client_for_test({
                request = function(_method: string, _url: string, _opts: any): (any, string?)
                    calls = calls + 1
                    return { status_code = 429, headers = { ["Retry-After"] = "10" }, body = '{"message":"rate"}' }, nil
                end,
            })
            api._set_sleep_for_test(function(ms: number) sleeps[#sleeps + 1] = ms end)
            local deadline = time.now():add(5 * time.SECOND):utc():format(time.RFC3339)
            local res = api.get({ api_key = "pat", deadline = deadline }, "/crm/v3/objects/contacts", nil)
            api._set_http_client_for_test(nil)
            api._set_sleep_for_test(nil)
            test.eq(calls, 1)
            test.eq(#sleeps, 0, "no backoff outlasts the caller's deadline")
            test.eq(res.success, false)
            test.eq(res.status_code, 429)
            test.eq(res.retry_after_ms, 10000)
        end)

        test.it("sends nothing once the caller's deadline passed", function()
            local calls = 0
            api._set_http_client_for_test({
                request = function(_method: string, _url: string, _opts: any): (any, string?)
                    calls = calls + 1
                    return { status_code = 200, body = '{"ok":true}' }, nil
                end,
            })
            local deadline = time.now():add(-1 * time.SECOND):utc():format(time.RFC3339)
            local res, err = api.request({ api_key = "pat", deadline = deadline }, "GET", "/crm/v3/objects/contacts", nil)
            api._set_http_client_for_test(nil)
            test.eq(calls, 0)
            test.is_nil(res)
            test.is_true(errors.is(err, errors.TIMEOUT))
            test.is_true(tostring(err):find("deadline", 1, true) ~= nil, tostring(err))
        end)

        test.it("fails an unsent request with a typed error and keeps a rejection's error body", function()
            api._set_http_client_for_test({
                request = function(): (any, any) return nil, errors.new({ kind = errors.UNAVAILABLE, message = "dial tcp: refused" }) end,
            })
            local res, err = api.request({ api_key = "pat" }, "GET", "/crm/v3/objects/contacts", nil)
            test.is_nil(res)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            api._set_http_client_for_test({
                request = function(): (any, any)
                    return { status_code = 400, body = '{"status":"error","message":"Property values were not valid","category":"VALIDATION_ERROR"}' }, nil
                end,
            })
            local rejected = api.get({ api_key = "pat" }, "/crm/v3/objects/contacts", nil)
            api._set_http_client_for_test(nil)
            test.is_false(rejected.success)
            test.eq(rejected.error, "Property values were not valid")
            test.eq(rejected.data.category, "VALIDATION_ERROR")
        end)

        test.it("extracts HubSpot paging cursors", function()
            test.eq(api.next_after({ paging = { next = { after = "abc" } } }), "abc")
            test.is_nil(api.next_after({ results = {} }))
        end)

        test.it("builds per-object GTE incremental search bodies", function()
            local body = api.incremental_search_body("contacts", { "email", "lastmodifieddate" }, "2026-06-01T10:00:00Z", 25, "cursor")
            test.eq(body.limit, 25)
            test.eq(body.after, "cursor")
            test.eq(body.sorts[1].propertyName, "lastmodifieddate")
            local filter = body.filterGroups[1].filters[1]
            test.eq(filter.propertyName, "lastmodifieddate")
            test.eq(filter.operator, "GTE")
            test.eq(filter.value, "1780308000000")

            local companies = api.incremental_search_body("companies", { "name", "hs_lastmodifieddate" }, nil, nil, nil)
            test.eq(companies.sorts[1].propertyName, "hs_lastmodifieddate")

            local override = api.incremental_search_body("contacts", { "email", "custom_modified_at" }, "100", 10, nil, "custom_modified_at")
            test.eq(override.sorts[1].propertyName, "custom_modified_at")
            test.eq(override.filterGroups[1].filters[1].propertyName, "custom_modified_at")
        end)

        test.it("batch-reads selected properties for stable object ids", function()
            local captured: CapturedRequest? = nil
            api._set_http_client_for_test({
                request = function(method: string, url: string, opts: any): (any, string?)
                    captured = { method = method, url = url, body = opts.body }
                    return { status_code = 200, body = '{"results":[]}' }, nil
                end,
            })
            local res = api.batch_read_objects(
                { api_key = "pat" },
                "contacts",
                { "10", "", "20" },
                { "email", "custom_score" }
            )
            api._set_http_client_for_test(nil)
            test.eq(res.success, true)
            if captured == nil then error("expected a captured request", 0) end
            local request = captured :: CapturedRequest
            test.eq(request.method, "POST")
            test.is_true(request.url:find("/crm/v3/objects/contacts/batch/read", 1, true) ~= nil)
            local body = json.decode(request.body)
            test.eq(#body.inputs, 2)
            test.eq(body.inputs[1].id, "10")
            test.eq(body.properties[2], "custom_score")
        end)

        test.it("batch-reads v4 associations with per-object cursors and accepts multi-status", function()
            local captured: CapturedRequest? = nil
            api._set_http_client_for_test({
                request = function(method: string, url: string, opts: any): (any, string?)
                    captured = { method = method, url = url, body = opts.body }
                    return { status_code = 207, body = '{"results":[],"numErrors":0}' }, nil
                end,
            })
            local res = api.batch_read_associations(
                { api_key = "pat" },
                "contacts",
                "custom/type",
                { { id = "10", after = "next page" }, { id = "20" } }
            )
            api._set_http_client_for_test(nil)

            test.eq(res.success, true)
            test.eq(res.status_code, 207)
            if captured == nil then error("expected a captured request", 0) end
            local request = captured :: CapturedRequest
            test.eq(request.method, "POST")
            test.is_true(request.url:find("/crm/v4/associations/contacts/custom%%2Ftype/batch/read") ~= nil, request.url)
            local body = json.decode(request.body)
            test.eq(body.inputs[1].id, "10")
            test.eq(body.inputs[1].after, "next page")
            test.eq(body.inputs[2].id, "20")
            test.is_nil(body.inputs[2].after)
        end)

        test.it("rejects empty and oversized association batches before transport", function()
            local empty = api.batch_read_associations({ api_key = "pat" }, "contacts", "companies", {})
            test.eq(empty.success, false)
            test.is_true(empty.error:find("at least one", 1, true) ~= nil)

            local inputs: { types.AssociationInput } = {}
            for index = 1, 1001 do inputs[index] = { id = tostring(index) } end
            local oversized = api.batch_read_associations({ api_key = "pat" }, "contacts", "companies", inputs)
            test.eq(oversized.success, false)
            test.is_true(oversized.error:find("1000", 1, true) ~= nil)

            local malformed_input: unknown = { "10" }
            local malformed = api.batch_read_associations(
                { api_key = "pat" },
                "contacts",
                "companies",
                malformed_input :: { types.AssociationInput }
            )
            test.eq(malformed.success, false)
            test.is_true(malformed.error:find("requires a non-empty string id", 1, true) ~= nil)
        end)

        test.it("reads pipeline catalogs only for supported CRM object types", function()
            local captured: CapturedRequest? = nil
            api._set_http_client_for_test({
                request = function(method: string, url: string, opts: any): (any, string?)
                    captured = { method = method, url = url, body = opts.body }
                    return { status_code = 200, body = '{"results":[]}' }, nil
                end,
            })
            local result = api.list_pipelines({ api_key = "pat" }, "deals")
            api._set_http_client_for_test(nil)

            test.eq(result.success, true)
            if captured == nil then error("expected a captured request", 0) end
            test.eq((captured :: CapturedRequest).method, "GET")
            test.is_true((captured :: CapturedRequest).url:find("/crm/v3/pipelines/deals", 1, true) ~= nil)

            local invalid = api.list_pipelines({ api_key = "pat" }, "unsupported")
            test.eq(invalid.success, false)
            test.eq(invalid.status_code, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
