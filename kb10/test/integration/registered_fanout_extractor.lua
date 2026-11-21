-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function run(input)
    local text = input.event.body.text
    return {documents = {
        {title = "First", text = text .. " first", content = text .. " first", external_id = "first"},
        {title = "Second", text = text .. " second", content = text .. " second", external_id = "second"},
    }}
end

return {run = run}
