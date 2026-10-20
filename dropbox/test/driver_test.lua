local test = require("test")
local service = require("service")
local driver = require("driver")
local registry = require("registry")
local json = require("json")
local types = require("types")
local upstream = require("upstream")
local function cases()
    test.describe("Dropbox API contracts", function()
        test.it("publishes separate public reader/writer capabilities", function()
            for _, direction in ipairs({"reader", "writer"}) do
                local row, err = registry.get("kickside.dropbox.traits:" .. direction)
                test.is_nil(err)
                test.eq(row.meta.type, "agent.trait")
                test.eq(row.meta.provider, "dropbox")
                test.eq(row.meta.public, true)
            end
        end)
        test.it("publishes OAuth and access-token authentication without binaries", function()
            local oauth = registry.get("kickside.dropbox.oauth:provider")
            test.eq(oauth.data.connector_contract.implementation_id, "kickside.oauth:base_connector")
            local binding = registry.get("kickside.dropbox.connection:connection")
            test.eq(binding.meta.credential_schema.fields[1].type, "password")
        end)
        test.it("rejects a write through a read capability before resolving credentials", function()
            local client = {connect = function() error("must not resolve credentials") end}
            local run = service.new({client = client}).run
            for name, operation in pairs(service.config.operations) do
                if operation.write then
                    local result, err = run(name, {}, nil, false)
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INVALID))
                end
            end
        end)
        test.it("rejects unknown fields before resolving credentials", function()
            local client = {connect = function() error("must not resolve credentials") end}
            local run = service.new({client = client}).run
            for name, operation in pairs(service.config.operations) do
                local result, err = run(name, {__unexpected = "https://attacker.test"}, nil, operation.write)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INVALID))
            end
        end)
        test.it("matches upstream API/content routing and RPC body conventions", function()
            for name, operation in pairs(service.config.operations) do
                local contract = upstream[name]
                test.not_nil(contract)
                test.eq(operation.path, contract.path)
                test.eq(operation.endpoint or "api", contract.endpoint)
                if contract.mode ~= "rpc" then test.eq(operation.mode, contract.mode) end
                if contract.null_body then test.eq(operation.mode, "null") end
            end
        end)
        test.it("keeps the tool and runtime schemas identical for every action", function()
            local count = 0
            for _, direction in ipairs({"read", "write"}) do
                local tool = registry.get("kickside.dropbox.traits:" .. direction .. "_tool")
                local schema = json.decode(tool.meta.input_schema)
                for _, variant in ipairs(schema.oneOf) do
                    local name = variant.properties.action.enum[1]
                    local operation = service.config.operations[name]
                    test.not_nil(operation)
                    test.eq(operation.write, direction == "write")
                    test.eq(json.encode(variant.properties.params), json.encode(operation.schema))
                    count = count + 1
                end
            end
            test.eq(count, 34)
        end)
    end)
end
return {run = test.run_cases(cases)}
