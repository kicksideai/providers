local endpoints = require("endpoints")
-- Google Drive domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local drive = {}

local function api(): string
    return endpoints.get("kickside.google:endpoints", "drive")
end
local DEFAULT_PAGE_SIZE = 20
local MAX_PAGE_SIZE = 100

local function path_segment(value: any, name: string): (string?, string?)
    if type(value) ~= "string" or value == "" then return nil, name .. " is required" end
    if value:find("[/%?#]") then return nil, name .. " contains reserved path characters" end
    return value, nil
end

function drive.list_files(conn: google_types.Connection, query_str: string?, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local q = "trashed=false"
    if query_str and query_str ~= "" then q = q .. " and " .. query_str end
    local query: { [string]: any } = {
        q = q,
        fields = "nextPageToken,files(" .. (fields or "id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress)") .. ")",
        pageSize = size,
        orderBy = "modifiedTime desc",
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, api() .. "/files", query)
end

function drive.search_files(conn: google_types.Connection, text: string, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local safe = (text or ""):gsub("\\", "\\\\"):gsub("'", "\\'")
    local q = "trashed=false and (name contains '" .. safe .. "' or fullText contains '" .. safe .. "')"
    local query: { [string]: any } = {
        q = q,
        fields = "nextPageToken,files(" .. (fields or "id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress)") .. ")",
        pageSize = size,
        orderBy = "modifiedTime desc",
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, api() .. "/files", query)
end

function drive.get_file(conn: google_types.Connection, file_id: string): (google_types.Result?, error?)
    local id, id_err = path_segment(file_id, "file_id")
    if not id then return { success = false, error = id_err } end
    return transport.get(conn, api() .. "/files/" .. id, { fields = "*" })
end

function drive.create_folder(conn: google_types.Connection, name: string, parent_id: string?): (google_types.Result?, error?)
    local body: { [string]: any } = { name = name, mimeType = "application/vnd.google-apps.folder" }
    if parent_id and parent_id ~= "" then body.parents = { parent_id } end
    return transport.post(conn, api() .. "/files", body, { fields = "*" })
end

-- Google-native types export to text/CSV; everything else downloads directly.
-- Both return raw bytes.
function drive.read_file(conn: google_types.Connection, file_id: string, mime_type: string?): (google_types.Result?, error?)
    local id, id_err = path_segment(file_id, "file_id")
    if not id then return { success = false, error = id_err } end
    if mime_type and mime_type:find("application/vnd.google-apps", 1, true) then
        local export = "text/plain"
        if mime_type == "application/vnd.google-apps.spreadsheet" then export = "text/csv" end
        return transport.get_raw(conn, api() .. "/files/" .. id .. "/export", { mimeType = export })
    end
    return transport.get_raw(conn, api() .. "/files/" .. id, { alt = "media" })
end

return drive
