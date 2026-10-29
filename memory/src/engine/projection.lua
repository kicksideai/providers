-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local component = require("component")
local types = require("types")
local items = require("memory_items")
local fold = require("memory_fold")
local jobs = require("memory_jobs")

local M = {}

function M.run(input: any): (any?, error?)
    local component_id = types.trim(input and input.thread_id)
    if component_id == "" then return nil, types.invalid("memory projection requires thread_id") end
    local ledger_events: { any } = {}
    for _, event in ipairs(input.events or {}) do
        if event.type == types.CONTENT_UPSERTED then
            local body = type(event.body) == "table" and event.body or nil
            local content = body and body.content or nil
            if type(content) == "string" and types.trim(content) ~= "" then
                local _, ingest_err = jobs.ingest_document(component_id, tostring(event.id), body.title, content, event.created_at)
                if ingest_err then return nil, ingest_err end
            end
        else
            ledger_events[#ledger_events + 1] = event
        end
    end
    if #ledger_events > 0 then
        local _, fold_err = fold.fold(component_id, ledger_events)
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
