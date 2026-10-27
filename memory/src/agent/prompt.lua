-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local ctx = require("ctx")
local component = require("component")
local types = require("types")
local context = require("agent_context")
local items = require("memory_items")
local runs = require("memory_runs")
local ledger = require("memory_ledger")

local M = {}

local AGENT_SOUL_KINDS = { types.KIND.IDENTITY, types.KIND.RULE, types.KIND.SKILL, types.KIND.LESSON }
local OWNER_SOUL_KINDS = { types.KIND.PROFILE_SLOT, types.KIND.PREFERENCE, types.KIND.PLAN }

local KIND_ORDER: { [string]: integer } = {
    identity = 1, rule = 2, profile_slot = 3, preference = 4, plan = 5, skill = 6, lesson = 7, fact = 8,
}

local function sort_soul(rows: { any })
    table.sort(rows, function(a, b)
        local ak, bk = KIND_ORDER[a.kind], KIND_ORDER[b.kind]
        if ak ~= bk then return ak < bk end
        if a.priority ~= b.priority then return a.priority > b.priority end
        if a.key ~= b.key then return a.key < b.key end
        return a.id < b.id
    end)
end

local function render(rows: { any }, heading: string, max_chars: integer): (string, { any })
    sort_soul(rows)
    local lines: { string } = {}
    local selected: { any } = {}
    local used = #heading
    for _, row in ipairs(rows) do
        local text = row.content
        if row.kind == types.KIND.PLAN then text = row.content .. " Next step: " .. row.value.next_step end
        if (row.kind == types.KIND.PROFILE_SLOT or row.kind == types.KIND.PREFERENCE) and type(row.value) == "string" then
            local label = row.key:gsub("_", " ")
            text = label:sub(1, 1):upper() .. label:sub(2) .. " [" .. row.key .. "]: " .. row.value
        end
        local line = "- " .. text
        if used + #line + 1 > max_chars then break end
        lines[#lines + 1] = line
        selected[#selected + 1] = { id = row.id, version = row.version, content_hash = row.content_hash }
        used = used + #line + 1
    end
    if #lines == 0 then return "", selected end
    return heading .. "\n" .. table.concat(lines, "\n"), selected
end

local function soul_rows(component_id: string, scope_key: string, kinds: { string }): (any?, error?)
    return items.list(component_id, { kinds = kinds, statuses = { types.STATUS.CURRENT }, scope_keys = { scope_key }, limit = 200 })
end

local function agent_soul(payload: any, agent_id: string): (string?, error?)
    local id, store, err = context.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local rows, rows_err = soul_rows(id :: string, types.scope_key(types.SCOPE.AGENT, agent_id), AGENT_SOUL_KINDS)
    if rows_err then return nil, rows_err end
    local text = render(rows :: any, "## Agent memory", (store :: any).effective.soul_agent_max_chars)
    return text, nil
end

function M.pin(payload: any): (any?, error?)
    local id, store, err = context.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local host_kind, host_id = context.host_ref(payload.host)
    local rows, rows_err = soul_rows(id :: string, types.scope_key(types.SCOPE.OWNER, types.actor_id()), OWNER_SOUL_KINDS)
    if rows_err then return nil, rows_err end
    local visible: { any } = {}
    local cutoff = types.after_seconds(-(store :: any).effective.plan_expiry_days * 86400)
    for _, row in ipairs(rows :: any) do
        if row.kind ~= types.KIND.PLAN or (row.value.status == "open" and (types.utc(row.recorded_at) or "") > cutoff) then
            visible[#visible + 1] = row
        end
    end
    local text, pinned = render(visible, "## What you know about the user\nUse these facts as defaults. Do not ask the user to repeat or confirm an attribute shown here. Apply it when relevant, state the assumption and let the user correct it. Ask only for missing details.", (store :: any).effective.soul_owner_max_chars)
    local head, head_err = ledger.head(id :: string)
    if head_err then return nil, head_err end
    return runs.pin(id :: string, host_kind, host_id, types.trim(payload.agent.id), head :: integer, text, pinned)
end

-- A host keeps its activation snapshot until an item transition invalidates the pin.
local function owner_prompt(payload: any): (string?, error?)
    local run = ctx.get("agent_run")
    local host_kind, host_id = context.host_ref(type(run) == "table" and run.host or nil)
    if host_kind == "" or host_id == "" then return "", nil end
    local id, _, err = context.memory(payload, component.ACCESS.READ)
    if err then return nil, err end
    local cursor, cursor_err = runs.cursor(id :: string, host_kind, host_id)
    if cursor_err then return nil, cursor_err end
    if cursor and (cursor :: any).pinned_prompt == nil then
        local _, pin_err = M.pin({ context = payload.context, host = run.host, agent = run.agent or {} })
        if pin_err then return nil, pin_err end
        cursor, cursor_err = runs.cursor(id :: string, host_kind, host_id)
        if cursor_err then return nil, cursor_err end
    end
    return cursor and (cursor :: any).pinned_prompt or "", nil
end

function M.build(_prompt: any, trait_context: any): (any?, error?)
    if types.trim(context.setting({ context = trait_context }, "memory_id")) == "" then
        return nil, types.invalid("the Memory capability has no memory selected")
    end
    local tools = {
        { id = "kickside.memory.agent:remember_tool" },
        { id = "kickside.memory.agent:forget_tool" },
    }
    local agent_id = types.trim(type(trait_context) == "table" and trait_context.agent_id or ctx.get("agent_id"))
    if agent_id == "" then return { tools = tools }, nil end
    local text, err = agent_soul({ context = trait_context }, agent_id)
    if err then return nil, err end
    return { prompt = text ~= "" and text or nil, tools = tools }, nil
end

function M.prompt(): (string?, error?)
    if types.trim(context.setting({}, "memory_id")) == "" then
        return nil, types.invalid("the Memory capability has no memory selected")
    end
    return owner_prompt({})
end

return M
