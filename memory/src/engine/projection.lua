-- Ledger projection of a memory knowledge base. Folds typed memory events into
-- the read model, schedules derive runs for content ingested through the
-- knowledge control plane, and publishes the memory's counts as public meta.

local component = require("component")
local types = require("types")
local items = require("memory_items")
local jobs = require("memory_jobs")

local M = {}

local function content_text(body: any): string
    local content = type(body) == "table" and body.content or nil
    if type(content) ~= "string" then return "" end
    local title = types.trim(body.title)
    local text = content
    if title ~= "" then text = title .. "\n\n" .. text end
    return text
end

function M.run(input: any): (any?, error?)
    local component_id = types.trim(input and input.thread_id)
    if component_id == "" then return nil, types.invalid("memory projection requires thread_id") end
    local ledger_events: { any } = {}
    for _, event in ipairs(input.events or {}) do
        if event.type == types.CONTENT_UPSERTED then
            local text = content_text(event.body)
            if text ~= "" then
                local _, ingest_err = jobs.ingest(component_id, tostring(event.id), {
                    { id = tostring(event.id), role = "document", text = text, created_at = event.created_at },
                })
                if ingest_err then return nil, ingest_err end
            end
        else
            ledger_events[#ledger_events + 1] = event
        end
    end
    if #ledger_events > 0 then
        local _, fold_err = items.fold(component_id, ledger_events)
        if fold_err then return nil, fold_err end
    end
    local counts, count_err = items.counts(component_id)
    if count_err then return nil, count_err end
    local _, meta_err = component.set_meta(component_id, {
        status = "ready",
        item_count = (counts :: any).current,
        superseded_count = (counts :: any).superseded,
        conflict_count = (counts :: any).conflict_groups,
        forgotten_count = (counts :: any).forgotten,
    })
    if meta_err then return nil, meta_err end
    return { body = { counts = counts }, last_seq = input.range and input.range.to_seq }, nil
end

return M
