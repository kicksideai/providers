-- SPDX-License-Identifier: MPL-2.0
local ctx = require("ctx")
local drive = require("drive")
local transport = require("transport")

local M = {}

local FOLDER = "application/vnd.google-apps.folder"
local DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
local FILE_FIELDS = "id,name,version,modifiedTime,mimeType,size,webViewLink,parents,driveId,trashed"
local FOLDER_FIELDS = "id,mimeType,driveId,trashed,capabilities(canListChildren)"
local MAX_ITEMS = 100
local MAX_EXPORT_BYTES = 10 * 1024 * 1024
local MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024
local NATIVE_PREFIX = "application/vnd.google-apps."
local EXPORTS = {
    [NATIVE_PREFIX .. "document"] = {mime = "text/plain", extension = ".txt"},
    [NATIVE_PREFIX .. "spreadsheet"] = {
        mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension = ".xlsx",
    },
    [NATIVE_PREFIX .. "presentation"] = {
        mime = "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension = ".pptx",
    },
    [NATIVE_PREFIX .. "drawing"] = {mime = "application/pdf", extension = ".pdf"},
}

type Map = { [string]: any }

local function nonempty(value: any): string?
    if type(value) == "string" and value ~= "" then return value end
    return nil
end

local function drive_id(value: any): string?
    local id = nonempty(value)
    if id and #id <= 256 and id:match("^[%w_-]+$") then return id end
    return nil
end

local function failure(kind: string, code: string, message: string, retryable: boolean): error
    return errors.new({kind = kind, message = message, retryable = retryable, details = {code = code}})
end

local function answer(result: any, err: error?, operation: string): (Map?, error?)
    if err then return nil, err end
    if type(result) == "table" and result.success == true and type(result.data) == "table" then return result.data, nil end
    local raw: Map = type(result) == "table" and result or {}
    if type(raw.kind) == "string" and type(raw.details) == "table" then
        return nil, errors.new({kind = raw.kind, message = raw.message or operation,
            retryable = raw.retryable, details = raw.details})
    end
    local code = tonumber(raw.status_code)
    if code == 429 or raw.error_kind == "rate_limited" then
        return nil, errors.new({kind = errors.RATE_LIMITED, retryable = true, message = operation .. ": Google Drive rate limited",
            details = {code = "rate_limited", retry_after_ms = raw.retry_after_ms}})
    end
    if code == 401 or code == 403 then
        return nil, failure(errors.PERMISSION_DENIED, "google_drive_access_denied", operation .. ": Google Drive access denied", false)
    end
    if code == 404 then
        return nil, failure(errors.NOT_FOUND, "google_drive_not_found", operation .. ": Google Drive item is unavailable", false)
    end
    if code == 410 then
        return nil, failure(errors.INVALID, "google_drive_cursor_expired", operation .. ": Drive cursor expired. Resync the automation.", false)
    end
    return nil, failure(errors.UNAVAILABLE, "google_drive_provider_error", operation .. ": Google Drive returned no valid result", true)
end

local function open_drive(connection: string, connect: any): (any?, error?)
    local conn, conn_err = connect(connection)
    if conn_err then return nil, conn_err end
    if not conn then
        return nil, failure(errors.PERMISSION_DENIED, "google_drive_connection", "Google connection is unavailable", false)
    end
    -- Verify the OAuth provider before using the token against a Google host.
    local info, info_err = conn:get_info({})
    if info_err then return nil, info_err end
    if type(info) ~= "table" or info.provider ~= "google" then
        return nil, failure(errors.INVALID, "google_drive_connection", "Select a Google OAuth connection", false)
    end
    local readable = false
    for scope in tostring(info.scopes_granted or ""):gmatch("%S+") do
        if scope == DRIVE_SCOPE or scope == DRIVE_SCOPE .. ".readonly" then readable = true; break end
    end
    if not readable then
        return nil, failure(errors.PERMISSION_DENIED, "google_drive_scope", "Grant View Google Drive to this connection", false)
    end
    return conn, nil
end

local function read_folder(api: any, conn: any, folder: string, fields: string, root_alias: boolean?): (Map?, error?)
    local result, request_err = api.get_file(conn, folder, fields)
    local meta, meta_err = answer(result, request_err, "Read selected folder")
    if meta_err or not meta then return nil, meta_err end
    if not drive_id(meta.id) or (not root_alias and meta.id ~= folder) or meta.mimeType ~= FOLDER or meta.trashed == true then
        return nil, failure(errors.INVALID, "google_drive_folder", "The selected ID must name a live Drive folder", false)
    end
    if type(meta.capabilities) ~= "table" or meta.capabilities.canListChildren ~= true then
        return nil, failure(errors.PERMISSION_DENIED, "google_drive_folder", "The selected connection cannot list the folder", false)
    end
    if meta.driveId ~= nil and not drive_id(meta.driveId) then
        return nil, failure(errors.UNAVAILABLE, "google_drive_folder", "Drive returned an invalid shared drive ID", true)
    end
    return meta, nil
end

local function selected(req: Map, api: any, connect: any): (any?, Map?, error?)
    local config: Map = type(req.config) == "table" and req.config or {}
    local connection = nonempty(config.connection_id)
    local folder = drive_id(config.folder_id)
    local bound = req.component_id or ctx.get("component_id")
    if not connection or not folder or (bound ~= nil and bound ~= connection) then
        return nil, nil, failure(errors.INVALID, "google_drive_config",
            "Select a Google connection and enter the exact Drive folder ID", false)
    end
    local conn, conn_err = open_drive(connection, connect)
    if conn_err or not conn then return nil, nil, conn_err end
    local meta, meta_err = read_folder(api, conn, folder, FOLDER_FIELDS)
    if meta_err or not meta then return nil, nil, meta_err end
    local selection: Map = {connection_id = connection, folder_id = folder, drive_id = meta.driveId or ""}
    local cursor = req.cursor
    if type(cursor) == "table" and (cursor.connection_id ~= connection or cursor.folder_id ~= folder
            or cursor.drive_id ~= selection.drive_id) then
        return nil, nil, failure(errors.INVALID, "google_drive_cursor_scope",
            "The cursor belongs to another connection or folder. Resync the automation.", false)
    end
    return conn, selection, nil
end

local function position(selection: Map, phase: string, page_token: string?, change_token: string?): Map
    return {connection_id = selection.connection_id, folder_id = selection.folder_id, drive_id = selection.drive_id,
        phase = phase, page_token = page_token, change_token = change_token}
end

local function list_folder(api: any, conn: any, selection: Map, token: string?, limit: number): (Map?, error?)
    local query = "'" .. selection.folder_id .. "' in parents and mimeType != '" .. FOLDER .. "'"
    local result, request_err = api.list_files(conn, query, limit, token, FILE_FIELDS, selection.drive_id)
    local status = type(result) == "table" and tonumber(result.status_code) or nil
    if token and not request_err and (status == 400 or status == 410) then
        -- Drive rejects expired listing tokens. Restart once from the first page.
        result, request_err = api.list_files(conn, query, limit, nil, FILE_FIELDS, selection.drive_id)
    end
    local page, err = answer(result, request_err, "List selected folder")
    if err or not page then return nil, err end
    if page.incompleteSearch == true or type(page.files) ~= "table" or #page.files > limit then
        return nil, failure(errors.UNAVAILABLE, "google_drive_incomplete_listing",
            "Drive did not return a complete folder page", true)
    end
    if page.nextPageToken ~= nil and not nonempty(page.nextPageToken) then
        return nil, failure(errors.UNAVAILABLE, "google_drive_incomplete_listing", "Drive returned an invalid folder page token", true)
    end
    return page, nil
end

local function page_limit(value: any): integer
    return math.floor(math.max(1, math.min(MAX_ITEMS, tonumber(value) or MAX_ITEMS)))
end

local function same_folder(file: Map, selection: Map): boolean
    if file.trashed == true or (file.driveId or "") ~= selection.drive_id or type(file.parents) ~= "table" then return false end
    for _, id in ipairs(file.parents) do if id == selection.folder_id then return true end end
    return false
end

function M.browse(input: any, deps: any?): (Map?, error?)
    local request: Map = type(input) == "table" and input or {}
    local action = request.action
    local connection = nonempty(request.connection_id)
    local bound = ctx.get("component_id")
    if not connection or (bound ~= nil and bound ~= connection)
        or (action ~= "list_folders" and action ~= "list_shared_drives") then
        return nil, failure(errors.INVALID, "google_drive_browse", "Select a Google connection and a Drive listing action", false)
    end
    local shared = request.drive_id == nil and "" or request.drive_id
    local parent = request.parent_id
    if (shared ~= "" and not drive_id(shared)) or (parent ~= nil and not drive_id(parent))
        or (action == "list_shared_drives" and (shared ~= "" or parent ~= nil)) then
        return nil, failure(errors.INVALID, "google_drive_browse", "Invalid Drive listing location", false)
    end
    local cursor = request.cursor
    local page_token: string?
    if cursor ~= nil then
        if type(cursor) ~= "table" or cursor.action ~= action or cursor.connection_id ~= connection
            or cursor.drive_id ~= shared or not nonempty(cursor.page_token) or #cursor.page_token > 4096
            or (action == "list_shared_drives" and cursor.parent_id ~= nil) then
            return nil, failure(errors.INVALID, "google_drive_cursor_scope", "The page belongs to another Drive listing", false)
        end
        page_token = cursor.page_token
    end

    local api = deps and deps.drive or drive
    local conn, conn_err = open_drive(connection, deps and deps.connect or transport.connect)
    if conn_err or not conn then return nil, conn_err end
    local limit = page_limit(request.limit)
    local page, read_err, parent_ref
    if action == "list_folders" then
        local id = parent or (shared ~= "" and shared or "root")
        local folder, folder_err = read_folder(api, conn, id, FOLDER_FIELDS .. ",name", id == "root" and shared == "")
        if folder_err or not folder then return nil, folder_err end
        if (folder.driveId or "") ~= shared or (cursor and cursor.parent_id ~= folder.id) then
            return nil, failure(errors.INVALID, "google_drive_cursor_scope", "The folder belongs to another Drive listing", false)
        end
        if not nonempty(folder.name) then
            return nil, failure(errors.UNAVAILABLE, "google_drive_folder", "Drive returned an unnamed folder", true)
        end
        parent_ref = {id = folder.id, name = folder.name, drive_id = shared}
        local query = "'" .. folder.id .. "' in parents and mimeType = '" .. FOLDER .. "'"
        local result, err = api.list_files(conn, query, limit, page_token, FOLDER_FIELDS .. ",name,parents", shared)
        page, read_err = answer(result, err, "List Drive folders")
    else
        local result, err = api.list_shared_drives(conn, limit, page_token)
        page, read_err = answer(result, err, "List shared drives")
    end
    if read_err or not page then return nil, read_err end
    local rows = page[action == "list_folders" and "files" or "drives"]
    if rows == nil then rows = {} end
    local next_token = page.nextPageToken
    local invalid_page = failure(errors.UNAVAILABLE, "google_drive_incomplete_listing", "Drive returned an incomplete discovery page", true)
    if page.incompleteSearch == true or type(rows) ~= "table" or #rows > limit
        or (next_token ~= nil and (not nonempty(next_token) or #next_token > 4096)) then
        return nil, invalid_page
    end
    local items: { Map } = {}
    local selection: Map = {folder_id = parent_ref and parent_ref.id, drive_id = shared}
    for _, row in ipairs(rows) do
        if type(row) ~= "table" or not drive_id(row.id) or not nonempty(row.name) then return nil, invalid_page end
        if not parent_ref then
            items[#items + 1] = {id = row.id, name = row.name}
        elseif row.mimeType ~= FOLDER or not same_folder(row, selection) then
            return nil, invalid_page
        elseif type(row.capabilities) == "table" and row.capabilities.canListChildren == true then
            items[#items + 1] = {id = row.id, name = row.name, drive_id = shared}
        end
    end
    local next_cursor = next_token and {connection_id = connection, action = action, drive_id = shared,
        parent_id = selection.folder_id, page_token = next_token} or nil
    return {items = items, parent = parent_ref, next_cursor = next_cursor}, nil
end

local function item_key(id: string): string
    return "google:drive:" .. id
end

local function valid_version(value: any): string?
    local version = nonempty(value)
    if version and #version <= 20 and version:match("^%d+$") then return version end
    return nil
end

local function item_from(selection: Map, file: Map): (Map?, error?)
    local id = drive_id(file.id)
    local version = valid_version(file.version)
    if not id or not version then
        return nil, failure(errors.UNAVAILABLE, "google_drive_file_metadata", "Drive returned incomplete file metadata", true)
    end

    local key = item_key(id)
    local ordered_version = string.rep("0", 20 - #version) .. version
    return { item_key = key, dedup_key = key .. ":" .. ordered_version, source_version = ordered_version,
        occurred_at = nonempty(file.modifiedTime), op = "upsert",
        payload = {source_version = version, attachment = {
            source = "google", component_id = selection.connection_id,
            ref = {file_id = id, folder_id = selection.folder_id, version = version, drive_id = selection.drive_id},
        }} }, nil
end

local function read_items(selection: Map, rows: { any }): ({ Map }?, error?)
    local latest: { [string]: integer } = {}
    for index, file in ipairs(rows) do
        local id = type(file) == "table" and drive_id(file.id) or nil
        if not id then
            return nil, failure(errors.UNAVAILABLE, "google_drive_file_metadata", "Drive returned a file without a valid ID", true)
        end
        latest[id] = index
    end
    local items: { Map } = {}
    for index, file in ipairs(rows) do
        if latest[file.id] == index and file.mimeType ~= FOLDER and same_folder(file, selection) then
            local item, err = item_from(selection, file)
            if err or not item then return nil, err end
            items[#items + 1] = item
        end
    end
    return items, nil
end

local function change_position(api: any, conn: any, shared_drive: string?): (string?, error?)
    local result, request_err = api.start_changes(conn, shared_drive)
    local start, err = answer(result, request_err, "Capture Drive changes position")
    if err or not start then return nil, err end
    local token = nonempty(start.startPageToken)
    if not token then
        return nil, failure(errors.UNAVAILABLE, "google_drive_cursor", "Drive returned no changes position", true)
    end
    return token, nil
end

-- Capture a change token before listing the folder so concurrent changes are
-- observable after the final listing page. Drive deltas are for an entire
-- drive, so absence/removal is decided by Data Sync's keys-only reconciliation.
function M.pull(req: Map, deps: any?): (Map?, error?)
    local api = deps and deps.drive or drive
    local conn, selection, selection_err = selected(req, api, deps and deps.connect or transport.connect)
    if selection_err or not selection then return nil, selection_err end
    local cursor: Map? = type(req.cursor) == "table" and req.cursor or nil
    local shared_drive = nonempty(selection.drive_id)
    local limit = page_limit(req.limit)
    local change_token = cursor and nonempty(cursor.change_token) or nil
    local page_token = cursor and nonempty(cursor.page_token) or nil
    if cursor and (not change_token or (cursor.phase ~= "listing" and cursor.phase ~= "changes")
            or (cursor.phase == "listing" and not page_token)) then
        return nil, failure(errors.INVALID, "google_drive_cursor", "Invalid Drive cursor. Resync the automation.", false)
    end
    if not cursor then
        local err
        change_token, err = change_position(api, conn, shared_drive)
        if err then return nil, err end
    end

    local next_cursor: Map
    local rows: { any } = {}
    local has_more: boolean
    if not cursor or cursor.phase == "listing" then
        local page, err = list_folder(api, conn, selection, page_token, limit)
        if err or not page then return nil, err end
        local later = nonempty(page.nextPageToken)
        next_cursor = position(selection, later and "listing" or "changes", later, change_token)
        rows = page.files
        has_more = true
    else
        local result, request_err = api.list_changes(conn, shared_drive, change_token, limit, FILE_FIELDS)
        local page, err = answer(result, request_err, "Read Drive changes")
        if err or not page then return nil, err end
        local later = nonempty(page.nextPageToken)
        local next_change = later or nonempty(page.newStartPageToken)
        if not next_change or (page.changes ~= nil and (type(page.changes) ~= "table" or #page.changes > limit)) then
            return nil, failure(errors.UNAVAILABLE, "google_drive_cursor", "Drive returned an incomplete changes page", true)
        end
        for _, change in ipairs(page.changes or {}) do
            if type(change) ~= "table" then
                return nil, failure(errors.UNAVAILABLE, "google_drive_cursor", "Drive returned an invalid change", true)
            end
            if type(change.file) == "table" then rows[#rows + 1] = change.file end
        end
        next_cursor = position(selection, "changes", nil, next_change)
        has_more = later ~= nil
    end
    local items, err = read_items(selection, rows)
    if err or not items then return nil, err end
    return {success = true, items = items, next_cursor = next_cursor, has_more = has_more,
        retry_after_ms = has_more and #items == 0 and 1000 or nil}, nil
end

function M.pull_keys(req: Map, deps: any?): (Map?, error?)
    local api = deps and deps.drive or drive
    local conn, selection, selection_err = selected(req, api, deps and deps.connect or transport.connect)
    if selection_err or not selection then return nil, selection_err end
    local cursor: Map? = type(req.cursor) == "table" and req.cursor or nil
    local token = cursor and nonempty(cursor.page_token) or nil
    local anchor = cursor and nonempty(cursor.change_token) or nil
    if cursor and cursor.phase ~= "keys_restart" and (cursor.phase ~= "keys" or not token or not anchor) then
        return nil, failure(errors.INVALID, "google_drive_cursor", "Invalid Drive reconciliation cursor. Resync the automation.", false)
    end
    if not anchor then
        local err
        anchor, err = change_position(api, conn, nonempty(selection.drive_id))
        if err then return nil, err end
    end
    local page, err = list_folder(api, conn, selection, token, page_limit(req.limit))
    if err or not page then return nil, err end
    local keys: { string } = {}
    for _, file in ipairs(page.files) do
        local id = type(file) == "table" and drive_id(file.id) or nil
        if not id or not same_folder(file, selection) then
            return nil, failure(errors.UNAVAILABLE, "google_drive_incomplete_listing",
                "Drive could not verify the folder membership of a listed file", true)
        end
        keys[#keys + 1] = item_key(id)
    end
    local later = nonempty(page.nextPageToken)
    if not later then
        local latest, change_err = change_position(api, conn, nonempty(selection.drive_id))
        if change_err then return nil, change_err end
        -- A changed corpus can perturb the paginated listing. Restart within
        -- the same reconciliation pass, preserving its conservative marks.
        -- Only a full listing under one token may begin the receipt sweep.
        if anchor ~= latest then
            return {success = true, keys = {}, next_cursor = position(selection, "keys_restart"),
                has_more = true, retry_after_ms = 60000}, nil
        end
    end
    return {success = true, keys = keys, next_cursor = position(selection, "keys", later, anchor), has_more = later ~= nil}, nil
end

local function current_file(req: Map, api: any, connect: any): (any?, Map?, error?)
    local ref = type(req.ref) == "table" and req.ref or {}
    local id = drive_id(ref.file_id)
    local version = valid_version(ref.version)
    if not id or not version then
        return nil, nil, failure(errors.INVALID, "google_drive_reference", "Invalid Drive file reference", false)
    end
    local conn, selected_folder, folder_err = selected({
        component_id = req.component_id, config = {connection_id = req.component_id, folder_id = ref.folder_id},
    }, api, connect)
    if folder_err or not selected_folder then return nil, nil, folder_err end
    if ref.drive_id ~= selected_folder.drive_id then
        return nil, nil, failure(errors.NOT_FOUND, "google_drive_folder_moved", "The Drive folder changed drives", false)
    end
    local result, get_err = api.get_file(conn, id, FILE_FIELDS)
    local file, read_err = answer(result, get_err, "Read Drive file " .. id)
    if read_err or not file then return nil, nil, read_err end
    if file.id ~= id or not same_folder(file, selected_folder) then
        return nil, nil, failure(errors.NOT_FOUND, "google_drive_file_removed",
            "Drive file " .. id .. " is no longer in the selected folder", false)
    end
    if not valid_version(file.version) then
        return nil, nil, failure(errors.UNAVAILABLE, "google_drive_file_metadata", "Drive returned no file version", true)
    end
    if file.version ~= version then
        return nil, nil, failure(errors.INVALID, "google_drive_file_changed",
            "A newer version of Drive file " .. id .. " is available", false)
    end
    return conn, file, nil
end

function M.verify(req: Map, deps: any?): (Map?, error?)
    local _, file, err = current_file(req, deps and deps.drive or drive, deps and deps.connect or transport.connect)
    if err or not file then return nil, err end
    return {current = true}, nil
end

function M.fetch(req: Map, deps: any?): (Map?, error?)
    local api = deps and deps.drive or drive
    local connect = deps and deps.connect or transport.connect
    local conn, file, err = current_file(req, api, connect)
    if err or not file then return nil, err end
    local mime = nonempty(file.mimeType)
    local name = nonempty(file.name)
    if not mime or not name then
        return nil, failure(errors.UNAVAILABLE, "google_drive_file_metadata", "Drive returned incomplete file metadata", true)
    end
    local format = EXPORTS[mime]
    if not format and mime:sub(1, #NATIVE_PREFIX) == NATIVE_PREFIX then
        return nil, failure(errors.INVALID, "google_drive_export_format", "Drive file type cannot be exported for Knowledge", false)
    end
    if tonumber(file.size) and tonumber(file.size) > MAX_DOWNLOAD_BYTES then
        return nil, failure(errors.INVALID, "google_drive_file_size", "Drive file exceeds the 50 MiB upload limit", false)
    end
    local result, request_err
    if format then
        result, request_err = api.export_file(conn, file.id, format.mime, MAX_EXPORT_BYTES)
        if name:lower():sub(-#format.extension) ~= format.extension then name = name .. format.extension end
        mime = format.mime
    else
        result, request_err = api.read_file(conn, file.id, mime, MAX_DOWNLOAD_BYTES)
    end
    if not request_err and type(result) == "table" and tonumber(result.status_code) == 403 then
        local remote = type(result.data) == "table" and result.data.error or nil
        for _, reason in ipairs(type(remote) == "table" and remote.errors or {}) do
            if reason.reason == "exportSizeLimitExceeded" then
                return nil, failure(errors.INVALID, "google_drive_export_size", "The file exceeds Google's export limit", false)
            end
        end
    end
    local raw, bytes_err = answer(result, request_err, "Download Drive file " .. file.id)
    if bytes_err or not raw then return nil, bytes_err end
    local current, verify_err = M.verify(req, deps)
    if verify_err or not current then return nil, verify_err end

    local url = nonempty(file.webViewLink)
    if not url or not (url:match("^https://drive%.google%.com/") or url:match("^https://docs%.google%.com/")) then
        url = "https://drive.google.com/open?id=" .. file.id
    end
    return {bytes = raw.text, filename = name, content_type = mime, source_url = url}, nil
end

return M
