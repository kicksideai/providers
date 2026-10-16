local endpoints = require("endpoints")
-- Google Docs domain service over the transport.

local transport = require("transport")
local google_types = require("types")
local pagination = require("pagination")

local docs = {}

local function docs_api(): string
    return endpoints.get("kickside.google:endpoints", "docs")
end
local function drive_api(): string
    return endpoints.get("kickside.google:endpoints", "drive")
end
local DEFAULT_PAGE_SIZE = 20
local MAX_PAGE_SIZE = 100

function docs.list_documents(conn: google_types.Connection, max_results: number?, page_token: string?, fields: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, "max_results")
    if size_err then return { success = false, error = size_err } end
    local query: { [string]: any } = {
        q = "mimeType='application/vnd.google-apps.document' and trashed=false",
        fields = "nextPageToken,files(" .. (fields or "id,name,mimeType,modifiedTime,webViewLink,owners(displayName,emailAddress)") .. ")",
        pageSize = size,
        orderBy = "modifiedTime desc",
    }
    if page_token and page_token ~= "" then query.pageToken = page_token end
    return transport.get(conn, drive_api() .. "/files", query)
end

function docs.get_document(conn: google_types.Connection, document_id: string): (google_types.Result?, error?)
    return transport.get(conn, docs_api() .. "/documents/" .. document_id)
end

-- Drive export returns the document as raw text/plain, not JSON.
function docs.get_document_text(conn: google_types.Connection, document_id: string): (google_types.Result?, error?)
    return transport.get_raw(conn, drive_api() .. "/files/" .. document_id .. "/export", { mimeType = "text/plain" })
end

function docs.create_document(conn: google_types.Connection, title: string): (google_types.Result?, error?)
    return transport.post(conn, docs_api() .. "/documents", { title = title })
end

return docs
