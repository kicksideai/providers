local endpoints = require("endpoints")
-- Google Sheets domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local sheets = {}

local function sheets_api(): string
    return endpoints.get("kickside.google:endpoints", "sheets")
end
local function drive_api(): string
    return endpoints.get("kickside.google:endpoints", "drive")
end
local DEFAULT_PAGE_SIZE = 20
local MAX_PAGE_SIZE = 100

function sheets.list_spreadsheets(conn: google_types.Connection, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = {
        q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields = "nextPageToken,files(" .. (fields or "id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress)") .. ")",
        pageSize = size,
        orderBy = "modifiedTime desc",
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, drive_api() .. "/files", query)
end

function sheets.get_spreadsheet(conn: google_types.Connection, spreadsheet_id: string): (google_types.Result?, error?)
    return transport.get(conn, sheets_api() .. "/" .. spreadsheet_id)
end

function sheets.read_range(conn: google_types.Connection, spreadsheet_id: string, range: string): (google_types.Result?, error?)
    return transport.get(conn, sheets_api() .. "/" .. spreadsheet_id .. "/values/" .. transport.encode_segment(range))
end

function sheets.update_values(conn: google_types.Connection, spreadsheet_id: string, range: string, values: any): (google_types.Result?, error?)
    return transport.put(conn,
        sheets_api() .. "/" .. spreadsheet_id .. "/values/" .. transport.encode_segment(range),
        { range = range, majorDimension = "ROWS", values = values },
        { valueInputOption = "USER_ENTERED" })
end

function sheets.append_values(conn: google_types.Connection, spreadsheet_id: string, range: string, values: any): (google_types.Result?, error?)
    return transport.post(conn,
        sheets_api() .. "/" .. spreadsheet_id .. "/values/" .. transport.encode_segment(range) .. ":append",
        { range = range, majorDimension = "ROWS", values = values },
        { valueInputOption = "USER_ENTERED", insertDataOption = "INSERT_ROWS" })
end

function sheets.create_spreadsheet(conn: google_types.Connection, title: string): (google_types.Result?, error?)
    return transport.post(conn, sheets_api(), { properties = { title = title } })
end

return sheets
