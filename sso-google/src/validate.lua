-- Google's own enable validation, declaratively wired to its `enabled` setting
-- (validate_func). Composes the shared gate; a provider may add its own rules here.
local gate = require("sso_provider_gate")

local function validate(args)
    return gate.check("google", args)
end

return { validate = validate }
