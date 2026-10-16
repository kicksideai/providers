local test = require("test")
local registry = require("registry")

local CANONICAL_WRITABLE_OPS: { [string]: boolean } = {
    upsert = true,
    delete = true,
    list_keys = true,
}

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function implements(entry: any, contract_id: string, method: string): boolean
    local contracts = value(entry, "contracts")
    if type(contracts) ~= "table" then return false end
    for _, declaration in ipairs(contracts) do
        if type(declaration) == "table"
            and declaration.contract == contract_id
            and type(declaration.methods) == "table"
            and type(declaration.methods[method]) == "string"
            and declaration.methods[method] ~= ""
        then
            return true
        end
    end
    return false
end

local function define_tests()
    test.describe("HubSpot writable port ABI", function()
        test.it("declares only canonical writable operations", function()
            local port = get("kickside.hubspot.sink:crm")
            local ops = value(port, "operations")
            test.not_nil(ops)

            for op, _ in pairs(ops) do
                test.is_true(CANONICAL_WRITABLE_OPS[tostring(op)] == true, "non-canonical op: " .. tostring(op))
            end
            test.not_nil(ops.upsert)
            test.not_nil(ops.delete)
            test.is_nil(ops.create)
            test.is_nil(ops.update)
            test.is_nil(ops.log_activity)
        end)

        test.it("binds the port to the canonical writable contract", function()
            local binding = get("kickside.hubspot.sink:crm_sink")
            local metadata = value(binding, "meta")
            test.eq(metadata.delivery, "at_most_once")
            test.eq(metadata.input_shape, "record")
            local port = get("kickside.hubspot.sink:crm")
            test.eq(value(port, "binding"), "kickside.hubspot.sink:crm_sink")
            test.is_true(implements(binding, "kickside.data:writable", "write"))
            test.not_nil(value(port, "input_schema"))
            test.not_nil(value(port, "output_schema"))
            test.not_nil(value(port, "config_schema"))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
