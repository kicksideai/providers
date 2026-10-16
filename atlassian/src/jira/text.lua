local M = {}

local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function render(node: any): string
    if type(node) ~= "table" then return "" end
    local typ = node.type
    local attrs: any = type(node.attrs) == "table" and node.attrs or {}
    if typ == "text" then return type(node.text) == "string" and node.text or "" end
    if typ == "hardBreak" then return "\n" end
    if typ == "mention" then return type(attrs.text) == "string" and attrs.text or "" end
    if typ == "emoji" then return type(attrs.text) == "string" and attrs.text or type(attrs.shortName) == "string" and attrs.shortName or "" end
    if typ == "inlineCard" or typ == "blockCard" then return type(attrs.url) == "string" and attrs.url or "" end
    if typ == "rule" then return "\n---\n" end
    local parts: { string } = {}
    for _, child in ipairs(type(node.content) == "table" and node.content or {}) do
        parts[#parts + 1] = render(child)
    end
    local body = table.concat(parts, "")
    if typ == "paragraph" or typ == "heading" or typ == "codeBlock" or typ == "blockquote" then return body .. "\n\n" end
    if typ == "listItem" then return "- " .. trim(body) .. "\n" end
    if typ == "bulletList" or typ == "orderedList" then return body .. "\n" end
    if typ == "tableCell" or typ == "tableHeader" then return trim(body) .. "\t" end
    if typ == "tableRow" then return body:gsub("\t$", "") .. "\n" end
    if typ == "table" then return body .. "\n" end
    return body
end

function M.render(value: any): string
    if type(value) == "string" then return value end
    return trim(render(value))
end

return M
