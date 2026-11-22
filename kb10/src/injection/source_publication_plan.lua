-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local store = require("materializer_store")
local source_deadline = require("source_deadline")
local writer = require("writer")
local uuid = require("uuid")
local json = require("json")

local M = {}
local MAX_GROUP_BYTES = 16 * 1024 * 1024

local function next_state(before, source, id, root, change, delta)
    local state = {chained = true, external_source = source, external_id = id}
    if change.kind == "delete" then return state end
    state.id = root
    if change.kind == "reject" then
        if before.id and before.status ~= "failed" then
            state.status, state.publication_id = before.status, before.publication_id
        else
            state.status, state.publication_id = "failed", change.metadata.upload_publication_id
        end
        state.counts = before.counts or {failed_document_count = 1}
        return state
    end
    local replacement = change.replacement
    local metadata = replacement.document.metadata
    local counts = before.counts or {}
    state.status = metadata.status
    state.publication_id = metadata.upload_publication_id
    state.counts = {
        document_count = (tonumber(counts.document_count) or 0) + delta.document_delta,
        failed_document_count = (tonumber(counts.failed_document_count) or 0) + delta.failed_delta,
        chunk_count = (tonumber(counts.chunk_count) or 0) + delta.chunk_delta,
        summary_count = (tonumber(counts.summary_count) or 0) + delta.summary_delta,
        embedding_count = (tonumber(counts.embedding_count) or 0) + delta.embedding_delta,
        child_embedding_count = #replacement.children,
        root_count = 0,
    }
    return state
end

local function source_key(source, id)
    return tostring(#source) .. ":" .. source .. id
end

-- The ordinary reducer receives the same DTOs as the committing writer. The
-- writer re-reads the affected subtree under its store lock before consuming
-- the plan. Registered publication plans one complete source input and keeps
-- its repeated selectors in order within the transaction.
function M.new(store_id, thread_id, ordered)
    local page = {plans = {}, sources = {}, bytes = 0}
    local claimed = {}
    local state_by_source, state_by_node = {}, {}
    local function plan(kind, spec)
        local meta = kind == "replace" and spec.document.metadata or spec.metadata
        local selector = {source_thread_id = thread_id, external_source = meta.external_source,
            external_id = meta.external_id, node_id = spec.node_id, expected_publication_id = spec.expected_publication_id}
        local before, missing
        if ordered and type(selector.external_source) == "string" and type(selector.external_id) == "string" then
            if selector.node_id then
                before = state_by_node[selector.node_id]
            else
                before = state_by_source[source_key(selector.external_source, selector.external_id)]
            end
            if before and selector.expected_publication_id ~= nil and before.publication_id ~= selector.expected_publication_id then
                before, missing = {chained = true}, true
            end
        end
        if not before then
            local read_err
            before, read_err = writer.source_checkpoint_before(store_id, selector, kind, ordered)
            if not before then return nil, read_err end
        end
        missing = missing or (kind == "delete" and not before.id)
        local source = before.external_source or selector.external_source
        local id = before.external_id or selector.external_id
        local key = source .. ":" .. id
        if not ordered and (claimed[key] or (before.id and claimed[before.id])) then
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
        if ordered then
            if not missing then
                local next = next_state(before, source, id, root, change, delta)
                state_by_source[source_key(source, id)] = next
                if root then state_by_node[root] = next end
            end
        else
            local encoded, encode_err = json.encode(change)
            if encode_err then return nil, encode_err end
            page.bytes = page.bytes + #encoded
        end
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
    local deadline_full = source_deadline.new()
    page.full = function(now, deadline, attempt_no)
        return page.bytes >= MAX_GROUP_BYTES or deadline_full(now, deadline, attempt_no ~= 1)
    end
    return page
end

function M.write(tx, dialect, id, plans, encoded_embeddings, placement)
    for _, plan in ipairs(plans) do
        local pending
        if placement and plan.change.kind == "replace"
            and placement.documents[plan.change.replacement.document.id]
            and plan.change.replacement.document.metadata.status == "completed" then
            pending = placement
        end
        local ok, err = writer.write_source_checkpoint_tx(tx, dialect, id, plan.selector, plan.before, plan.change, plan.delta,
            encoded_embeddings, pending)
        if not ok then return nil, err end
    end
    return true, nil
end

return M
