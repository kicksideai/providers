-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local store = require("materializer_store")
local writer = require("writer")
local uuid = require("uuid")
local json = require("json")

local M = {}
local MAX_GROUP_BYTES = 16 * 1024 * 1024

-- The ordinary reducer receives the same DTOs as the committing writer. The
-- writer re-reads the affected subtree under its store lock before consuming
-- the plan. A repeated selection starts the next range with fresh counts.
function M.new(store_id, thread_id)
    local page = {plans = {}, sources = {}, bytes = 0}
    local claimed = {}
    local function plan(kind, spec)
        local meta = kind == "replace" and spec.document.metadata or spec.metadata
        local selector = {source_thread_id = thread_id, external_source = meta.external_source,
            external_id = meta.external_id, node_id = spec.node_id, expected_publication_id = spec.expected_publication_id}
        local before, read_err = writer.source_checkpoint_before(store_id, selector, kind)
        if not before then return nil, read_err end
        local source = before.external_source or selector.external_source
        local id = before.external_id or selector.external_id
        local key = source .. ":" .. id
        if claimed[key] or (before.id and claimed[before.id]) then
            return nil, errors.new({kind = errors.CONFLICT, retryable = true, message = "source revision begins the next publication"})
        end
        local change = {kind = kind}
        local root = before.id
        if kind == "replace" then
            root = root or uuid.v7()
            spec.document.id = root
            change.replacement = spec
        elseif kind == "reject" then
            root = root or uuid.v7()
            change.document_id, change.code, change.metadata = root, spec.code, meta
        end
        local delta = writer.source_checkpoint_outcome(before, change)
        local counts = before.counts or {}
        local result = {document_node_id = root, external_source = source, external_id = id,
            removed = before.id and 1 or 0, removed_document_count = tonumber(counts.document_count) or 0,
            removed_failed_document_count = tonumber(counts.failed_document_count) or 0,
            removed_summary_count = tonumber(counts.summary_count) or 0, removed_chunk_count = tonumber(counts.chunk_count) or 0,
            embedding_delta = delta.embedding_delta}
        if kind == "replace" then
            result.summary_count = delta.summary_delta + result.removed_summary_count
            result.chunk_count = delta.chunk_delta + result.removed_chunk_count
        elseif kind == "reject" then
            result.retained, result.error, result.failed_delta = before.id ~= nil and before.status ~= "failed", delta.last_error, delta.failed_delta
        else
            for _, name in ipairs({"document_delta", "failed_delta", "chunk_delta", "summary_delta"}) do result[name] = delta[name] end
        end
        local encoded, encode_err = json.encode(change)
        if encode_err then return nil, encode_err end
        page.bytes = page.bytes + #encoded
        claimed[key] = true
        if root then claimed[root] = true end
        page.sources[key] = true
        page.last_key = key
        page.plans[#page.plans + 1] = {selector = selector, before = before, change = change, delta = delta}
        return result, nil
    end
    page.store = {vector_dimensions = store.vector_dimensions, replace_document = store.replace_document,
        reject_source_revision = store.reject_source_revision, delete_documents_by_external_id = store.delete_documents_by_external_id,
        plan = plan}
    page.full = function() return page.bytes >= MAX_GROUP_BYTES end
    return page
end

function M.write(tx, dialect, id, plans)
    for _, plan in ipairs(plans) do
        local ok, err = writer.write_source_checkpoint_tx(tx, dialect, id, plan.selector, plan.before, plan.change, plan.delta)
        if not ok then return nil, err end
    end
    return true, nil
end

return M
