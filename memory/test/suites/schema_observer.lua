-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local implementation = require("implementation")
local script = require("script")
local ctx = require("ctx")

local M = { output_shape = implementation.output_shape, validate = implementation.validate }

function M.output_budget(schema: any, model: string): (integer?, error?)
    script.record(ctx.get("thread_id"), "bounded_schema", schema, {})
    return implementation.output_budget(schema, model)
end

return M
