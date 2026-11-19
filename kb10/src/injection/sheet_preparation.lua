-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local planner = require("planner")
local materializer = require("materializer")
local stage = require("stage")
local legacy = require("legacy")
local writer = require("writer")
local M = {}

-- A model call, a parser checkpoint, and a final writer page have independently
-- bounded lifetimes. Only Core advances the registered source position.
local PAGE = 64

local function sheet_page(doc: any, options: any, progress: any, read: any?)
    local rows = {}
    local records = 0
    local function full() return #rows >= PAGE end
    local handled, checkpoint, err = planner.plan_document(
        doc,
        options.chunk_size,
        read or function(offset, length) return doc.content:sub(offset + 1, offset + length), nil end,
        function(text, metadata)
            local ordinal = progress.chunks + #rows + 1
            if ordinal > options.tabular_max_chunks_per_doc then
                return "document chunk count exceeds KB policy; full content preserved for replay"
            end
            metadata.chunk_index = ordinal
            rows[#rows + 1] = { ordinal = ordinal, content = text, metadata = metadata }
            return nil
        end,
        {
            checkpoint = progress.parser,
            pause_output = full,
            should_pause = function()
                records = records + 1
                return full() or records > 512
            end,
        }
    )
    if err then return nil, nil, err end
    if not handled then return nil, nil, "source preparation expected a spreadsheet" end
    return rows, checkpoint, nil
end

local function plan_progress(progress: any, rows, checkpoint)
    return {
        phase = checkpoint and "plan" or "embed",
        chunks = progress.chunks + #rows,
        first = progress.first,
        next_vector = progress.next_vector,
        parser = checkpoint,
    }
end

function M.begin(target, cursor, event, doc, deadline)
    if not planner.is_spreadsheet(doc) then return nil, nil, nil end
    local options, options_err = materializer.materialization_options(target, target.config)
    if not options then return nil, nil, options_err end
    if options.max_document_content_chars and #doc.content > options.max_document_content_chars then
        return nil, nil, "document content too large for KB materialization"
    end
    local progress = { chunks = 0 }
    local rows, checkpoint, plan_err = sheet_page(doc, options, progress)
    if not rows then return nil, nil, plan_err end
    -- Small sheets keep their existing single complete-event publication.
    if not checkpoint then return nil, nil, nil end
    local summary
    if options.summary_model then
        local summarizer = legacy.checkpoint_adapters(deadline).summarize
        local model_err
        summary, model_err =
            summarizer(doc.content, options.summary_model, options.summary_max_chars, options.summary_prompt)
        if model_err then return nil, nil, model_err end
    end
    if type(summary) ~= "string" or not summary:find("%S") then summary = materializer.build_summary_text(doc, options) end
    local first = summary ~= "" and 0 or 1
    progress.first, progress.next_vector = first, first
    local next_progress = plan_progress(progress, rows, checkpoint)
    if first == 0 then table.insert(rows, 1, { ordinal = 0, content = summary, metadata = {} }) end
    local base, document = materializer.source_document(doc, options)
    local dims, dim_err = target.store:vector_dimensions({})
    if type(dims) ~= "number" then return nil, nil, dim_err or "vector dimensions unavailable" end
    local source = {
        event_id = event.id,
        document = document,
        base = base,
        options = options,
        title = doc.title,
        bytes = #doc.content,
        model = target.store_row.embedding_model,
        dims = dims,
    }
    local state = { source = source, progress = next_progress }
    return state,
        function(tx, _dialect)
            local begun, err = stage.begin_tx(tx, target.store_row.id, cursor, event.id, source, next_progress)
            if not begun then return nil, err end
            return stage.rows_tx(tx, target.store_row.id, cursor.id, rows)
        end,
        nil
end

function M.resume(store_id, cursor, event) return stage.load(store_id, cursor, event.id) end

function M.advance(target, cursor, state, deadline)
    local store_id = target.store_row.id
    local source, progress = state.source, state.progress
    if progress.phase == "plan" then
        local doc = {
            content = source.document.content,
            content_type = source.document.content_type,
            title = source.title,
            metadata = source.base,
        }
        if not doc.content and not state.read then state.read = stage.reader(store_id, cursor.id, source.bytes) end
        local rows, checkpoint, err = sheet_page(doc, source.options, progress, state.read)
        if not checkpoint then state.read = nil end
        if not rows then return nil, nil, err end
        local next_progress = plan_progress(progress, rows, checkpoint)
        return function(tx, _dialect)
            local ok, write_err = stage.rows_tx(tx, store_id, cursor.id, rows)
            if not ok then return nil, write_err end
            return stage.progress_tx(tx, store_id, cursor.id, next_progress)
        end,
            next_progress,
            nil
    end
    if progress.phase ~= "embed" then return nil, nil, "invalid source preparation phase" end
    local rows, read_err = stage.page(store_id, cursor.id, progress.next_vector, materializer.EMBED_BATCH_COUNT)
    if not rows then return nil, nil, read_err end
    if #rows == 0 then return nil, nil, "source preparation has no pending embedding inputs" end
    local texts = {}
    for i, row in ipairs(rows) do
        if tonumber(row.ordinal) ~= progress.next_vector + i - 1 then
            return nil, nil, "source preparation missing an embedding input"
        end
        local metadata, err = json.decode(row.metadata)
        if err then return nil, nil, err end
        local prefix = metadata.contextual_prefix
        texts[i] = type(prefix) == "string" and prefix ~= "" and (prefix .. "\n\n" .. row.content) or row.content
    end
    local count, size_err = materializer.embedding_batch_length(texts, 1)
    if not count then return nil, nil, size_err end
    while #texts > count do
        table.remove(texts)
    end
    local embedded, model_err = legacy.checkpoint_adapters(deadline).embed(texts, source.model, source.dims)
    if model_err then return nil, nil, model_err end
    local vectors = embedded and embedded.result
    if type(vectors) ~= "table" or #vectors ~= count then return nil, nil, "embed returned an incomplete source batch" end
    for i, v in ipairs(vectors) do
        local err = materializer.validate_vector(v, source.dims, "source child " .. tostring(progress.next_vector + i - 1))
        if err then return nil, nil, err end
    end
    local next_vector = progress.next_vector + count
    local next_progress = {
        phase = next_vector > progress.chunks and "ready" or "embed",
        chunks = progress.chunks,
        first = progress.first,
        next_vector = next_vector,
    }
    return function(tx, dialect)
        local ok, err = stage.vectors_tx(tx, dialect, store_id, cursor.id, progress.next_vector, vectors)
        if not ok then return nil, err end
        return stage.progress_tx(tx, store_id, cursor.id, next_progress)
    end,
        next_progress,
        nil
end

function M.publication(target, cursor, state)
    local store_id = target.store_row.id
    local source, p = state.source, state.progress
    if not source.document.content then
        local content, read_err = stage.content(store_id, cursor.id, source.bytes)
        if not content then return nil, nil, read_err end
        source.document.content = content
    end
    local selector = {
        source_thread_id = target.source_thread_id,
        external_source = source.base.external_source,
        external_id = source.base.external_id,
    }
    local before, err = writer.source_checkpoint_before(store_id, selector, "replace")
    if not before then return nil, nil, err end
    local change = {
        kind = "replace",
        replacement = {
            document = source.document,
            source_thread_id = target.source_thread_id,
        },
        preparation = {
            cursor_id = cursor.id,
            first_ordinal = p.first,
            child_count = p.chunks + 1 - p.first,
            summary_count = 1 - p.first,
            chunk_count = p.chunks,
            read_children = function(tx, offset)
                return stage.children_tx(tx, store_id, cursor.id, p.first + offset, source.base, PAGE)
            end,
        },
    }
    local outcome = writer.source_checkpoint_outcome(before, change)
    return function(tx, dialect)
        return writer.write_source_checkpoint_tx(tx, dialect, store_id, selector, before, change, outcome)
    end,
        outcome,
        nil
end
return M
