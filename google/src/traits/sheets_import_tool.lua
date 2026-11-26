-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local transport = require("transport")
local sheets = require("sheets")
local store = require("store")
local ctx = require("ctx")
local uuid = require("uuid")
local time = require("time")
local tool_result = require("tool_result")

local function trim(value: any): string
    return type(value) == "string" and (value:gsub("^%s+", ""):gsub("%s+$", "")) or ""
end

local function spreadsheet_id(value: any): string?
    local text = trim(value)
    if text:match("^[%w_-]+$") then return text end
    return text:match("^https://docs%.google%.com/spreadsheets/d/([%w_-]+)[/#?]")
        or text:match("^https://docs%.google%.com/spreadsheets/d/([%w_-]+)$")
end

local function is_date(value: string): boolean
    local year, month, day = value:match("^(%d%d%d%d)%-(%d%d)%-(%d%d)$")
    if not year then return false end
    local y, m, d = tonumber(year), tonumber(month), tonumber(day)
    if y < 1 or m < 1 or m > 12 then return false end
    local days = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
    if y % 4 == 0 and (y % 100 ~= 0 or y % 400 == 0) then days[2] = 29 end
    return d >= 1 and d <= days[m]
end

local function cell_type(value: any): string?
    if value == nil or (type(value) == "string" and trim(value) == "") then return nil end
    if type(value) == "number" then
        if value ~= value or math.abs(value) == math.huge then return "invalid" end
        return value % 1 == 0 and "integer" or "number"
    end
    if type(value) == "boolean" then return "boolean" end
    if type(value) == "string" then return is_date(value) and "date" or "string" end
    return "invalid"
end

local function format_range(values: any, resolved_range: any): (string?, string?)
    if type(values) ~= "table" or type(values[1]) ~= "table" or #values[1] == 0 or #values < 2 then return nil, nil end
    -- Values.get resolves sheet names, named ranges and offsets into an A1 range.
    if type(resolved_range) ~= "string" or not resolved_range:match("^.+![A-Z]+%d+") then
        return nil, "Google did not return the resolved A1 range"
    end
    return resolved_range, nil
end

local function serial_text(value: number, kind: string): string?
    if value < -693593 or value >= 2958466 then return nil end
    -- Sheets serials count days since 1899-12-30. Storage moments have no zone.
    local serial_day = math.floor(value)
    local seconds = (serial_day - 25569) * 86400
    if kind ~= "date" then
        seconds = seconds + math.min(math.floor((value - serial_day) * 86400 + 0.5), 86399)
    end
    local moment = time.unix(seconds, 0):utc()
    local day = moment:format("2006-01-02")
    if not is_date(day) then return nil end
    return kind == "date" and day or day .. "T" .. moment:format("15:04:05")
end

local function profile(values: any, formats: any): (any?, string?)
    if type(values) ~= "table" or type(values[1]) ~= "table" or #values[1] == 0 then
        return nil, "The range needs a header row"
    end
    local fields, names, rows = {}, {}, {}
    local sheet = formats and formats.sheets and formats.sheets[1]
    local grid = sheet and sheet.data and sheet.data[1]
    local format_rows = grid and grid.rowData or {}
    for index, raw in ipairs(values[1]) do
        local label = trim(raw)
        if label == "" then return nil, "Header " .. tostring(index) .. " is empty" end
        local name = label:lower():gsub("[^a-z0-9_]+", "_"):gsub("^_+", ""):gsub("_+$", "")
        if name == "" then return nil, "Header " .. tostring(index) .. " needs a field name with Latin letters or digits" end
        if not name:match("^[a-z]") then name = "field_" .. name end
        if names[name] then return nil, "Duplicate field name after normalization: " .. name end
        names[name] = true
        fields[index] = {name = name, label = label, nullable = true}
    end
    for index = 2, #values do
        local source = values[index]
        if type(source) ~= "table" then return nil, "Invalid row " .. tostring(index) end
        if #source > #fields then return nil, "Row " .. tostring(index) .. " has values without headers" end
        local row, populated = {}, false
        local cells = format_rows[index] and format_rows[index].values or {}
        for column, field in ipairs(fields) do
            local value = source[column]
            local inferred = cell_type(value)
            if inferred == "invalid" then return nil, "Invalid cell in row " .. tostring(index) end
            local format = cells[column] and cells[column].effectiveFormat
            local kind = format and format.numberFormat and format.numberFormat.type
            if type(value) == "number" and (kind == "DATE" or kind == "DATE_TIME") then
                inferred = kind == "DATE" and "date" or "datetime"
                value = serial_text(value, inferred)
                if not value then return nil, "Invalid date in row " .. tostring(index) end
            end
            if inferred then
                populated = true
                row[field.name] = value
                if not field.type then field.type = inferred
                elseif field.type ~= inferred then
                    if (field.type == "integer" and inferred == "number") or (field.type == "number" and inferred == "integer") then
                        field.type = "number"
                    else field.type = "string" end
                end
            end
        end
        if populated then rows[#rows + 1] = row end
    end
    for _, field in ipairs(fields) do
        if field.type == "string" then
            for _, row in ipairs(rows) do
                if row[field.name] ~= nil then
                    local value = tostring(row[field.name])
                    row[field.name] = value
                    local _, length = value:gsub("[^\128-\191]", "")
                    field.max_length = math.max(field.max_length or 0, length)
                end
            end
        end
    end
    return {fields = fields, rows = rows}, nil
end

local function checked(result: any, err: error?, step: string): (any?, any?)
    if err then return nil, err end
    if type(result) ~= "table" then
        return nil, errors.new({kind = errors.UNAVAILABLE, message = step .. " returned no answer"})
    end
    if result.success ~= true then
        local problem = result.error
        local message = type(problem) == "table" and problem.message or problem
        return nil, tool_result.domain_error(step .. ": " .. tostring(message or "request refused"))
    end
    return result, nil
end

local function failed(problem: any): (any?, error?)
    if type(problem) == "table" and problem.success == false then return problem, nil end
    return nil, problem
end

local function problem_text(problem: any): string
    return type(problem) == "table" and tostring(problem.error) or tostring(problem)
end

local function discard(receiver: any, load_id: string, problem: any): (any?, error?)
    local result, err = receiver:discard({load_id = load_id})
    local cleaned, cleanup_problem = checked(result, err, "discard")
    if not cleaned then
        return tool_result.domain_error(problem_text(problem) .. "; cleanup failed: " .. problem_text(cleanup_problem))
    end
    return failed(problem)
end

local function handler(args: any): (any?, error?)
    if type(args) ~= "table" then return tool_result.domain_error("Import arguments are required") end
    local id = spreadsheet_id(args.spreadsheet)
    if not id then return tool_result.domain_error("spreadsheet must be a Google Sheets ID or URL") end
    local dataset = args.dataset
    if type(dataset) ~= "table" or type(dataset.code) ~= "string" or not dataset.code:match("^[a-z][a-z0-9_]*$") or trim(dataset.title) == "" then
        return tool_result.domain_error("dataset needs a lowercase code and a title")
    end
    if args.mode ~= "replace" and args.mode ~= "append" then return tool_result.domain_error("mode must be replace or append") end
    if args.range ~= nil and trim(args.range) == "" then return tool_result.domain_error("range must be a nonempty A1 range") end
    if args.sheet ~= nil and trim(args.sheet) == "" then return tool_result.domain_error("sheet must be a nonempty sheet name") end
    if args.range and args.sheet then return tool_result.domain_error("Use range or sheet, not both") end

    local administrator, admin_err = store.open("administrator")
    if not administrator then return nil, admin_err end
    local receiver, receiver_err = store.open("receiver")
    if not receiver then return nil, receiver_err end
    local selected = ctx.get("connection_id")
    local conn, conn_err = transport.connect(type(selected) == "string" and selected ~= "" and selected or nil)
    if not conn then return nil, conn_err end
    local range, formats = args.range, nil
    if not range then
        -- A sheetless A1 range selects the first visible sheet without a metadata call.
        range = args.sheet and "'" .. args.sheet:gsub("'", "''") .. "'" or "A:ZZZ"
    end
    local response, read_err = sheets.read_range(conn, id, range, {
        majorDimension = "ROWS", valueRenderOption = "UNFORMATTED_VALUE", dateTimeRenderOption = "SERIAL_NUMBER",
    })
    if not response then return nil, read_err end
    if not response.success then return tool_result.domain_error(response.error) end
    local values = response.data and response.data.values
    local resolved, range_err = format_range(values, response.data and response.data.range)
    if range_err then return tool_result.domain_error(range_err) end
    if resolved then
        local answer, format_err = sheets.get_spreadsheet(conn, id, {
            ranges = resolved, fields = "sheets.data.rowData.values.effectiveFormat.numberFormat.type",
        })
        if not answer then return nil, format_err end
        if not answer.success then return tool_result.domain_error(answer.error) end
        formats = answer.data
    end
    local data, profile_err = profile(values, formats)
    if not data then return tool_result.domain_error(profile_err) end
    if args.mode == "replace" and #data.rows == 0 then
        return tool_result.domain_error("The range has no data rows; replace was refused and the existing rows were kept")
    end

    local listing, list_err = receiver:list({query = dataset.code})
    local listed, list_problem = checked(listing, list_err, "list")
    if not listed then return failed(list_problem) end
    local existing_target, existing = nil, {}
    for _, candidate in ipairs(listed.targets or {}) do
        if candidate.id:match(":([^:]+)$") == dataset.code then
            if existing_target then return tool_result.domain_error("More than one store target matches " .. dataset.code) end
            existing_target = candidate.id
        end
    end
    if existing_target then
        local description, describe_err = receiver:describe({target = existing_target})
        local described, describe_problem = checked(description, describe_err, "describe")
        if not described then return failed(describe_problem) end
        for _, column in ipairs(described.columns or {}) do existing[column.name] = column end
    end

    local vocabulary, types_err = administrator:types({})
    local types, types_problem = checked(vocabulary, types_err, "types")
    if not types then return failed(types_problem) end
    local has_datetime = false
    for _, candidate in ipairs(types.types or {}) do
        if candidate.bulk_writable ~= false and candidate.coerces_to == "datetime" then has_datetime = true; break end
    end
    if not has_datetime then
        for _, field in ipairs(data.fields) do
            if field.type == "datetime" then
                field.type = "date"
                for _, row in ipairs(data.rows) do
                    if row[field.name] ~= nil then row[field.name] = row[field.name]:sub(1, 10) end
                end
            end
        end
    end
    local columns = {}
    for _, field in ipairs(data.fields) do
        local held = existing[field.name]
        if held then
            if held.type == "string" then
                for _, row in ipairs(data.rows) do
                    if row[field.name] ~= nil then
                        local value = tostring(row[field.name])
                        row[field.name] = value
                        local _, length = value:gsub("[^\128-\191]", "")
                        field.max_length = math.max(field.max_length or 0, length)
                    end
                end
                local limit = held.options and held.options.max_length
                if type(limit) == "number" and (field.max_length or 0) > limit then
                    local supported = false
                    for _, candidate in ipairs(types.types or {}) do
                        local properties = candidate.options_schema and candidate.options_schema.properties or {}
                        local length = properties.max_length
                        if candidate.bulk_writable ~= false and candidate.coerces_to == "string" and length
                            and field.max_length <= (length.maximum or math.huge) then
                            supported = true
                            break
                        end
                    end
                    if not supported then return tool_result.domain_error("The store cannot widen field '" .. field.name .. "' to " .. tostring(field.max_length) .. " characters") end
                    local options = {}
                    for key, value in pairs(held.options) do options[key] = value end
                    options.max_length = field.max_length
                    columns[#columns + 1] = {name = field.name, options = options}
                end
            elseif field.type and held.type ~= field.type and not (held.type == "number" and field.type == "integer") then
                return tool_result.domain_error("Field '" .. field.name .. "' contains " .. field.type .. " values but the existing field is " .. held.type)
            end
            field.type, field.nullable = held.type, held.nullable
        else
            field.type = field.type or "string"
            local chosen, options = nil, nil
            for _, candidate in ipairs(types.types or {}) do
                if candidate.bulk_writable ~= false and candidate.coerces_to == field.type then
                    local properties = candidate.options_schema and candidate.options_schema.properties or {}
                    local length = properties.max_length
                    if not length or (field.max_length or 0) <= (length.maximum or math.huge) then
                        chosen = candidate
                        if length then options = {max_length = math.max(field.max_length or 0, length.default or length.minimum or 1)} end
                        break
                    end
                end
            end
            if not chosen then return tool_result.domain_error("The store has no writable type for field '" .. field.name .. "' (" .. field.type .. ")") end
            columns[#columns + 1] = {name = field.name, type = chosen.name, options = options, nullable = true, label = field.label}
        end
    end
    local result, define_err = administrator:define({code = not existing_target and dataset.code or nil,
        target = existing_target, title = trim(dataset.title), columns = #columns > 0 and columns or nil})
    local defined, define_problem = checked(result, define_err, "define")
    if not defined then return failed(define_problem) end
    local target = defined.target
    local description, describe_err = receiver:describe({target = target})
    local described, describe_problem = checked(description, describe_err, "describe")
    if not described then return failed(describe_problem) end
    local size = described.limits and described.limits.max_batch_rows
    if type(size) ~= "number" or size < 1 or size % 1 ~= 0 then return tool_result.domain_error("The store did not declare max_batch_rows") end

    local begun, begin_err = receiver:begin({run = {run_id = uuid.v4()}, targets = {{target = target}}})
    local opened, begin_problem = checked(begun, begin_err, "begin")
    if not opened then return failed(begin_problem) end
    local load_id, batches = opened.load_id, 0
    local index = 1
    repeat
        local batch = {}
        local last = math.min(index + size - 1, #data.rows)
        for position = index, last do batch[#batch + 1] = data.rows[position] end
        batches = batches + 1
        local appended, append_err = receiver:append({load_id = load_id, target = target, batch_index = batches, rows = batch})
        local accepted, append_problem = checked(appended, append_err, "append")
        if not accepted then return discard(receiver, load_id, append_problem) end
        index = last + 1
    until index > #data.rows
    local plan: any = {target = target, batches = batches}
    if args.mode == "replace" then plan.replace_scope = {all = true} end
    local committed, commit_err = receiver:commit({load_id = load_id, targets = {plan}})
    local completed, commit_problem = checked(committed, commit_err, "commit")
    if not completed then
        -- A transport failure leaves the commit outcome unknown. Do not discard it.
        if commit_err then return nil, commit_err end
        return discard(receiver, load_id, commit_problem)
    end
    local written = nil
    for _, outcome in ipairs(completed.targets or {}) do
        if outcome.target == target then
            if outcome.result == "noop" then return tool_result.domain_error("The store reported noop; no rows were imported") end
            written = outcome.inserted
        end
    end
    if written ~= #data.rows then return tool_result.domain_error("The store did not confirm the expected committed row count") end
    local preview = {}
    for position = 1, math.min(5, #data.rows) do preview[position] = data.rows[position] end
    return {success = true, dataset = {code = dataset.code, title = trim(dataset.title), target = target},
        rows = written, fields = data.fields, preview = preview}, nil
end

return {handler = handler}
