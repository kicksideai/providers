-- HubSpot attachment fetcher: Files API metadata -> signed URL -> bytes.
--
-- Uploads selects fetch_attachment from the attachment.fetcher registry entry.
-- The private-app token stays in the transport; the signed URL is a bearer
-- secret and never leaves this module, not even inside an error.
local http_client = require("http_client")
local transport = require("transport")

local M = { _transport = transport, _http = http_client }

M.MAX_BYTES = 50 * 1024 * 1024
M.DOWNLOAD_TIMEOUT_S = 120

local CONTENT_TYPES: { [string]: string } = {
    pdf = "application/pdf",
    doc = "application/msword",
    docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls = "application/vnd.ms-excel",
    xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt = "application/vnd.ms-powerpoint",
    pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    csv = "text/csv",
    txt = "text/plain",
    png = "image/png",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    gif = "image/gif",
    webp = "image/webp",
}

type FileMeta = { name: unknown?, extension: unknown?, size: unknown?, archived: unknown? }
type Fetched = { bytes: string, filename: string, content_type: string?, size: integer }

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function fail(code: string, detail: string): { error: string }
    return { error = code .. ": " .. detail }
end

-- HubSpot answers map onto the shared attachment error codes.
local function api_failure(what: string, res: any): { error: string }
    local status = tonumber(res.status_code) or 0
    if status == 401 or status == 403 then return fail("no_access", what .. " HTTP " .. status) end
    if status == 404 then return fail("not_found", what .. " HTTP 404") end
    return fail("download_failed", what .. " HTTP " .. status)
end

local function filename_of(meta: FileMeta, ref: string): string
    local name = trim(meta.name)
    local ext = trim(meta.extension)
    if name == "" then name = ref end
    if ext ~= "" and not name:lower():find("%." .. ext:lower() .. "$") then name = name .. "." .. ext end
    return name
end

local function header(headers: unknown, name: string): string
    if type(headers) ~= "table" then return "" end
    local h = headers :: { [string]: unknown }
    local value = h[name] or h[name:lower()]
    if type(value) == "table" then value = (value :: { unknown })[1] end
    return trim(value)
end

-- Generic types a file store answers when it does not know the file's type.
local GENERIC_TYPES: { [string]: boolean } = { ["application/octet-stream"] = true, ["binary/octet-stream"] = true }

-- content_type_of(headers, ext) -> the type HubSpot's file extension names;
-- the signed download's Content-Type only when the extension is unknown and
-- the header is not a generic octet-stream.
local function content_type_of(headers: unknown, ext: string): string?
    local by_ext = CONTENT_TYPES[ext:lower()]
    if by_ext then return by_ext end
    local declared = trim(header(headers, "Content-Type"):match("^[^;]+")):lower()
    if declared ~= "" and not GENERIC_TYPES[declared] then return declared end
    return nil
end

-- fetch_attachment({ref, component_id}) -> {bytes, filename, content_type, size}
-- or {error = "<code>: <detail>"} with codes no_access, not_found, too_large,
-- download_failed.
function M.fetch_attachment(args: any): any
    args = type(args) == "table" and args or {}
    local ref = trim(args.ref)
    if not ref:match("^%d+$") or #ref > 32 then return fail("not_found", "invalid HubSpot file id") end

    local conn, conn_err = M._transport.connect(trim(args.component_id))
    if conn_err or not conn then return fail("no_access", "no HubSpot connection") end

    local meta_res, meta_err = M._transport.get_file(conn, ref)
    if meta_err or not meta_res then return fail("download_failed", "file metadata request failed") end
    if not meta_res.success then return api_failure("file metadata", meta_res) end
    local meta = (type(meta_res.data) == "table" and meta_res.data or {}) :: FileMeta
    if meta.archived == true then return fail("not_found", "file is archived") end
    local declared = tonumber(meta.size)
    if declared and declared > M.MAX_BYTES then
        return fail("too_large", string.format("declared %d bytes > %d", declared, M.MAX_BYTES))
    end

    local url_res, url_err = M._transport.get_file_signed_url(conn, ref)
    if url_err or not url_res then return fail("download_failed", "signed URL request failed") end
    if not url_res.success then return api_failure("signed URL", url_res) end
    local url = trim(type(url_res.data) == "table" and (url_res.data :: any).url or nil)
    if url == "" then return fail("download_failed", "HubSpot returned no signed URL") end

    local response, http_err = M._http.request("GET", url, {
        timeout = M.DOWNLOAD_TIMEOUT_S,
        max_response_body = M.MAX_BYTES,
    })
    if http_err and tostring(http_err):find("response body too large", 1, true) then
        return fail("too_large", string.format("download exceeds %d bytes", M.MAX_BYTES))
    end
    if http_err or type(response) ~= "table" then return fail("download_failed", "download request failed") end
    local status = tonumber((response :: any).status_code) or 0
    if status ~= 200 then return api_failure("download", response) end
    local body = (response :: any).body
    if type(body) ~= "string" or body == "" then return fail("download_failed", "empty download") end

    local ext = trim(meta.extension)
    return ({
        bytes = body,
        filename = filename_of(meta, ref),
        content_type = content_type_of((response :: any).headers, ext),
        size = #body,
    } :: Fetched)
end

return M
