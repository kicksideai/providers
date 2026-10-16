-- Stub tools for the code_execution suite. `echo` returns its args plus the actor id it
-- executed under, so the suite can prove a sandbox tool call runs as the ambient caller.
-- `secret` is a second real tool used only to prove that a registered tool outside the
-- whitelist is absent from the sandbox SDK.

local security = require("security")

local function echo(args: any): any
    local actor: any = security.actor()
    return { echoed = args, actor_id = actor and actor:id() or "" }
end

local function secret(_args: any): any
    return { ok = true }
end

return { echo = echo, secret = secret }
