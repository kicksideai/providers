local ctx = require("ctx")
local transport = require("transport")
local output = require("output")
local tool_result = require("tool_result")

local DEFAULT_LIST_LIMIT = 25
local MAX_LIST_LIMIT = 50

type Args = {
    action: string,
    transcript_id: string?,
    limit: number?,
    skip: number?,
}

-- The connection pinned on the trait, if any; else the transport auto-selects the
-- single Fireflies connection in scope.
local function connection_id(): string?
    local configured = ctx.get("connection_id")
    if type(configured) == "string" and configured ~= "" then return configured end
    return nil
end

local function list_limit(args: Args): number
    local n = tonumber(args.limit) or DEFAULT_LIST_LIMIT
    if n < 1 then n = 1 end
    if n > MAX_LIST_LIMIT then n = MAX_LIST_LIMIT end
    return math.floor(n)
end

local function handler(args: Args): (any?, error?)
    local conn, err = transport.connect(connection_id())
    if not conn then return nil, err end

    local action = args.action
    local result, request_err

    if action == "get_user" then
        result, request_err = transport.get_user(conn)
    elseif action == "list_transcripts" then
        local vars: { [string]: any } = { limit = list_limit(args) }
        if tonumber(args.skip) then vars.skip = math.floor(tonumber(args.skip) :: number) end
        result, request_err = transport.list_transcripts(conn, vars)
    elseif action == "get_transcript" then
        if not args.transcript_id or args.transcript_id == "" then return tool_result.domain_error("transcript_id required") end
        result, request_err = transport.get_transcript(conn, args.transcript_id)
    elseif action == "get_transcript_text" then
        if not args.transcript_id or args.transcript_id == "" then return tool_result.domain_error("transcript_id required") end
        result, request_err = transport.get_transcript_sentences(conn, args.transcript_id)
    else
        return tool_result.domain_error("unknown action '" .. tostring(action) ..
            "'. Use: get_user, list_transcripts, get_transcript, get_transcript_text")
    end

    if not result then return nil, request_err end
    if not result.success then return tool_result.domain_error(result.error, result) end
    local data: any = result.data

    if action == "list_transcripts" then
        local rows: any = type(data) == "table" and type(data.transcripts) == "table" and data.transcripts or {}
        local skip = math.max(0, math.floor(tonumber(args.skip) or 0))
        return tool_result.ok(output.sanitize({ transcripts = rows, count = #rows, skip = skip,
            next_skip = #rows == list_limit(args) and skip + #rows or nil }))
    end
    if action == "get_user" then
        return tool_result.ok(output.sanitize(type(data) == "table" and (data :: any).user or data))
    end
    -- get_transcript / get_transcript_text return the single transcript object.
    return tool_result.ok(output.sanitize(type(data) == "table" and (data :: any).transcript or data))
end

return { handler = handler }
