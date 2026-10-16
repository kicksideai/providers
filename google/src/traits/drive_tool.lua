local transport = require("transport")
local drive = require("drive")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    query: string?,
    file_id: string?,
    name: string?,
    parent_id: string?,
    max_results: number?,
    page_token: string?,
}

local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function file_list(data: any): any
    return { files = data and data.files or {}, next_page_token = data and data.nextPageToken }
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

    if action == "list_files" then
        local r, r_err = drive.list_files(conn, args.query, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(file_list(r.data))

    elseif action == "search_files" then
        local query = args.query
        if not query then return tool_result.domain_error("query required (search text)") end
        local r, r_err = drive.search_files(conn, query, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(file_list(r.data))

    elseif action == "get_file" then
        local file_id = args.file_id
        if not file_id then return tool_result.domain_error("file_id required") end
        local r, r_err = drive.get_file(conn, file_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "read_file" then
        local file_id = args.file_id
        if not file_id then return tool_result.domain_error("file_id required") end
        local meta, meta_err = drive.get_file(conn, file_id)
        if not meta then return nil, meta_err end
        if not meta.success then return google_error(meta) end
        local mime: string = (meta.data and meta.data.mimeType or "") :: string
        local r, r_err = drive.read_file(conn, file_id, mime)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, id = file_id, name = meta.data and meta.data.name, mime_type = mime,
            content = (r.data and r.data.text or "") :: string }

    elseif action == "create_folder" then
        local name = args.name
        if not name then return tool_result.domain_error("name required") end
        local r, r_err = drive.create_folder(conn, name, args.parent_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: list_files, search_files, get_file, read_file, create_folder")
    end
end

return { handler = handler }
