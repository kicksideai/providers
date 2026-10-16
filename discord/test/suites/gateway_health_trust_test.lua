local test = require("test")
local security = require("security")
local contract = require("contract")
local uuid = require("uuid")

local POLICY = "kickside.discord.gateway:gateway_health_trust"
local ACTION = "component.runtime_meta.write"

local function evaluate(meta: any): string
    local policy, err = security.policy(POLICY)
    if not policy then error("policy missing: " .. tostring(err)) end
    return policy:evaluate(security.new_actor("gateway", {}), ACTION, "component-1", meta)
end

local function define_tests()
    test.describe("Discord gateway runtime meta grant", function()
        local function service(actor_id: string, policy_ids: { string }): any
            local policies = {}
            for _, id in ipairs(policy_ids) do
                local policy, err = security.policy(id)
                test.is_nil(err, tostring(err))
                policies[#policies + 1] = policy
            end
            local def, err = contract.get("kickside.component:component_service")
            test.is_nil(err, tostring(err))
            local svc, open_err = def:with_actor(security.new_actor(actor_id, { security_groups = {} }))
                :with_scope(security.new_scope(policies)):open()
            test.is_nil(open_err, tostring(open_err))
            return svc
        end

        test.it("keeps existing Discord connections writable without public identity claims", function()
            local owner = service("owner-" .. uuid.v4(), { "app:user" })
            local target = owner:register({ impl_id = "kickside.discord.connection:discord_connection", meta = {} })
            test.is_true(target.success, tostring(target.error))
            local writer = service("gateway", { "app:runtime_meta_plumbing", POLICY })
            local result = writer:set_meta({ component_id = target.component_id,
                fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_true(result.success, tostring(result.error))
        end)

        test.it("refuses gateway writes after another component owner claims Discord identity", function()
            local owner = service("owner-" .. uuid.v4(), { "app:user" })
            local target = owner:register({ impl_id = "test:other_component", meta = {} })
            test.is_true(target.success, tostring(target.error))
            local claims = owner:set_meta({ component_id = target.component_id,
                fields = { class = "connection", provider = "discord" } })
            test.is_true(claims.success, tostring(claims.error))
            local writer = service("gateway", { "app:runtime_meta_plumbing", POLICY })
            local result = writer:set_meta({ component_id = target.component_id,
                fields = { health_state = "ready" }, trusted_runtime = true })
            test.is_false(result.success)
            test.eq(result.kind, errors.PERMISSION_DENIED)
        end)

        test.it("admits a Discord connection component", function()
            test.eq(evaluate({ class = "connection", provider = "discord" }), "allow")
        end)
        test.it("refuses a connection of another provider", function()
            test.neq(evaluate({ class = "connection", provider = "slack" }), "allow")
        end)
        test.it("refuses a Discord component that is not a connection", function()
            test.neq(evaluate({ class = "automation", provider = "discord" }), "allow")
        end)
        test.it("refuses a component that declares no attributes", function()
            test.neq(evaluate({}), "allow")
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
