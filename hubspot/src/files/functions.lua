-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local fetcher = require("fetcher")
local refs = require("refs")

type ParseArgs = { value: unknown? }

-- parse_refs({value}) -> {refs = {{ref}}, skipped} or {error}.
local function parse_refs(args: unknown): refs.Parsed | { error: string }
    local input: ParseArgs = type(args) == "table" and (args :: ParseArgs) or {}
    local parsed, err = refs.parse(input.value)
    if err then return { error = err } end
    return parsed
end

return {
    fetch_attachment = fetcher.fetch_attachment,
    parse_refs = parse_refs,
}
