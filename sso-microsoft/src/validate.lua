-- Microsoft's own enable validation, declaratively wired to its `enabled` setting.
local gate = require("sso_provider_gate")

local function validate(args)
    return gate.check("microsoft", args)
end

return { validate = validate }
