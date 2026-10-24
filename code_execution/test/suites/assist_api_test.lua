-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- The endpoint's critical boundary is HTTP body -> generator args. In
-- particular, a caller-selected model must not be silently replaced before the
-- generator resolves its context window; omission must still leave the default
-- selection to the generator.

local test = require("test")
local json = require("json")
local assist = require("assist")
local fixture = require("fixture")

local GENERATE = "kickside.code_execution:generate_code"

local function exercise(body: any): any
    local encoded, err = json.encode(body)
    test.is_nil(err)
    fixture.reset(encoded)
    assist.handler()
    return fixture.captured()
end

local function define_tests()
    test.describe("code_execution assist HTTP adapter", function()
        test.it("passes the caller-selected model to the generator", function()
            local captured = exercise({ intent = "Return a Lua table", model = "tower-selected-model" })
            test.eq(captured.status, 200)
            test.eq(captured.response.validated, true)
            test.eq(#captured.calls, 1)
            test.eq(captured.calls[1].id, GENERATE)
            test.eq(captured.calls[1].args.model, "tower-selected-model")
        end)

        test.it("leaves model unset so the generator uses its documented default", function()
            local captured = exercise({ intent = "Return a Lua table" })
            test.eq(captured.status, 200)
            test.eq(#captured.calls, 1)
            test.is_nil(captured.calls[1].args.model)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
