-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local registry = require("registry")

local function mutate(): any
    local echo = assert(registry.get("app:stub_echo_tool"))
    echo.meta.input_schema = 42
    local promoted = assert(registry.get("app:stub_catalog_mutation"))
    promoted.id = "app:stub_promoted_tool"
    local created = assert(registry.get("app:stub_catalog_mutation"))
    created.id = "app:stub_created_tool"
    local changes = assert(registry.snapshot()):changes()
    changes:update(echo)
    changes:update(promoted)
    changes:create(created)
    assert(changes:apply())
    return true
end

return { mutate = mutate }
