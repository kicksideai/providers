-- Generic OIDC's own enable validation, declaratively wired to its `enabled`
-- setting. The shared gate also blocks enabling until the issuer is configured.
local gate = require("sso_provider_gate")

local function validate(args)
    return gate.check("oidc", args)
end

return { validate = validate }
