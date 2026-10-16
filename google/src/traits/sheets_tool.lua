local transport = require("transport")
local sheets = require("sheets")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    spreadsheet_id: string?,
    range: string?,
    values: { any }?,
    title: string?,
    max_results: number?,
    page_token: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

-- A failed Google answer is the tool's domain error carrying the failed Result:
-- Google's message, HTTP status and error body.
local function google_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function handler(args: Args): (any?, error?)
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action

    if action == "list_spreadsheets" then
        local r, r_err = sheets.list_spreadsheets(conn, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, spreadsheets = r.data and r.data.files or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "get_spreadsheet" then
        local spreadsheet_id = args.spreadsheet_id
        if not spreadsheet_id then return tool_result.domain_error("spreadsheet_id required") end
        local r, r_err = sheets.get_spreadsheet(conn, spreadsheet_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "read_range" then
        local spreadsheet_id = args.spreadsheet_id
        local range = args.range
        if not spreadsheet_id then return tool_result.domain_error("spreadsheet_id required") end
        if not range then return tool_result.domain_error("range required (A1 notation, e.g. \"Sheet1!A1:C10\")") end
        local r, r_err = sheets.read_range(conn, spreadsheet_id, range)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local data: any = r.data or {}
        return { success = true, range = data.range or range, major_dimension = data.majorDimension, values = data.values or {} }

    elseif action == "append_values" or action == "update_values" then
        local spreadsheet_id = args.spreadsheet_id
        local range = args.range
        local values = args.values
        if not spreadsheet_id then return tool_result.domain_error("spreadsheet_id required") end
        if not range then return tool_result.domain_error("range required (A1 notation)") end
        if type(values) ~= "table" or #values == 0 then
            return tool_result.domain_error("values required (array of rows, each row an array of cell values)")
        end
        local r, r_err
        if action == "append_values" then
            r, r_err = sheets.append_values(conn, spreadsheet_id, range, values)
        else
            r, r_err = sheets.update_values(conn, spreadsheet_id, range, values)
        end
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "create_spreadsheet" then
        local title = args.title
        if not title then return tool_result.domain_error("title required") end
        local r, r_err = sheets.create_spreadsheet(conn, title)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: list_spreadsheets, get_spreadsheet, read_range, append_values, update_values, create_spreadsheet")
    end
end

return { handler = handler }
