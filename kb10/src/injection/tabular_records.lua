-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local M = {}

local BUFFER_SIZE = 64 * 1024
local CSV_CONTROL = '[,"\r\n]'

type Read = (integer, integer) -> (string?, any?)

-- The reader takes a zero-based offset and returns up to the requested bytes.
-- Only consumed bytes contribute to the returned record boundary.
function M.open(read: Read, offset: integer, record_limit: integer?)
    local buffer = ""
    local index = 1
    local eof = false
    local record_start = offset

    local function fill(minimum: integer): any?
        if #buffer - index + 1 >= minimum or eof then return nil end
        buffer = buffer:sub(index)
        index = 1
        while #buffer < minimum do
            local part, err = read(offset + #buffer, BUFFER_SIZE)
            if err then return err end
            if part == nil or part == "" then
                eof = true
                break
            end
            if type(part) ~= "string" or #part > BUFFER_SIZE then
                return "invalid spreadsheet reader response"
            end
            buffer = buffer .. part
        end
        return nil
    end

    local function advance(length: integer): any?
        if record_limit and offset + length - record_start > record_limit then
            return "spreadsheet record exceeds byte budget"
        end
        index = index + length
        offset = offset + length
        return nil
    end

    -- Consume a span before the first control byte, including that byte.
    local function scan(pattern: string): (string?, string?, any?)
        local parts: {string}? = nil
        while true do
            local read_err = fill(1)
            if read_err then return nil, nil, read_err end
            if index > #buffer then return parts and table.concat(parts) or "", nil, nil end
            local position = buffer:find(pattern, index)
            local boundary = position and buffer:sub(position, position) or nil
            local first = index
            local last = (position or #buffer + 1) - 1
            local span_length = last - first + 1
            local span_err = advance(span_length + (boundary and 1 or 0))
            if span_err then return nil, nil, span_err end
            local text = buffer:sub(first, last)
            if boundary and not parts then return text, boundary, nil end
            if not parts then parts = {} end
            parts[#parts + 1] = text
            if boundary then return table.concat(parts), boundary, nil end
        end
    end

    local function quoted_field(): (string?, string?, any?)
        local open_err = advance(1)
        if open_err then return nil, nil, open_err end
        local parts: {string} = {}
        while true do
            local text, quote, read_err = scan('"')
            if read_err then return nil, nil, read_err end
            if not quote then return nil, nil, "unterminated CSV field" end
            parts[#parts + 1] = text :: string
            local peek_err = fill(1)
            if peek_err then return nil, nil, peek_err end
            local next_byte = buffer:sub(index, index)
            if next_byte == '"' then
                local escaped_err = advance(1)
                if escaped_err then return nil, nil, escaped_err end
                parts[#parts + 1] = '"'
            else
                if next_byte == "" then return table.concat(parts), nil, nil end
                if next_byte ~= "," and next_byte ~= "\n" and next_byte ~= "\r" then
                    return nil, nil, "invalid CSV quoting"
                end
                local close_err = advance(1)
                if close_err then return nil, nil, close_err end
                return table.concat(parts), next_byte, nil
            end
        end
    end

    local function csv(): ({string}?, any?)
        if offset == 0 then
            local bom_err = fill(3)
            if bom_err then return nil, bom_err end
            if buffer:sub(1, 3) == "\239\187\191" then index, offset = 4, 3 end
        end
        local peek_err = fill(1)
        if peek_err then return nil, peek_err end
        if index > #buffer then return nil, nil end
        record_start = offset
        local cells: {string} = {}
        while true do
            local read_err = fill(1)
            if read_err then return nil, read_err end
            local value, delimiter, field_err
            if buffer:sub(index, index) == '"' then
                value, delimiter, field_err = quoted_field()
            else
                value, delimiter, field_err = scan(CSV_CONTROL)
            end
            if field_err then return nil, field_err end
            if delimiter == '"' then return nil, "invalid CSV quoting" end
            cells[#cells + 1] = value :: string
            if delimiter == "\r" then
                local tail_err = fill(1)
                if tail_err then return nil, tail_err end
                if buffer:sub(index, index) == "\n" then
                    local newline_err = advance(1)
                    if newline_err then return nil, newline_err end
                end
            end
            if delimiter ~= "," then return cells, nil end
        end
    end

    local function markdown(): (string?, any?)
        record_start = offset
        local line, _, err = scan("\n")
        if err or offset == record_start then return nil, err end
        return line, nil
    end

    return { csv = csv, markdown = markdown, offset = function() return offset end }
end

return M
