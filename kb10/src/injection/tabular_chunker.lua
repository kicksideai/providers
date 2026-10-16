-- Tabular planning inside the source materializer. Converted spreadsheets keep
-- their Markdown preview; only known spreadsheet sources use this row iterator.
-- chunk_size is the existing character budget. Byte bounds are conservative for
-- Unicode and include the sheet heading, row identity, headers and separators.
local M = {}

type ChunkMeta = {
    contextual_prefix: string?,
    row_summary: boolean?,
    attribute_columns: {{name: integer, value: integer}}?,
    sheet_name: string,
    header_row: integer,
    row_start: integer,
    row_end: integer,
    column_start: integer?,
    column_end: integer?,
    cell_part: integer?,
    columns: {integer}?,
    empty_columns: {integer}?,
}
type Sheet = { name: string, header_row: integer, headers: {string}, column_offset: integer }

local EXTENSIONS = { xlsx = true, xls = true, xlsb = true, ods = true, csv = true }
local MIMES = {
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx",
    ["application/vnd.ms-excel"] = "xls",
    ["application/vnd.ms-excel.sheet.binary.macroenabled.12"] = "xlsb",
    ["application/vnd.oasis.opendocument.spreadsheet"] = "ods",
    ["text/csv"] = "csv",
    ["application/csv"] = "csv",
}
local function trim(s: string): string
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end
local function source_format(doc: any): (string?, string)
    local meta = type(doc.metadata) == "table" and doc.metadata or {}
    local filename = tostring(meta.original_filename or meta.filename or doc.title or "")
    local ext = filename:lower():match("%.([%w]+)$")
    if ext and EXTENSIONS[ext] then return ext, filename end
    local mime = tostring(meta.original_mime_type or meta.source_mime or doc.content_type or ""):lower():match("^[^;]+") or ""
    return MIMES[mime], filename
end

-- Decode only escaped table delimiters. Count backslashes so a literal slash
-- before a delimiter does not incorrectly merge two columns.
local function markdown_cells(line: string): {string}
    local out: {string} = {}
    local start = 2
    local slashes = 0
    for i = 2, #line do
        local c = line:sub(i, i)
        if c == "|" and slashes % 2 == 0 then
            out[#out + 1] = trim(line:sub(start, i - 1)):gsub("\\([\\|])", "%1")
            start = i + 1
        end
        if c == "\\" then slashes = slashes + 1 else slashes = 0 end
    end
    if trim(line:sub(start)) ~= "" then out[#out + 1] = trim(line:sub(start)) end
    return out
end
local function escape(s: string): string
    return (s:gsub("\\", "\\\\"):gsub("|", "\\|"):gsub("\r\n", "\n"):gsub("[\r\n]", "<br>"))
end
local function table_line(cells: {string}, first: integer, last: integer): string
    local rendered: {string} = {}
    for i = first, last do rendered[#rendered + 1] = escape(cells[i] or "") end
    return "| " .. table.concat(rendered, " | ") .. " |"
end
local function header(sheet: Sheet, first: integer, last: integer): string
    local separators: {string} = {}
    for _ = first, last do separators[#separators + 1] = "---" end
    return table_line(sheet.headers, first, last) .. "\n| " .. table.concat(separators, " | ") .. " |\n"
end
local function sheet_heading(sheet: Sheet): string
    return "## " .. escape(sheet.name) .. "\n\n"
end

-- The first column identifies the record even when the relevant attribute sits
-- at the far end of a wide row. Never silently truncate that identity.
local function row_identity(sheet: Sheet, cells: {string}, row: integer, size: integer): string
    local out = "Row " .. tostring(row)
    local identity = "; " .. escape(sheet.headers[1]) .. ": " .. escape(cells[1] or "")
    if #out + #identity <= size / 3 then out = out .. identity end
    for i = 2, #sheet.headers do
        local key = sheet.headers[i]:lower():gsub("[_ ]", "")
        if key == "name" or key == "productname" or key == "shortdesc" then
            local description = "; " .. escape(sheet.headers[i]) .. ": " .. escape(cells[i] or "")
            if #out + #description <= size / 3 then out = out .. description end
            break
        end
    end
    return out .. "\n\n"
end
-- Named attribute pairs are a common wide-sheet representation. A bounded
-- semantic projection makes these values searchable without discarding any of
-- the original physical cells, which remain in the normal row fragments.
local function attribute_summary(sheet: Sheet, cells: {string}, size: integer): ({string}, {{{name: integer, value: integer}}})
    local identity = ""
    local seen: {[string]: boolean} = {}
    for i, label in ipairs(sheet.headers) do
        local key = label:lower():gsub("[^%w]", "")
        local value = cells[i] or ""
        if value ~= "" and not seen[value] and (i == 1 or key == "sku" or key == "partnumber"
            ) then
            local entry = escape(label) .. ": " .. escape(value) .. "\n"
            if #identity + #entry <= size / 3 then identity = identity .. entry; seen[value] = true end
        end
    end
    local prefix = sheet_heading(sheet) .. identity .. "\n"
    local value_columns: {[string]: integer} = {}
    for i, label in ipairs(sheet.headers) do
        local number = label:upper():gsub("_", " "):match("^ATTR VALUE(%d+)$")
        if number then value_columns[number] = i end
    end
    local texts: {string} = {}
    local maps: {{{name: integer, value: integer}}} = {}
    local labels: {string} = {}
    local values: {string} = {}
    local mapping: {{name: integer, value: integer}} = {}
    local function render(): string
        local separators: {string} = {}
        for _ = 1, #labels do separators[#separators + 1] = "---" end
        return prefix .. table_line(labels, 1, #labels) .. "\n" .. table_line(separators, 1, #labels)
            .. "\n" .. table_line(values, 1, #values)
    end
    local function flush_summary()
        if #labels == 0 then return end
        texts[#texts + 1] = render()
        maps[#maps + 1] = mapping
        labels = {}; values = {}; mapping = {}
    end
    for i, label in ipairs(sheet.headers) do
        local number = label:upper():gsub("_", " "):match("^ATTR NAME(%d+)$")
        local column = number and value_columns[number] or nil
        if column and (cells[i] or "") ~= "" and (cells[column] or "") ~= "" then
            labels[#labels + 1] = cells[i]; values[#values + 1] = cells[column]
            if #render() > size then
                labels[#labels] = nil; values[#values] = nil
                flush_summary()
                labels[1] = cells[i]; values[1] = cells[column]
            end
            if #render() <= size then
                mapping[#mapping + 1] = {name = i + sheet.column_offset, value = column + sheet.column_offset}
            else
                -- This pair is already retained in lossless cell fragments.
                labels = {}; values = {}; mapping = {}
            end
        end
    end
    flush_summary()
    return texts, maps
end
local function unicode_end(s: string, start: integer, budget: integer): integer
    local last = math.min(#s, start + budget - 1)
    while last >= start and last < #s do
        local next_byte = string.byte(s, last + 1) or 0
        if next_byte < 128 or next_byte >= 192 then break end
        last = last - 1
    end
    return last
end

-- CSV yields one logical record at a time, including quoted multiline fields.
-- It deliberately does not infer CSV from arbitrary prose or comma-containing text.
local function csv_records(body: string): any
    local pos = body:sub(1, 3) == "\239\187\191" and 4 or 1
    return function(): ({string}?, string?)
        if pos > #body then return nil, nil end
        local cells: {string} = {}
        local parts: {string} = {}
        local quoted = false
        local closed = false
        while pos <= #body do
            local c = body:sub(pos, pos)
            pos = pos + 1
            if quoted then
                if c == '"' then
                    if body:sub(pos, pos) == '"' then
                        parts[#parts + 1] = '"'
                        pos = pos + 1
                    else quoted = false; closed = true end
                else parts[#parts + 1] = c end
            elseif c == '"' and #parts == 0 and not closed then
                quoted = true
            elseif c == "," or c == "\n" or c == "\r" then
                cells[#cells + 1] = table.concat(parts)
                parts = {}
                closed = false
                if c ~= "," then
                    if c == "\r" and body:sub(pos, pos) == "\n" then pos = pos + 1 end
                    return cells, nil
                end
            elseif closed or c == '"' then
                return nil, "invalid CSV quoting"
            else parts[#parts + 1] = c end
        end
        if quoted then return nil, "unterminated CSV field" end
        cells[#cells + 1] = table.concat(parts)
        return cells, nil
    end
end

-- nil chunks means prose: the caller keeps the existing prose splitter. An
-- identified but malformed spreadsheet returns an error, never a prose fallback.
function M.chunk_document(doc: any, size: integer): ({string}?, {ChunkMeta}?, string?)
    local format, filename = source_format(doc)
    if not format then return nil, nil, nil end
    local body = doc.content or ""
    local chunks: {string} = {}
    local metadata: {ChunkMeta} = {}
    local current: Sheet? = nil
    local group: {string} = {}
    local group_bytes = 0
    local group_start = 0
    local group_end = 0
    local row = 0

    local function emit(content: string, sheet: Sheet, first_row: integer, last_row: integer, first_col: integer?, last_col: integer?, part: integer?)
        local range = first_row == last_row and "row " .. tostring(first_row)
            or "rows " .. tostring(first_row) .. "–" .. tostring(last_row)
        chunks[#chunks + 1] = content
        metadata[#metadata + 1] = {
            contextual_prefix = "Sheet " .. sheet.name .. ", " .. range .. ".",
            sheet_name = sheet.name, header_row = sheet.header_row,
            row_start = first_row, row_end = last_row,
            column_start = first_col and first_col + sheet.column_offset or nil,
            column_end = last_col and last_col + sheet.column_offset or nil,
            cell_part = part,
        }
    end
    local function flush(sheet: Sheet)
        if #group == 0 then return end
        emit(sheet_heading(sheet) .. header(sheet, 1, #sheet.headers) .. table.concat(group, "\n"), sheet, group_start, group_end, nil, nil, nil)
        group = {}
        group_bytes = 0
    end
    local function split_row(sheet: Sheet, cells: {string}, number: integer): string?
        local prefix = sheet_heading(sheet) .. row_identity(sheet, cells, number, size)
        local selected: {integer} = {}
        for i = 1, #sheet.headers do
            if (cells[i] or "") ~= "" then selected[#selected + 1] = i end
        end
        local function project(first: integer, last: integer): string
            local headers: {string} = {}
            local values: {string} = {}
            local separators: {string} = {}
            for j = first, last do
                local i = selected[j]
                headers[#headers + 1] = sheet.headers[i]
                values[#values + 1] = cells[i]
                separators[#separators + 1] = "---"
            end
            return prefix .. table_line(headers, 1, #headers) .. "\n" .. table_line(separators, 1, #headers) .. "\n" .. table_line(values, 1, #headers)
        end
        local function positions(first: integer, last: integer, column_start: integer, column_end: integer)
            local meta = metadata[#metadata]
            meta.columns = {}
            meta.empty_columns = {}
            for j = first, last do meta.columns[#meta.columns + 1] = selected[j] + sheet.column_offset end
            for i = column_start, column_end do
                if (cells[i] or "") == "" then meta.empty_columns[#meta.empty_columns + 1] = i + sheet.column_offset end
            end
        end
        if #selected == 0 then
            local content = prefix .. header(sheet, 1, 1) .. table_line(cells, 1, 1)
            if #content > size then return "spreadsheet header exceeds chunk budget" end
            emit(content, sheet, number, number, 1, #sheet.headers, nil)
            positions(1, 0, 1, #sheet.headers)
            metadata[#metadata].columns = { 1 + sheet.column_offset }
            return nil
        end
        local first = 1
        local column_start = 1
        while first <= #selected do
            local last = first
            local candidate = project(first, last)
            local column = selected[first]
            if #candidate > size then
                local value = cells[column]
                local base = prefix .. header(sheet, column, column)
                local available = size - #base - 4
                if available < 4 then return "spreadsheet header or row identity exceeds chunk budget" end
                local start = 1
                local part = 1
                while start <= #value do
                    local finish = unicode_end(value, start, available)
                    if finish < start then return "spreadsheet cell cannot fit chunk budget" end
                    local fragment = value:sub(start, finish)
                    while #base + #escape(fragment) + 4 > size and finish >= start do
                        finish = unicode_end(value, start, finish - start)
                        fragment = value:sub(start, finish)
                    end
                    if finish < start then return "spreadsheet cell cannot fit chunk budget" end
                    local column_end = first == #selected and #sheet.headers or column
                    emit(base .. "| " .. escape(fragment) .. " |", sheet, number, number, column_start, column_end, part)
                    positions(first, first, column_start, column_end)
                    column_start = column
                    start = finish + 1
                    part = part + 1
                end
            else
                while last < #selected do
                    local next_candidate = project(first, last + 1)
                    if #next_candidate > size then break end
                    last = last + 1
                    candidate = next_candidate
                end
                -- Keep a populated ATTR NAME/ATTR VALUE pair together when it
                -- fits by itself. This is a cell boundary choice, not a parser
                -- for the catalog: ordinary column names need no special handling.
                if last < #selected and last > first then
                    local name_index = sheet.headers[selected[last]]:match("^ATTR NAME(%d+)$")
                    local value_index = sheet.headers[selected[last + 1]]:match("^ATTR VALUE(%d+)$")
                    if name_index and name_index == value_index and #project(last, last + 1) <= size then
                        last = last - 1
                        candidate = project(first, last)
                    end
                end
                local column_end = last == #selected and #sheet.headers or selected[last]
                emit(candidate, sheet, number, number, column_start, column_end, nil)
                positions(first, last, column_start, column_end)
            end
            column_start = selected[last] + 1
            first = last + 1
        end
        local summaries, mappings = attribute_summary(sheet, cells, size)
        for i, content in ipairs(summaries) do
            emit(content, sheet, number, number, nil, nil, nil)
            metadata[#metadata].row_summary = true
            metadata[#metadata].attribute_columns = mappings[i]
        end
        return nil
    end
    local function add_row(sheet: Sheet, cells: {string}): string?
        row = row + 1
        if #cells > #sheet.headers then return "spreadsheet row has more cells than its header" end
        local rendered = table_line(cells, 1, #sheet.headers)
        local base = sheet_heading(sheet) .. header(sheet, 1, #sheet.headers)
        if #base + #rendered > size then
            flush(sheet)
            return split_row(sheet, cells, row)
        end
        if #group > 0 and #base + group_bytes + 1 + #rendered > size then flush(sheet) end
        if #group == 0 then group_start = row end
        group_end = row
        group_bytes = group_bytes + (#group > 0 and 1 or 0) + #rendered
        group[#group + 1] = rendered
        return nil
    end
    if format == "csv" then
        local records = csv_records(body)
        local headers, err = records()
        if err then return nil, nil, err end
        if not headers then return {}, {}, nil end
        current = { name = filename:gsub("^.*[/\\]", ""):gsub("%.[^.]+$", ""), header_row = 1, headers = headers, column_offset = 0 }
        if current.name == "" then current.name = "Sheet1" end
        for i, name in ipairs(headers) do if name == "" then headers[i] = "Column " .. tostring(i) end end
        row = 1
        while true do
            local cells, read_err = records()
            if read_err then return nil, nil, read_err end
            if not cells then break end
            local row_err = add_row(current, cells)
            if row_err then return nil, nil, row_err end
        end
        flush(current)
    else
        local name = "Sheet1"
        local header_row = 1
        local column_offset: integer = 0
        local pending: {string}? = nil
        for line in (body .. "\n"):gmatch("([^\n]*)\n") do
            line = line:gsub("\r$", "")
            local heading = line:match("^## (.+)$")
            local physical_row, physical_column = line:match("^<!%-%- kickside:sheet header%-row=(%d+) column%-start=(%d+) %-%->$")
            local simple_row = line:match("^<!%-%- kickside:sheet header%-row=(%d+) %-%->$")
            if heading then
                if current then flush(current) end
                name = heading
                current = nil
                pending = nil
                header_row = 1
                column_offset = 0
            elseif physical_row or simple_row then
                header_row = tonumber(physical_row or simple_row) :: integer
                column_offset = math.floor((tonumber(physical_column) or 1) - 1)
            elseif line:match("^|.*|%s*$") then
                local cells = markdown_cells(line)
                if not pending and not current then
                    pending = cells
                elseif pending then
                    for _, cell in ipairs(cells) do
                        if not cell:match("^:?-+:?$") then return nil, nil, "invalid spreadsheet header separator" end
                    end
                    current = { name = name, header_row = header_row, headers = pending, column_offset = column_offset }
                    for i, value in ipairs(pending) do
                        if value == "" then pending[i] = "Column " .. tostring(i + column_offset) end
                    end
                    pending = nil
                    row = header_row
                else
                    local row_err = add_row(current :: Sheet, cells)
                    if row_err then return nil, nil, row_err end
                end
            elseif trim(line) ~= "" then
                return nil, nil, "unexpected content in converted spreadsheet"
            end
        end
        if pending then return nil, nil, "spreadsheet is missing a header separator" end
        if current then flush(current) end
    end
    return chunks, metadata, nil
end
return M
