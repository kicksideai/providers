local test = require("test")
local gateway_api = require("gateway_api")
local consts = require("consts")

-- The only pure logic in the I/O layer is url normalization (resume correctness)
-- and frame decode; both are pinned here. The socket send/recv is integration.
local function define_tests()
    test.describe("gateway_api", function()
        test.it("accepts the websocket close success with no return values", function()
            local _, err = gateway_api.close({ close = function() return end }, "stop")
            test.is_nil(err)
        end)
        test.it("returns the socket close failure", function()
            local _, err = gateway_api.close({ close = function() return nil, "close denied" end }, "stop")
            test.eq(err, "close denied")
        end)
        test.it("keeps the default gateway url (already has the query)", function()
            test.eq(gateway_api.normalize_url(nil), consts.gateway_url())
            test.eq(gateway_api.normalize_url(""), consts.gateway_url())
        end)

        test.it("adds the v10/json query to a bare resume url", function()
            test.eq(gateway_api.normalize_url("wss://g-east.discord.gg"), "wss://g-east.discord.gg/?v=10&encoding=json")
            test.eq(gateway_api.normalize_url("wss://g-east.discord.gg/"), "wss://g-east.discord.gg/?v=10&encoding=json")
        end)

        test.it("leaves a url that already carries a query untouched", function()
            test.eq(gateway_api.normalize_url("wss://x/?v=10&encoding=json"), "wss://x/?v=10&encoding=json")
        end)

        test.it("decodes a text frame into a payload table", function()
            local p, err = gateway_api.decode({ data = '{"op":10,"d":{"heartbeat_interval":30000}}' })
            test.is_nil(err)
            test.eq(p.op, 10)
            test.eq(p.d.heartbeat_interval, 30000)
        end)

        test.it("rejects a non-text frame", function()
            local p, err = gateway_api.decode({ data = 123 })
            test.is_nil(p)
            test.ok(err:find("non-text", 1, true) ~= nil)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
