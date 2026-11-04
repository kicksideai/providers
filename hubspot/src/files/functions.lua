local fetcher = require("fetcher")
local refs = require("refs")

-- parse_refs({value}) -> {refs = {{ref}}, skipped} or {error}.
local function parse_refs(args: any): any
    local value = type(args) == "table" and args.value or nil
    local parsed, err = refs.parse(value)
    if err then return { error = err } end
    return parsed
end

return {
    fetch_attachment = fetcher.fetch_attachment,
    parse_refs = parse_refs,
}
