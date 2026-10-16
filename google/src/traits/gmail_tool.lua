local transport = require("transport")
local gmail = require("gmail")
local ctx = require("ctx")
local tool_result = require("tool_result")

-- Tool arguments, mirroring the input_schema in _index.yaml.
type Args = {
    action: string,
    fields: string?,
    metadata_headers: { string }?,
    query: string?,
    message_id: string?,
    thread_id: string?,
    draft_id: string?,
    to: string?,
    cc: string?,
    bcc: string?,
    subject: string?,
    body: string?,
    html: string?,
    max_results: number?,
    page_token: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

-- Message and draft ids are enriched with summary metadata; thread lists supply a snippet.
type RowReader = (any, any, Args) -> (any?, any?, error?)

local function list_page(conn: any, data: any, key: string, read_row: RowReader, args: Args): (any?, any?, error?)
    local d: any = type(data) == "table" and data or {}
    local rows: { any } = {}
    for _, entry in ipairs(d[key] or {}) do
        local row, failed, err = read_row(conn, entry, args)
        if err then return nil, nil, err end
        if failed then return nil, failed, nil end
        rows[#rows + 1] = row
    end
    local page: any = { next_page_token = d.nextPageToken, result_size_estimate = d.resultSizeEstimate }
    page[key] = rows
    return page, nil, nil
end

local function message_row(conn: any, entry: any, args: Args): (any?, any?, error?)
    local headers = args.metadata_headers
    if not headers and not args.fields then headers = {"Subject", "From", "To", "Cc", "Date"} end
    local r, err = gmail.get_message_metadata(conn, entry.id, headers, args.fields)
    if not r then return nil, nil, err end
    if not r.success then return nil, r, nil end
    return (args.fields or args.metadata_headers) and r.data or gmail.message_row(r.data), nil, nil
end

local function thread_row(conn: any, entry: any, args: Args): (any?, any?, error?)
    if not args.fields and not args.metadata_headers then
        return {id = entry.id, snippet = entry.snippet, historyId = entry.historyId}, nil, nil
    end
    local r, err = gmail.get_thread_metadata(conn, entry.id, args.metadata_headers, args.fields)
    if not r then return nil, nil, err end
    if not r.success then return nil, r, nil end
    return r.data, nil, nil
end

local function draft_row(conn: any, entry: any, args: Args): (any?, any?, error?)
    local r, err = gmail.get_draft(conn, entry.id, args.fields and "full" or "metadata", args.fields)
    if not r then return nil, nil, err end
    if not r.success then return nil, r, nil end
    return args.fields and r.data or { id = r.data.id, message = gmail.message_row(r.data.message) }, nil, nil
end

local function compose(args: Args): any
    return {
        to = args.to, cc = args.cc, bcc = args.bcc,
        subject = args.subject, body = args.body, html = args.html,
    }
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
    if action == "list_drafts" and args.metadata_headers ~= nil then
        return tool_result.domain_error("metadata_headers is supported for message/thread lists; the Gmail drafts API does not support it")
    end

    if action == "list_messages" then
        local r, r_err = gmail.list_messages(conn, args.query, args.max_results, args.page_token)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local page, failed, page_err = list_page(conn, r.data, "messages", message_row, args)
        if page_err then return nil, page_err end
        if failed then return google_error(failed) end
        return tool_result.ok(page)

    elseif action == "get_message" then
        local message_id = args.message_id
        if not message_id then return tool_result.domain_error("message_id required") end
        local r, r_err = gmail.get_message(conn, message_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(gmail.message_record(r.data))

    elseif action == "list_threads" then
        local r, r_err = gmail.list_threads(conn, args.query, args.max_results, args.page_token)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local page, failed, page_err = list_page(conn, r.data, "threads", thread_row, args)
        if page_err then return nil, page_err end
        if failed then return google_error(failed) end
        return tool_result.ok(page)

    elseif action == "get_thread" then
        local thread_id = args.thread_id
        if not thread_id then return tool_result.domain_error("thread_id required") end
        local r, r_err = gmail.get_thread(conn, thread_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local thread: any = {}
        for key, value in pairs(r.data) do thread[key] = value end
        local messages: { any } = {}
        for _, m in ipairs(r.data.messages or {}) do messages[#messages + 1] = gmail.message_record(m) end
        thread.messages = messages
        return thread

    elseif action == "list_labels" then
        local limit = args.max_results or 10
        local offset = args.page_token == nil and 0 or tonumber(args.page_token)
        if type(limit) ~= "number" or limit < 1 or limit > 500 or limit ~= math.floor(limit) then
            return tool_result.domain_error("max_results must be an integer between 1 and 500")
        end
        if not offset or offset < 0 or offset ~= math.floor(offset) then
            return tool_result.domain_error("page_token must be a nonnegative label offset")
        end
        local r, r_err = gmail.list_labels(conn, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local labels = r.data and r.data.labels or {}
        local rows: {any} = {}
        for index = offset + 1, math.min(#labels, offset + limit) do
            local label = labels[index]
            rows[#rows + 1] = args.fields and label or {id = label.id, name = label.name, type = label.type}
        end
        return {success = true, labels = rows,
            next_page_token = offset + #rows < #labels and tostring(offset + #rows) or nil}

    elseif action == "list_drafts" then
        local r, r_err = gmail.list_drafts(conn, args.max_results, args.page_token)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local page, failed, page_err = list_page(conn, r.data, "drafts", draft_row, args)
        if page_err then return nil, page_err end
        if failed then return google_error(failed) end
        return tool_result.ok(page)

    elseif action == "get_draft" then
        local draft_id = args.draft_id
        if not draft_id then return tool_result.domain_error("draft_id required") end
        local r, r_err = gmail.get_draft(conn, draft_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local draft: any = {}
        for key, value in pairs(r.data) do draft[key] = value end
        draft.message = gmail.message_record(r.data.message)
        return draft

    elseif action == "create_draft" then
        if not (args.to or args.subject or args.body or args.html) then
            return tool_result.domain_error("provide at least one of to, subject, body, html")
        end
        local r, r_err = gmail.create_draft(conn, compose(args))
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "update_draft" then
        local draft_id = args.draft_id
        if not draft_id then return tool_result.domain_error("draft_id required") end
        local r, r_err = gmail.update_draft(conn, draft_id, compose(args))
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "delete_draft" then
        local draft_id = args.draft_id
        if not draft_id then return tool_result.domain_error("draft_id required") end
        local r, r_err = gmail.delete_draft(conn, draft_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, id = draft_id, deleted = true }

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
    end
end

return { handler = handler }
