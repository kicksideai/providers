-- Tabular planning inside the source materializer. Converted spreadsheets keep
-- their Markdown preview; only known spreadsheet sources use this row iterator.
-- chunk_size is the existing character budget. Byte bounds are conservative for
-- Unicode and include the sheet heading, row identity, headers and separators.
local M = {}
local records = require("tabular_records")

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
type Reader = (integer, integer) -> (string?, any?)
type Emitter = (string, ChunkMeta) -> any?
type Checkpoint = {
    format: string,
    size: integer,
    offset: integer,
    max_record_bytes: integer?,
    sheet: Sheet?,
    name: string,
    header_row: integer,
    column_offset: integer,
    pending: {string}?,
    row: integer,
    group: {string},
    group_bytes: integer,
    group_start: integer,
    group_end: integer,
}
type PlanOptions = {
    checkpoint: Checkpoint?,
    should_pause: (() -> boolean)?,
    max_record_bytes: integer?,
}

local EXTENSIONS = { xlsx = true, xls = true, xlsb = true, ods = true, csv = true }
local MIMES = {
    ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = "xlsx",
    ["application/vnd.ms-excel"] = "xls",
    ["application/vnd.ms-excel.sheet.binary.macroenabled.12"] = "xlsb",
    ["application/vnd.oasis.opendocument.spreadsheet"] = "ods",
    ["text/csv"] = "csv",
    ["application/csv"] = "csv",
}
local trim = require("text_trim").trim
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
    local delimiter = line:find("|", start, true)
    while delimiter do
        local before = delimiter
        while before > start and line:byte(before - 1) == 92 do before = before - 1 end
        if (delimiter - before) % 2 == 0 then
            out[#out + 1] = trim(line:sub(start, delimiter - 1)):gsub("\\([\\|])", "%1")
            start = delimiter + 1
        end
        delimiter = line:find("|", delimiter + 1, true)
    end
    local tail = trim(line:sub(start))
    if tail ~= "" then out[#out + 1] = tail end
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

local function copy_strings(values: {string}): {string}
    local copy: {string} = {}
    for i, value in ipairs(values) do copy[i] = value end
    return copy
end

-- Resume reads the same immutable bytes at the returned offset. A record
-- budget also bounds the decoded header or row. The sink commits its staged
-- chunks together with the returned checkpoint after a successful call.
function M.plan_document(doc: any, size: integer, read: Reader, emit: Emitter, options: PlanOptions?):
        (boolean?, Checkpoint?, any?)
    local format, filename = source_format(doc)
    if not format then return false, nil, nil end
    local checkpoint = options and options.checkpoint
    local max_record_bytes = options and options.max_record_bytes
    if max_record_bytes ~= nil and (type(max_record_bytes) ~= "number" or max_record_bytes < 1
        or math.tointeger(max_record_bytes) == nil) then
        return nil, nil, "spreadsheet record byte budget must be a positive integer"
    end
    local offset = 0
    if checkpoint then
        if checkpoint.format ~= format or checkpoint.size ~= size then
            return nil, nil, "spreadsheet checkpoint format or chunk size changed"
        end
        if checkpoint.max_record_bytes ~= max_record_bytes then return nil, nil, "spreadsheet checkpoint record budget changed" end
        if type(checkpoint.offset) ~= "number" or checkpoint.offset < 0 or math.tointeger(checkpoint.offset) == nil then
            return nil, nil, "invalid spreadsheet checkpoint offset"
        end
        offset = checkpoint.offset
    end
    local input = records.open(read, offset, max_record_bytes)
    local current: Sheet? = checkpoint and checkpoint.sheet or nil
    local group: {string} = checkpoint and copy_strings(checkpoint.group) or {}
    local group_bytes = checkpoint and checkpoint.group_bytes or 0
    local group_start = checkpoint and checkpoint.group_start or 0
    local group_end = checkpoint and checkpoint.group_end or 0
    local row = checkpoint and checkpoint.row or 0
    local name = checkpoint and checkpoint.name or "Sheet1"
    local header_row = checkpoint and checkpoint.header_row or 1
    local column_offset = checkpoint and checkpoint.column_offset or 0
    local pending: {string}? = checkpoint and checkpoint.pending and copy_strings(checkpoint.pending) or nil
    local should_pause = options and options.should_pause

    local function lineage(sheet: Sheet, first_row: integer, last_row: integer, first_col: integer?, last_col: integer?, part: integer?): ChunkMeta
        local range = first_row == last_row and "row " .. tostring(first_row)
            or "rows " .. tostring(first_row) .. "–" .. tostring(last_row)
        return {
            contextual_prefix = "Sheet " .. sheet.name .. ", " .. range .. ".",
            sheet_name = sheet.name, header_row = sheet.header_row,
            row_start = first_row, row_end = last_row,
            column_start = first_col and first_col + sheet.column_offset or nil,
            column_end = last_col and last_col + sheet.column_offset or nil,
            cell_part = part,
        }
    end
    local function flush(sheet: Sheet): any?
        if #group == 0 then return nil end
        local err = emit(sheet_heading(sheet) .. header(sheet, 1, #sheet.headers) .. table.concat(group, "\n"),
            lineage(sheet, group_start, group_end, nil, nil, nil))
        if err then return err end
        group = {}
        group_bytes = 0
        return nil
    end
    local function split_row(sheet: Sheet, cells: {string}, number: integer): any?
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
        local function positions(meta: ChunkMeta, first: integer, last: integer, column_start: integer, column_end: integer)
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
            local meta = lineage(sheet, number, number, 1, #sheet.headers, nil)
            positions(meta, 1, 0, 1, #sheet.headers)
            meta.columns = { 1 + sheet.column_offset }
            return emit(content, meta)
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
                    local meta = lineage(sheet, number, number, column_start, column_end, part)
                    positions(meta, first, first, column_start, column_end)
                    local emit_err = emit(base .. "| " .. escape(fragment) .. " |", meta)
                    if emit_err then return emit_err end
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
                local meta = lineage(sheet, number, number, column_start, column_end, nil)
                positions(meta, first, last, column_start, column_end)
                local emit_err = emit(candidate, meta)
                if emit_err then return emit_err end
            end
            column_start = selected[last] + 1
            first = last + 1
        end
        local summaries, mappings = attribute_summary(sheet, cells, size)
        for i, content in ipairs(summaries) do
            local meta = lineage(sheet, number, number, nil, nil, nil)
            meta.row_summary = true
            meta.attribute_columns = mappings[i]
            local emit_err = emit(content, meta)
            if emit_err then return emit_err end
        end
        return nil
    end
    local function add_row(sheet: Sheet, cells: {string}): any?
        row = row + 1
        if #cells > #sheet.headers then return "spreadsheet row has more cells than its header" end
        local rendered = table_line(cells, 1, #sheet.headers)
        local base = sheet_heading(sheet) .. header(sheet, 1, #sheet.headers)
        if #base + #rendered > size then
            local err = flush(sheet)
            if err then return err end
            return split_row(sheet, cells, row)
        end
        if #group > 0 and #base + group_bytes + 1 + #rendered > size then
            local err = flush(sheet)
            if err then return err end
        end
        if #group == 0 then group_start = row end
        group_end = row
        group_bytes = group_bytes + (#group > 0 and 1 or 0) + #rendered
        group[#group + 1] = rendered
        return nil
    end
    local function begin_sheet(headers: {string}, sheet_name: string)
        for i, value in ipairs(headers) do
            if value == "" then headers[i] = "Column " .. tostring(i + column_offset) end
        end
        current = { name = sheet_name, header_row = header_row, headers = headers, column_offset = column_offset }
        row = header_row
    end

    while true do
        if should_pause and should_pause() then
            return true, { format = format, size = size, offset = input.offset(), max_record_bytes = max_record_bytes,
                sheet = current, name = name,
                header_row = header_row, column_offset = column_offset, pending = pending, row = row,
                group = group, group_bytes = group_bytes, group_start = group_start, group_end = group_end }, nil
        end
        if format == "csv" then
            local cells, read_err = input.csv()
            if read_err then return nil, nil, read_err end
            if not cells then break end
            if current then
                local row_err = add_row(current, cells)
                if row_err then return nil, nil, row_err end
            else
                local sheet_name = filename:gsub("^.*[/\\]", ""):gsub("%.[^.]+$", "")
                begin_sheet(cells, sheet_name ~= "" and sheet_name or "Sheet1")
            end
        else
            local record, read_err = input.markdown()
            if read_err then return nil, nil, read_err end
            if not record then break end
            local line = record:gsub("\r$", "")
            local heading = line:match("^## (.+)$")
            local physical_row, physical_column = line:match("^<!%-%- kickside:sheet header%-row=(%d+) column%-start=(%d+) %-%->$")
            local simple_row = line:match("^<!%-%- kickside:sheet header%-row=(%d+) %-%->$")
            if heading then
                if current then
                    local flush_err = flush(current)
                    if flush_err then return nil, nil, flush_err end
                end
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
                    begin_sheet(pending, name)
                    pending = nil
                else
                    local row_err = add_row(current :: Sheet, cells)
                    if row_err then return nil, nil, row_err end
                end
            elseif trim(line) ~= "" then
                return nil, nil, "unexpected content in converted spreadsheet"
            end
        end
    end
    if pending then return nil, nil, "spreadsheet is missing a header separator" end
    if current then
        local flush_err = flush(current)
        if flush_err then return nil, nil, flush_err end
    end
    return true, nil, nil
end

-- nil chunks means prose. An identified but malformed spreadsheet returns an
-- error so its caller can preserve the source for an ordinary retry.
function M.chunk_document(doc: any, size: integer): ({string}?, {ChunkMeta}?, string?)
    local body = doc.content or ""
    local chunks: {string} = {}
    local metadata: {ChunkMeta} = {}
    local tabular, _, err = M.plan_document(doc, size, function(offset, length)
        return body:sub(offset + 1, offset + length), nil
    end, function(text, meta)
        chunks[#chunks + 1] = text
        metadata[#metadata + 1] = meta
        return nil
    end)
    if not tabular then return nil, nil, err end
    return chunks, metadata, nil
end
return M
