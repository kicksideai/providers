local test = require("test")
local adapter = require("adapter")
local dependency = require("dependency")
local canonical_json = require("canonical_json")
local function encode(value: any): string
    local encoded, err = canonical_json.encode(value)
    test.is_nil(err)
    test.not_nil(encoded)
    return encoded :: string
end
local http = require("http")
local security = require("security")

local function exercise(failure, expected_status)
    local status, response
    local http_double = {
        request = function() return {
            param = function() return "addressed-id" end,
            is_content_type = function() return true end,
            body_json = function() return { filename = "file", size = 1 } end,
        } end,
        response = function() return {
            set_content_type = function() end,
            set_status = function(_, value) status = value end,
            write_json = function(_, value) response = value end,
        } end,
        CONTENT = http.CONTENT, STATUS = http.STATUS,
    }
    local security_double = { actor = function() return { id = function() return "http-test-user" end } end,
        scope = function() return {} end }
    local dependency_double = { ACCESS = dependency.ACCESS, validate_access = function() return nil, failure end }
    local instance = adapter.new({ http = http_double, security = security_double, component = dependency_double })
    instance.handler()
    test.eq(status, expected_status)
    local expected = { success = false, error = tostring(failure) }
    
    test.eq(encode(response), encode(expected))
end

return test.run_cases(function()
    test.describe("HTTP adapter error matrix", function()
        for _, row in ipairs({ { errors.INVALID, 400 }, { errors.PERMISSION_DENIED, 403 }, { errors.NOT_FOUND, 404 },
            { errors.CONFLICT, 409 }, { errors.ALREADY_EXISTS, 409 }, { errors.UNAVAILABLE, 503 },
            { errors.RATE_LIMITED, 429 }, { errors.TIMEOUT, 504 }, { errors.CANCELED, 500 },
            { errors.INTERNAL, 500 }, { errors.UNKNOWN, 500 } }) do
            test.it("preserves the complete envelope for " .. row[1], function()
                exercise(errors.new({ kind = row[1], message = "opaque", retryable = true,
                    details = { marker = "adapter" } }), row[2])
                exercise(errors.wrap(errors.new({ kind = row[1], message = "not found permission denied" }), "context"), row[2])
            end)
        end
        test.it("returns 500 for plain machine codes and misleading prose", function()
            for _, value in ipairs({ "bad_request", "forbidden", "not_found", "conflict", "server_error", "widget not found permission denied" }) do
                exercise(value, 500)
            end
        end)
    end)
end)
