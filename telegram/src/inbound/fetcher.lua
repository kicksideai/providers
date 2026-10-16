local transport = require("transport")

local M = { _transport = transport }

M.MAX_BYTES = 50 * 1024 * 1024
M.MAX_REF_BYTES = 4096

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function valid_ref(value: any): (string?, string?)
    local ref = trim(value)
    if ref == "" then return nil, "no attachment ref" end
    if #ref > M.MAX_REF_BYTES or ref:find("[%z\1-\31\127]") then return nil, "invalid attachment ref" end
    return ref, nil
end

-- Uploads selects this function from a trusted registry declaration. The
-- envelope carries only Telegram's opaque file_id; the token remains inside
-- the provider transport.
function M.fetch_attachment(args: any): (any?, any?)
    args = type(args) == "table" and args or {}

    local ref, ref_err = valid_ref(args.ref)
    if not ref then return { error = ref_err } end

    local component_id = trim(args.component_id)
    if #component_id > 512 or component_id:find("[%z\1-\31\127]") then
        return { error = "invalid component_id" }
    end

    local conn, conn_err = M._transport.connect(component_id)
    if conn_err or not conn then return { error = tostring(conn_err or "no Telegram connection") } end

    local file, file_err = M._transport.get_file(conn, ref)
    if file_err then return nil, file_err end
    if not file.success then return { error = tostring(file.error or "Telegram getFile failed") } end

    local data = type(file.data) == "table" and file.data or {}
    local path = trim((data :: any).file_path)
    if path == "" then return { error = "Telegram returned no file_path" } end
    local declared_size = tonumber((data :: any).file_size)
    if declared_size ~= nil and declared_size > M.MAX_BYTES then return { error = "attachment too large" } end

    local download, download_err = M._transport.download_file(conn, path)
    if download_err then return nil, download_err end
    if not download.success then return { error = tostring(download.error or "Telegram download failed") } end
    if type(download.data) ~= "string" or (download.data :: string) == "" then
        return { error = "Telegram download returned no bytes" }
    end
    if #(download.data :: string) > M.MAX_BYTES then return { error = "attachment too large" } end

    return { bytes = download.data :: string }
end

return M
