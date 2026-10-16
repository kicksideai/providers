-- Code Execution trait build func — injects the whitelisted SDK surface into the
-- agent's prompt so the model knows exactly what it can write against.
--
-- The trait's per-agent config (trait context) carries `tool_ids` — the same whitelist
-- run_code enforces. This func resolves each id from the registry and folds a compact
-- reference (the tool's purpose and its input_schema) into the prompt, keyed exactly as the
-- `sdk` import exposes it: `sdk.tools["<entry.id>"](args)`. It runs under the agent loader's
-- actor, so an id the actor cannot resolve is skipped rather than failing the compile.
--
-- The compiler appends the trait's own static prompt separately, so this returns ONLY
-- the resolved-surface section (or an empty contribution when nothing is whitelisted).

local registry = require("registry")
local json = require("json")

type Map = { [string]: any }
type Contribution = { prompt: string? }

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function parse_ids(v: any): { string }
    local out: { string } = {}
    if type(v) ~= "table" then return out end
    for _, x in ipairs(v :: { any }) do
        if is_str(x) then out[#out + 1] = x :: string end
    end
    return out
end

local function local_part(id: string): string
    local colon = id:find(":", 1, true)
    return colon and id:sub(colon + 1) or id
end

-- The human label run_code advertises for a tool (llm_alias, then title, then id local
-- part). Documentation only — the sandbox key is the real entry id.
local function tool_label(id: string, meta: Map): string
    if is_str(meta.llm_alias) then return meta.llm_alias :: string end
    if is_str(meta.title) then return meta.title :: string end
    return local_part(id)
end

local function describe(meta: Map): string
    if is_str(meta.llm_description) then return meta.llm_description :: string end
    if is_str(meta.comment) then return meta.comment :: string end
    return ""
end

-- decode_schema normalizes an inline JSON string or a table into a schema table, or nil.
local function decode_schema(schema: any): any
    if type(schema) == "string" then
        local decoded, err = json.decode(schema :: string)
        if err then return nil end
        schema = decoded
    end
    if type(schema) ~= "table" then return nil end
    return schema
end

-- Every tool the ambient (agent-loader) actor can reach — the allow-all surface.
-- Ids the actor cannot see are simply absent, so this stays actor-bounded.
local function all_tool_ids(): { string }
    local out: { string } = {}
    local entries = registry.find({ [".kind"] = "function.lua", ["meta.type"] = "tool" })
    if type(entries) == "table" then
        for _, e in ipairs(entries :: { any }) do
            local id = (e :: any).id
            if is_str(id) then out[#out + 1] = id :: string end
        end
    end
    return out
end

-- compact omits the per-tool input schema (used for the large allow-all catalog, where
-- the agent fetches a schema on demand via sdk.schema("<id>") rather than reading them all).
local function tools_section(ids: { string }, compact: boolean): string?
    local lines: { string } = {}
    for _, id in ipairs(ids) do
        local entry = registry.get(id)
        if entry then
            local meta = ((entry :: any).meta or {}) :: Map
            if (entry :: any).kind == "function.lua" and meta.type == "tool"
                and id ~= "kickside.code_execution.traits:run_code_tool"
                and id ~= "kickside.code_execution.traits:recommend_tools_tool" then
                local label = tool_label(id, meta)
                lines[#lines + 1] = "- `sdk.tools[\"" .. id .. "\"](args)` (" .. label .. ") — " .. describe(meta)
                if not compact then
                    local ischema = decode_schema(meta.input_schema)
                    if type(ischema) == "table" and next(ischema :: Map) ~= nil then
                        lines[#lines + 1] = "  input schema: `" .. json.encode(ischema) .. "`"
                    else
                        lines[#lines + 1] = "  takes no arguments."
                    end
                    local oschema = decode_schema(meta.output_schema)
                    if type(oschema) == "table" and next(oschema :: Map) ~= nil then
                        lines[#lines + 1] = "  output schema: `" .. json.encode(oschema) .. "`"
                    end
                end
            end
        end
    end
    if #lines == 0 then return nil end
    return "**Tools inside RunCode's Lua code** — use the bracketed id key in the code argument; each call returns `result, err`:\n" ..
        table.concat(lines, "\n")
end

local function execute(base_prompt: any, context: any): Contribution
    local trait_context = (type(context) == "table" and context or {}) :: Map
    local tool_ids = parse_ids(trait_context.tool_ids)
    -- An empty whitelist is allow-all: run_code exposes EVERY tool the actor can reach, so
    -- the prompt must advertise the full catalog too (otherwise the model flies blind).
    local allow_all = (#tool_ids == 0)
    if allow_all then
        tool_ids = all_tool_ids()
    end

    local ts = tools_section(tool_ids, allow_all)
    if not ts then return {} end

    local header: string
    if allow_all then
        header = "## Code execution SDK\n\n" ..
            "For an unfamiliar task, call **RecommendTools** first (describe what you need); it " ..
            "returns the most relevant tools with their input AND output schemas, so you can write " ..
            "**RunCode** against the right surface instead of scanning the whole catalog below.\n\n" ..
            "When you use the **RunCode** tool, your Lua runs in an isolated sandbox where the " ..
            "`sdk` import is the ONLY way to reach anything outside pure Lua. You can call EVERY " ..
            "tool the current user can reach — the full catalog is listed below, keyed by its real " ..
            "entry id. This INCLUDES web tools (search / page-reading) — use them to fetch or search " ..
            "the web from your code instead of saying you cannot go online. Raw `http`/network is " ..
            "blocked, but the tools handle that for you. To inspect a tool call " ..
            "`sdk.schema(\"<entry.id>\")` — it returns BOTH its input and output schemas as " ..
            "`{ input_schema, output_schema }`; `sdk.schemas({ \"<id>\", ... })` inspects several at " ..
            "once, and `sdk.list()` enumerates the ids. Use `sdk.sleep(n)` to pace calls " ..
            "(rate-limit, poll, backoff); it is capped per call. Pick the right tool and try it; " ..
            "each `sdk` call returns `result, err`, so check `err`.\n\n"
    else
        header = "## Code execution SDK\n\n" ..
            "For an unfamiliar task, call **RecommendTools** first (describe what you need) to get " ..
            "the most relevant tools with their input AND output schemas before writing RunCode.\n\n" ..
            "When you use the **RunCode** tool, your Lua runs in an isolated sandbox where the " ..
            "`sdk` import is the ONLY way to reach anything outside pure Lua. It exposes exactly " ..
            "the whitelisted tools below — nothing else is reachable. `sdk.schema(\"<entry.id>\")` " ..
            "returns a tool's `{ input_schema, output_schema }` and `sdk.schemas({ ... })` inspects " ..
            "several at once, and `sdk.sleep(n)` (capped per call) paces calls. Return a value from " ..
            "your code; each `sdk` call returns `result, err`, so check `err`.\n\n"
    end
    local invocation = 'The outer tool-call function name is RunCode and its arguments are a JSON object containing code.\n' ..
        'For arithmetic, call RunCode with {"code":"return 24 * 12"}.\n' ..
        'SDK expressions such as sdk.tools["<entry.id>"](args) and sdk.schema("<entry.id>") belong inside that code string.\n' ..
        'RecommendTools is also a native outer tool call with JSON arguments containing need.\n' ..
        'sdk.schemas returns a table whose schemas are keyed by registry id; use schemas[id].input_schema or pairs(schemas), not ipairs(schemas).\n' ..
        'Never put an SDK expression in the outer tool-call function name.\n\n'
    return { prompt = invocation .. header .. ts }
end

return { execute = execute }
