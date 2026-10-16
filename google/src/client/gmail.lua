local endpoints = require("endpoints")
-- Gmail domain service. Builds Gmail REST endpoints and shapes results over the
-- transport; it has no knowledge of HTTP or OAuth. Scalar inputs are typed;
-- decoded Gmail payloads are dynamic JSON, handled as `any`. Pure helpers
-- (RFC822 encoding, base64url, formatting) are exposed for unit testing.

local transport = require("transport")
local base64 = require("base64")
local google_types = require("types")
local pagination = require("pagination")

local gmail = {}

local function api_base(): string
    return endpoints.get("kickside.google:endpoints", "gmail")
end

local function encode_param(v: string): string
    return (v:gsub("([^%w%.%-%_%~])", function(char)
        return string.format("%%%02X", string.byte(char))
    end))
end

local function path_segment(value: any, name: string): (string?, string?)
    if type(value) ~= "string" or value == "" then return nil, name .. " is required" end
    if value:find("[/%?#]") then return nil, name .. " contains reserved path characters" end
    return value, nil
end

local function list_query(max_results: number?, query: string?, page_token: string?): ({ string }?, string?)
    local size, size_err = pagination.page_size(max_results, 10, 500, "max_results")
    if size_err then return nil, size_err end
    local parts: { string } = { "maxResults=" .. size }
    if query and query ~= "" then parts[#parts + 1] = "q=" .. encode_param(query) end
    if page_token and page_token ~= "" then parts[#parts + 1] = "pageToken=" .. encode_param(page_token) end
    return parts
end

function gmail.list_messages(conn: google_types.Connection, query: string?, max_results: number?, page_token: string?, label_ids: { string }?): (google_types.Result?, error?)
    local parts, parts_err = list_query(max_results, query, page_token)
    if parts_err or not parts then return { success = false, error = parts_err or "invalid pagination" } end
    if label_ids then
        for _, lid in ipairs(label_ids) do parts[#parts + 1] = "labelIds=" .. encode_param(lid) end
    end
    return transport.request_json(conn, "GET", api_base() .. "/messages?" .. table.concat(parts, "&"))
end


function gmail.get_message(conn: google_types.Connection, message_id: string, format: string?): (google_types.Result?, error?)
    local id, id_err = path_segment(message_id, "message_id")
    if not id then return { success = false, error = id_err } end
    return transport.request_json(conn, "GET", api_base() .. "/messages/" .. id .. "?format=" .. encode_param(format or "full"))
end

function gmail.get_message_metadata(conn: google_types.Connection, message_id: string, metadata_headers: { string }?, fields: string?): (google_types.Result?, error?)
    local id, id_err = path_segment(message_id, "message_id")
    if not id then return { success = false, error = id_err } end
    local query = "?format=" .. (fields and not metadata_headers and "full" or "metadata")
    for _, name in ipairs(metadata_headers or {}) do
        query = query .. "&metadataHeaders=" .. encode_param(name)
    end
    if fields then query = query .. "&fields=" .. encode_param(fields) end
    return transport.request_json(conn, "GET", api_base() .. "/messages/" .. id .. query)
end

function gmail.get_thread_metadata(conn: google_types.Connection, thread_id: string, metadata_headers: {string}?, fields: string?): (google_types.Result?, error?)
    return gmail.get_thread(conn, thread_id, fields and not metadata_headers and "full" or "metadata", fields,
        metadata_headers)
end

function gmail.list_threads(conn: google_types.Connection, query: string?, max_results: number?, page_token: string?): (google_types.Result?, error?)
    local parts, parts_err = list_query(max_results, query, page_token)
    if parts_err or not parts then return { success = false, error = parts_err or "invalid pagination" } end
    return transport.request_json(conn, "GET", api_base() .. "/threads?" .. table.concat(parts, "&"))
end

function gmail.get_thread(conn: google_types.Connection, thread_id: string, format: string?, fields: string?, metadata_headers: {string}?): (google_types.Result?, error?)
    local id, id_err = path_segment(thread_id, "thread_id")
    if not id then return { success = false, error = id_err } end
    local query = "?format=" .. encode_param(format or "full")
    if format == "metadata" then
        for _, name in ipairs(metadata_headers or {}) do query = query .. "&metadataHeaders=" .. encode_param(name) end
    end
    if fields then query = query .. "&fields=" .. encode_param(fields) end
    return transport.request_json(conn, "GET", api_base() .. "/threads/" .. id .. query)
end

function gmail.get_attachment(conn: google_types.Connection, message_id: string, attachment_id: string): (google_types.Result?, error?)
    local mid, mid_err = path_segment(message_id, "message_id")
    if not mid then return { success = false, error = mid_err } end
    local aid, aid_err = path_segment(attachment_id, "attachment_id")
    if not aid then return { success = false, error = aid_err } end
    return transport.request_json(conn, "GET", api_base() .. "/messages/" .. mid .. "/attachments/" .. aid)
end

function gmail.list_labels(conn: google_types.Connection, fields: string?): (google_types.Result?, error?)
    return transport.request_json(conn, "GET", api_base() .. "/labels?fields=" .. encode_param("labels(" .. (fields or "id,name,type") .. ")"))
end

-- Header / body extraction helpers (operate on dynamic message payloads) ─────

function gmail.get_header(headers: any, name: string): string?
    if not headers or not name then return nil end
    local lower = name:lower()
    for _, header in ipairs(headers) do
        if header.name and tostring(header.name):lower() == lower then return header.value :: string end
    end
    return nil
end

function gmail.decode_base64url(data: string): string
    local b64 = data:gsub("-", "+"):gsub("_", "/")
    local remainder = #b64 % 4
    if remainder > 0 then b64 = b64 .. string.rep("=", 4 - remainder) end
    local decoded, derr = base64.decode(b64)
    if not derr then return (decoded or "") :: string end
    return ""
end

function gmail.extract_text_body(payload: any): string
    if not payload then return "" end
    if payload.body and payload.body.data then
        return gmail.decode_base64url(payload.body.data :: string)
    end
    if payload.parts then
        for _, part in ipairs(payload.parts) do
            if part.mimeType == "text/plain" and part.body and part.body.data then
                return gmail.decode_base64url(part.body.data :: string)
            end
        end
        for _, part in ipairs(payload.parts) do
            if part.parts then
                local nested = gmail.extract_text_body(part)
                if nested ~= "" then return nested end
            end
        end
        for _, part in ipairs(payload.parts) do
            if part.mimeType == "text/html" and part.body and part.body.data then
                return gmail.decode_base64url(part.body.data :: string)
            end
        end
    end
    return ""
end

function gmail.extract_attachments(payload: any): { any }
    local attachments: { any } = {}
    local function scan(parts: any)
        if not parts then return end
        for _, part in ipairs(parts) do
            if part.filename and part.filename ~= "" and part.body then
                attachments[#attachments + 1] = {
                    filename = part.filename,
                    mimeType = part.mimeType,
                    size = part.body.size or 0,
                    attachmentId = part.body.attachmentId,
                }
            end
            if part.parts then scan(part.parts) end
        end
    end
    if payload and payload.parts then scan(payload.parts) end
    return attachments
end

-- Draft composition. `message` is a caller-built table; the encoders are pure.

local function encode_rfc822(message: any): string
    local m: any = message or {}
    local lines: { string } = {}
    local function add_header(name: string, value: any)
        if type(value) == "string" and value ~= "" then
            lines[#lines + 1] = name .. ": " .. (value :: string)
        end
    end
    add_header("From", m.from)
    add_header("To", m.to)
    add_header("Cc", m.cc)
    add_header("Bcc", m.bcc)
    add_header("Reply-To", m.reply_to)
    add_header("Message-ID", m.message_id)
    add_header("X-Wippy-Idempotency-Digest", m.idempotency_digest)
    add_header("Subject", m.subject or "")
    add_header("MIME-Version", "1.0")
    if type(m.html) == "string" and m.html ~= "" then
        lines[#lines + 1] = "Content-Type: text/html; charset=utf-8"
    else
        lines[#lines + 1] = "Content-Type: text/plain; charset=utf-8"
    end
    lines[#lines + 1] = ""
    lines[#lines + 1] = (type(m.html) == "string" and m.html ~= "" and m.html)
        or (type(m.body) == "string" and m.body)
        or ""
    return table.concat(lines, "\r\n")
end
gmail._encode_rfc822 = encode_rfc822

local function encode_base64url(s: string): string
    local b64: string = base64.encode(s) :: string
    return (b64:gsub("+", "-"):gsub("/", "_"):gsub("=+$", ""))
end
gmail._encode_base64url = encode_base64url

function gmail.create_draft(conn: google_types.Connection, message: any): (google_types.Result?, error?)
    local raw = encode_base64url(encode_rfc822(message))
    return transport.request_json(conn, "POST", api_base() .. "/drafts", { message = { raw = raw } })
end

function gmail.update_draft(conn: google_types.Connection, draft_id: string, message: any): (google_types.Result?, error?)
    local id, id_err = path_segment(draft_id, "draft_id")
    if not id then return { success = false, error = id_err } end
    local raw = encode_base64url(encode_rfc822(message))
    return transport.request_json(conn, "PUT", api_base() .. "/drafts/" .. id, { message = { raw = raw } })
end

function gmail.delete_draft(conn: google_types.Connection, draft_id: string): (google_types.Result?, error?)
    local id, id_err = path_segment(draft_id, "draft_id")
    if not id then return { success = false, error = id_err } end
    return transport.request_json(conn, "DELETE", api_base() .. "/drafts/" .. id)
end

function gmail.list_drafts(conn: google_types.Connection, max_results: number?, page_token: string?): (google_types.Result?, error?)
    local size, size_err = pagination.page_size(max_results, 10, 500, "max_results")
    if size_err then return { success = false, error = size_err } end
    local parts: { string } = { "maxResults=" .. size }
    if page_token and page_token ~= "" then parts[#parts + 1] = "pageToken=" .. encode_param(page_token) end
    return transport.request_json(conn, "GET", api_base() .. "/drafts?" .. table.concat(parts, "&"))
end

function gmail.find_draft_by_message_id(conn: google_types.Connection, message_id: string): (google_types.Result?, error?)
    if not message_id or message_id == "" then return { success = false, error = "message_id is required" } end
    local parts, parts_err = list_query(1, "rfc822msgid:" .. message_id, nil)
    if parts_err or not parts then return { success = false, error = parts_err or "invalid draft query" } end
    local listed, listed_err = transport.request_json(conn, "GET", api_base() .. "/drafts?" .. table.concat(parts, "&"))
    if not listed then return nil, listed_err end
    if listed.success ~= true then return listed end
    local drafts = type(listed.data) == "table" and listed.data.drafts or nil
    if type(drafts) ~= "table" or type(drafts[1]) ~= "table" then
        return { success = true, data = nil }
    end
    local draft_id = tostring(drafts[1].id or "")
    if draft_id == "" then return { success = false, error = "matching Gmail draft has no id" } end
    return gmail.get_draft(conn, draft_id)
end

function gmail.get_draft(conn: google_types.Connection, draft_id: string, format: string?, fields: string?): (google_types.Result?, error?)
    local id, id_err = path_segment(draft_id, "draft_id")
    if not id then return { success = false, error = id_err } end
    local query = "?format=" .. encode_param(format or "full")
    if fields then query = query .. "&fields=" .. encode_param(fields) end
    return transport.request_json(conn, "GET", api_base() .. "/drafts/" .. id .. query)
end

-- Metadata used to choose a message; full payloads belong to message_record.
function gmail.message_row(message: any): any?
    if type(message) ~= "table" then return nil end
    local record: any = { id = message.id, threadId = message.threadId, labelIds = message.labelIds,
        snippet = message.snippet, historyId = message.historyId, internalDate = message.internalDate,
        sizeEstimate = message.sizeEstimate }
    local payload: any = type(message.payload) == "table" and message.payload or {}
    local headers: any = payload.headers or {}
    record.subject = gmail.get_header(headers, "Subject")
    record.from = gmail.get_header(headers, "From")
    record.to = gmail.get_header(headers, "To")
    record.cc = gmail.get_header(headers, "Cc")
    record.date = gmail.get_header(headers, "Date")
    return record
end

-- A full message: its row plus the attachment list and the complete text body
-- read out of the payload.
function gmail.message_record(message: any): any?
    local record: any = gmail.message_row(message)
    if not record then return nil end
    for key, value in pairs(message) do record[key] = value end
    local payload: any = type(message.payload) == "table" and message.payload or {}
    record.attachments = gmail.extract_attachments(payload)
    record.body = gmail.extract_text_body(payload)
    return record
end

return gmail
