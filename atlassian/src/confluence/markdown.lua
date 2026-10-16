-- Confluence storage format (XHTML with ac:/ri: elements) to Markdown. Keeps the
-- document structure: headings, paragraphs, emphasis, links, lists, task lists,
-- tables, block quotes, code blocks (including the code macro), images,
-- emoticons and page links. Macro parameters are configuration, not content, so
-- their text is left out; macro bodies render in place.

local M = {}

local NAMED_ENTITIES: { [string]: string } = {
    amp = "&", lt = "<", gt = ">", quot = '"', apos = "'", nbsp = " ",
    rsquo = "’", lsquo = "‘", rdquo = "”", ldquo = "“", mdash = "—", ndash = "–",
    hellip = "…", bull = "•", middot = "·", laquo = "«", raquo = "»", times = "×",
    copy = "©", reg = "®", trade = "™", deg = "°", euro = "€", pound = "£",
}

local function utf8_char(code: integer): string
    if code < 0x80 then return string.char(code) end
    if code < 0x800 then
        return string.char(0xC0 + math.floor(code / 0x40), 0x80 + code % 0x40)
    end
    if code < 0x10000 then
        return string.char(0xE0 + math.floor(code / 0x1000), 0x80 + math.floor(code / 0x40) % 0x40, 0x80 + code % 0x40)
    end
    return string.char(0xF0 + math.floor(code / 0x40000), 0x80 + math.floor(code / 0x1000) % 0x40,
        0x80 + math.floor(code / 0x40) % 0x40, 0x80 + code % 0x40)
end

local function decode_entities(s: string): string
    return (s:gsub("&(#?[xX]?)(%w+);", function(prefix: string, name: string): string?
        if prefix == "#" then
            local code = tonumber(name)
            return code and utf8_char(math.floor(code)) or nil
        end
        if prefix == "#x" or prefix == "#X" then
            local code = tonumber(name, 16)
            return code and utf8_char(math.floor(code)) or nil
        end
        if prefix == "" then return NAMED_ENTITIES[name] end
        return nil
    end))
end

local function attributes(raw: string): { [string]: string }
    local attrs: { [string]: string } = {}
    for name, quote, value in raw:gmatch('([%w:%-_]+)%s*=%s*(["\'])(.-)%2') do
        attrs[name:lower()] = decode_entities(value)
    end
    return attrs
end

local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local HEADINGS: { [string]: string } = { h1 = "#", h2 = "##", h3 = "###", h4 = "####", h5 = "#####", h6 = "######" }
local INLINE_MARKS: { [string]: string } = { strong = "**", b = "**", em = "_", i = "_", s = "~~", del = "~~" }

type Frame = {
    tag: string,
    parts: { string },
    attrs: { [string]: string },
    cells: { string }?,
    rows: { { string } }?,
    language: string?,
}

-- Converts one storage-format document to Markdown.
function M.from_storage(storage: any): string
    if type(storage) ~= "string" or storage == "" then return "" end
    local source = storage :: string

    -- Fenced code is kept verbatim: it is stored aside and spliced back after
    -- whitespace normalization of the surrounding text.
    local verbatim: { string } = {}
    local function keep(text: string): string
        verbatim[#verbatim + 1] = text
        return "\1" .. tostring(#verbatim) .. "\1"
    end

    local stack: { Frame } = { { tag = "#root", parts = {}, attrs = {} } }
    local lists: { { kind: string, index: integer } } = {}
    local function top(): Frame return stack[#stack] end
    local function emit(text: string) local parts = top().parts; parts[#parts + 1] = text end
    local function within(tag: string): Frame?
        for index = #stack, 1, -1 do
            if stack[index].tag == tag then return stack[index] end
        end
        return nil
    end
    local function push(tag: string, attrs: { [string]: string }): Frame
        local frame: Frame = { tag = tag, parts = {}, attrs = attrs }
        stack[#stack + 1] = frame
        return frame
    end
    local function pop(tag: string): Frame?
        if not within(tag) then return nil end
        while #stack > 1 do
            local frame = table.remove(stack) :: Frame
            if frame.tag == tag then return frame end
            local parts = top().parts
            parts[#parts + 1] = table.concat(frame.parts)
        end
        return nil
    end
    local function in_cell(): boolean return within("td") ~= nil or within("th") ~= nil end
    local function block_break(): string return in_cell() and " " or "\n\n" end

    local function open(tag: string, attrs: { [string]: string }, self_closing: boolean)
        if within("ac:parameter") then return end
        if HEADINGS[tag] then
            emit(block_break() .. HEADINGS[tag] .. " ")
        elseif tag == "p" or tag == "div" then
            if #lists == 0 then emit(block_break()) end
        elseif tag == "br" then
            emit(in_cell() and " " or "\n")
        elseif tag == "hr" then
            emit("\n\n---\n\n")
        elseif INLINE_MARKS[tag] then
            emit(INLINE_MARKS[tag])
        elseif tag == "code" and not within("pre") then
            emit("`")
        elseif tag == "a" then
            push("a", attrs)
        elseif tag == "ul" or tag == "ol" or tag == "ac:task-list" then
            lists[#lists + 1] = { kind = tag, index = 0 }
        elseif tag == "li" or tag == "ac:task" then
            local list = lists[#lists]
            local indent = string.rep("  ", math.max(#lists - 1, 0))
            if list and list.kind == "ol" then
                list.index = list.index + 1
                emit("\n" .. indent .. tostring(list.index) .. ". ")
            elseif tag == "li" then
                emit("\n" .. indent .. "- ")
            else
                push("ac:task", attrs)
            end
        elseif tag == "blockquote" or tag == "pre" or tag == "td" or tag == "th" or tag == "ac:task-status" or tag == "ac:parameter" or tag == "ac:link" or tag == "ac:task-body" then
            push(tag, attrs)
        elseif tag == "tr" then
            local frame = push("tr", attrs)
            frame.cells = {}
        elseif tag == "table" then
            local frame = push("table", attrs)
            frame.rows = {}
        elseif tag == "ac:structured-macro" then
            push("ac:structured-macro", attrs)
        elseif tag == "ac:plain-text-body" then
            push("ac:plain-text-body", attrs)
        elseif tag == "ri:page" or tag == "ri:blog-post" then
            local link = within("ac:link")
            if link then link.attrs.title = attrs["ri:content-title"] end
        elseif tag == "ri:attachment" then
            local link = within("ac:link")
            if link then link.attrs.title = attrs["ri:filename"] end
            local image = within("ac:image")
            if image then image.attrs.src = attrs["ri:filename"] end
        elseif tag == "ri:url" then
            local image = within("ac:image")
            if image then image.attrs.src = attrs["ri:value"] end
        elseif tag == "ri:user" then
            local link = within("ac:link")
            if link then link.attrs.title = "@" .. (attrs["ri:username"] or attrs["ri:account-id"] or attrs["ri:userkey"] or "") end
        elseif tag == "ac:image" then
            local frame = push("ac:image", attrs)
            if self_closing then
                pop("ac:image")
                emit("![" .. (frame.attrs["ac:alt"] or "") .. "](" .. (frame.attrs.src or "") .. ")")
            end
        elseif tag == "img" then
            emit("![" .. (attrs.alt or "") .. "](" .. (attrs.src or "") .. ")")
        elseif tag == "ac:emoticon" then
            emit(attrs["ac:emoji-fallback"] or (":" .. (attrs["ac:name"] or "") .. ":"))
        end
    end

    local function close(tag: string)
        if tag == "ac:parameter" then
            local frame = pop("ac:parameter")
            local macro = within("ac:structured-macro")
            if frame and macro and frame.attrs["ac:name"] == "language" then
                macro.language = trim(table.concat(frame.parts))
            end
            return
        end
        if within("ac:parameter") then return end
        if HEADINGS[tag] or tag == "p" or tag == "div" then
            if #lists == 0 then emit(block_break()) end
        elseif INLINE_MARKS[tag] then
            emit(INLINE_MARKS[tag])
        elseif tag == "code" and not within("pre") then
            emit("`")
        elseif tag == "a" then
            local frame = pop("a")
            if frame then
                local label = trim(table.concat(frame.parts))
                local href = frame.attrs.href
                if href and href ~= "" then
                    emit("[" .. (label ~= "" and label or href) .. "](" .. href .. ")")
                else
                    emit(label)
                end
            end
        elseif tag == "ac:link" then
            local frame = pop("ac:link")
            if frame then
                local label = trim(table.concat(frame.parts))
                emit(label ~= "" and label or (frame.attrs.title or ""))
            end
        elseif tag == "ul" or tag == "ol" or tag == "ac:task-list" then
            table.remove(lists)
            if #lists == 0 then emit(block_break()) end
        elseif tag == "ac:task-status" then
            local frame = pop("ac:task-status")
            local task = within("ac:task")
            if frame and task then task.attrs.status = trim(table.concat(frame.parts)) end
        elseif tag == "ac:task-body" then
            local frame = pop("ac:task-body")
            local task = within("ac:task")
            if frame and task then task.attrs.body = trim(table.concat(frame.parts)) end
        elseif tag == "ac:task" then
            local frame = pop("ac:task")
            if frame then
                local indent = string.rep("  ", math.max(#lists - 1, 0))
                local mark = frame.attrs.status == "complete" and "[x]" or "[ ]"
                emit("\n" .. indent .. "- " .. mark .. " " .. (frame.attrs.body or ""))
            end
        elseif tag == "blockquote" then
            local frame = pop("blockquote")
            if frame then
                local body = trim(table.concat(frame.parts)):gsub("\n", "\n> ")
                emit("\n\n> " .. body .. "\n\n")
            end
        elseif tag == "pre" then
            local frame = pop("pre")
            if frame then
                emit("\n\n" .. keep("```\n" .. decode_entities(table.concat(frame.parts)) .. "\n```") .. "\n\n")
            end
        elseif tag == "ac:plain-text-body" then
            local frame = pop("ac:plain-text-body")
            local macro = within("ac:structured-macro")
            if frame and macro then macro.attrs.body = table.concat(frame.parts) end
        elseif tag == "ac:structured-macro" then
            local frame = pop("ac:structured-macro")
            if frame then
                if frame.attrs["ac:name"] == "code" or frame.attrs["ac:name"] == "noformat" then
                    emit("\n\n" .. keep("```" .. (frame.language or "") .. "\n" .. (frame.attrs.body or "") .. "\n```") .. "\n\n")
                else
                    emit(table.concat(frame.parts))
                end
            end
        elseif tag == "td" or tag == "th" then
            local frame = pop(tag)
            local row = within("tr")
            if frame and row and row.cells then
                local cell = trim((table.concat(frame.parts):gsub("%s+", " "))):gsub("|", "\\|")
                row.cells[#row.cells + 1] = cell
            end
        elseif tag == "tr" then
            local frame = pop("tr")
            local tbl = within("table")
            if frame and tbl and tbl.rows then tbl.rows[#tbl.rows + 1] = frame.cells or {} end
        elseif tag == "table" then
            local frame = pop("table")
            if frame and frame.rows and #frame.rows > 0 then
                local width = 0
                for _, row in ipairs(frame.rows) do width = math.max(width, #row) end
                local lines: { string } = {}
                for index, row in ipairs(frame.rows) do
                    local cells: { string } = {}
                    for column = 1, width do cells[column] = row[column] or "" end
                    lines[#lines + 1] = "| " .. table.concat(cells, " | ") .. " |"
                    if index == 1 then lines[#lines + 1] = "|" .. string.rep(" --- |", width) end
                end
                emit("\n\n" .. table.concat(lines, "\n") .. "\n\n")
            end
        elseif tag == "ac:image" then
            local frame = pop("ac:image")
            if frame then emit("![" .. (frame.attrs["ac:alt"] or "") .. "](" .. (frame.attrs.src or "") .. ")") end
        end
    end

    local function text(raw: string)
        if within("ac:parameter") then
            emit(decode_entities(raw))
        elseif within("pre") then
            emit(raw)
        else
            emit((decode_entities(raw):gsub("%s+", " ")))
        end
    end

    local position = 1
    while position <= #source do
        local start = source:find("<", position, true)
        if not start then
            text(source:sub(position))
            break
        end
        if start > position then text(source:sub(position, start - 1)) end
        if source:sub(start, start + 8) == "<![CDATA[" then
            local finish = source:find("]]>", start + 9, true) or (#source + 1)
            emit(source:sub(start + 9, finish - 1))
            position = finish + 3
        elseif source:sub(start, start + 3) == "<!--" then
            local finish = source:find("-->", start + 4, true) or (#source + 1)
            position = finish + 3
        else
            local finish = source:find(">", start, true)
            if not finish then
                text(source:sub(start))
                break
            end
            local inner = source:sub(start + 1, finish - 1)
            local closing, name, rest = inner:match("^(/?)([%w:%-_]+)(.*)$")
            if name then
                local tag = name:lower()
                if closing == "/" then
                    close(tag)
                else
                    local self_closing = rest:match("/%s*$") ~= nil
                    open(tag, attributes(rest), self_closing)
                    if self_closing and tag ~= "ac:image" then close(tag) end
                end
            end
            position = finish + 1
        end
    end
    while #stack > 1 do
        local frame = table.remove(stack) :: Frame
        local parts = top().parts
        parts[#parts + 1] = table.concat(frame.parts)
    end

    local out = table.concat(stack[1].parts)
    out = out:gsub("[ \t]+\n", "\n"):gsub("\n[ \t]+([^ \t%-%d>|])", "\n%1"):gsub("\n\n\n+", "\n\n")
    out = trim(out)
    out = out:gsub("\1(%d+)\1", function(index: string): string return verbatim[tonumber(index) :: integer] end)
    return out
end

return M
