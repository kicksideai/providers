local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local json = require("json")

local function caller(): any
    local actor, actor_err = security.new_actor("fixture", {})
    if actor_err then error(tostring(actor_err)) end
    local policies = {}
    for _, id in ipairs({ "app:request_scope", "app:private_scope" }) do
        local policy, err = security.policy(id)
        if err then error(tostring(err)) end
        policies[#policies + 1] = policy
    end
    local scope, scope_err = security.new_scope(policies)
    if scope_err then error(tostring(scope_err)) end
    return funcs.new():with_actor(actor):with_scope(scope)
end

local function define_tests()
    test.describe("subject-only WebScout agent calls", function()
        test.it("declares only the subject as required on each tool", function()
            for tool, subject in pairs({ read = "url", links = "url", search = "query" }) do
                local entry, err = registry.get("kickside.webscout.traits:" .. tool)
                test.is_nil(err)
                local schema, decode_err = json.decode(entry.meta.input_schema)
                test.is_nil(decode_err)
                test.eq(#schema.required, 1)
                test.eq(schema.required[1], subject)
            end
        end)

        test.it("reads a native page when the agent supplies only its URL", function()
            local entry, entry_err = registry.get("app:fixture")
            test.is_nil(entry_err)
            local content, err = caller():call("kickside.webscout.traits:read", { url = entry.data.url })
            test.is_nil(err)
            test.contains(content, "NORTHWIND-NATIVE-731")
        end)

        test.it("extracts native links when the agent supplies only the page URL", function()
            local entry, entry_err = registry.get("app:fixture")
            test.is_nil(entry_err)
            local links, err = caller():call("kickside.webscout.traits:links", { url = entry.data.url })
            test.is_nil(err)
            test.is_true(links.absolute_only)
            test.eq(links.total_links, 1)
            test.eq(links.links[1], entry.data.url:match("^https?://[^/]+") .. "/orders")
        end)
    end)
end

return { run = test.run_cases(define_tests) }
