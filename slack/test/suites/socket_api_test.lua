local test = require("test")
local socket_api = require("socket_api")

-- The only pure logic in the I/O layer is frame decode; apps.connections.open and
-- the socket send/recv are integration. decode is pinned here so the worker can
-- trust the envelope it receives.
local function define_tests()
    test.describe("socket_api", function()
        test.it("decodes a text frame into an envelope table", function()
            local p, err = socket_api.decode({ data = '{"type":"events_api","envelope_id":"e1"}' })
            test.is_nil(err)
            test.eq(p.type, "events_api")
            test.eq(p.envelope_id, "e1")
        end)

        test.it("decodes a bare string frame", function()
            local p, err = socket_api.decode('{"type":"hello"}')
            test.is_nil(err)
            test.eq(p.type, "hello")
        end)

        test.it("rejects a non-text frame", function()
            local p, err = socket_api.decode({ data = 123 })
            test.is_nil(p)
            test.ok(err:find("non-text", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
