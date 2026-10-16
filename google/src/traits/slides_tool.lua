local transport = require("transport")
local slides = require("slides")
local ctx = require("ctx")
local tool_result = require("tool_result")

type Args = {
    action: string,
    fields: string?,
    presentation_id: string?,
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

    if action == "list_presentations" then
        local r, r_err = slides.list_presentations(conn, args.max_results, args.page_token, args.fields)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return { success = true, presentations = r.data and r.data.files or {}, next_page_token = r.data and r.data.nextPageToken }

    elseif action == "get_presentation" then
        local presentation_id = args.presentation_id
        if not presentation_id then return tool_result.domain_error("presentation_id required") end
        local r, r_err = slides.get_presentation(conn, presentation_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    elseif action == "read_presentation" then
        local presentation_id = args.presentation_id
        if not presentation_id then return tool_result.domain_error("presentation_id required") end
        local r, r_err = slides.read_presentation(conn, presentation_id)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        local p: any = r.data or {}
        return { success = true, presentation_id = p.presentationId or presentation_id, title = p.title, slides = slides.slide_texts(p) }

    elseif action == "create_presentation" then
        local title = args.title
        if not title then return tool_result.domain_error("title required") end
        local r, r_err = slides.create_presentation(conn, title)
        if not r then return nil, r_err end
        if not r.success then return google_error(r) end
        return tool_result.ok(r.data)

    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: list_presentations, get_presentation, read_presentation, create_presentation")
    end
end

return { handler = handler }
