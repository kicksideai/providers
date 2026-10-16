local transport = require("transport")
local docs = require("docs")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    document_id: string?,
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

    if action == "list_documents" then
        local r, r_err = docs.list_documents(conn, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, documents = r.data and r.data.files or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "get_document" then
        local document_id = args.document_id
        if not document_id then return tool_result.domain_error("document_id required") end
        local r, r_err = docs.get_document(conn, document_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "read_document" then
        local document_id = args.document_id
        if not document_id then return tool_result.domain_error("document_id required") end
        local r, r_err = docs.get_document_text(conn, document_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, document_id = document_id, content = (r.data and r.data.text or "") :: string }

    elseif action == "create_document" then
        local title = args.title
        if not title then return tool_result.domain_error("title required") end
        local r, r_err = docs.create_document(conn, title)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: list_documents, get_document, read_document, create_document")
    end
end

return { handler = handler }
