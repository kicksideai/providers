-- The single kb10 source-content write surface. Source document/summary/chunk/image nodes are
-- created, replaced, embedded, and deleted ONLY through here -- by the kb10 source
-- projection worker (via source_materializer) and by re-embed -- calling kb10_store
-- directly (plain Lua, no contract). Every source-node write must carry canonical
-- thread lineage (external_source/external_id/external_version + source_ref +
-- thread_event_id/seq); this surface enforces it, the invariant the public kb_store
-- binding rejects on so ad-hoc callers cannot forge source content. Exposed as
-- DTO/colon-methods so the engine-agnostic source_materializer planner drives it.

local kb10_store = require("kb10_store")

local M = {}

local SOURCE_NODE_TYPES: { [string]: boolean } = { document = true, summary = true, chunk = true }

local function arg_table(args: any): { [string]: any }
    if type(args) == "table" then return args :: { [string]: any } end
    return {}
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function source_node_type(node_type: any): boolean
    return type(node_type) == "string" and SOURCE_NODE_TYPES[node_type] == true
end

local function reject_missing_lineage(op: string, field: string): (nil, string)
    return nil, op .. " for document/summary/chunk nodes requires canonical thread event " .. field
end

local function reject_mismatched_lineage(op: string, field: string): (nil, string)
    return nil, op .. " for document/summary/chunk nodes has mismatched canonical thread event " .. field
end

local function source_ref_from(args: { [string]: any }, metadata: any): any
    if type(args) == "table" and type(args.source_ref) == "table" then return args.source_ref end
    if type(metadata) == "table" and type(metadata.source_ref) == "table" then return metadata.source_ref end
    return nil
end

-- require_source_lineage enforces that a source-node write carries a canonical,
-- self-consistent thread lineage (matching source_ref).
local function require_source_lineage(op: string, args: any, metadata: any): (boolean?, string?)
    local a = arg_table(args)
    metadata = type(metadata) == "table" and metadata or {}
    local source_ref = source_ref_from(a, metadata)
    local external_id = trim(a.external_id)
    if external_id == "" then external_id = trim(metadata.external_id) end
    if external_id == "" and type(source_ref) == "table" then external_id = trim(source_ref.external_id) end
    if external_id == "" then return reject_missing_lineage(op, "external_id") end
    if type(source_ref) ~= "table" then return reject_missing_lineage(op, "source_ref") end

    local external_source = trim(a.external_source)
    if external_source == "" then external_source = trim(metadata.external_source) end
    if external_source == "" then external_source = trim(source_ref.external_source) end
    if external_source == "" then return reject_missing_lineage(op, "external_source") end
    if trim(source_ref.external_source) == "" then return reject_missing_lineage(op, "source_ref.external_source") end
    if trim(source_ref.external_source) ~= external_source then return reject_mismatched_lineage(op, "source_ref.external_source") end

    if trim(source_ref.external_id) == "" then return reject_missing_lineage(op, "source_ref.external_id") end
    if trim(source_ref.external_id) ~= external_id then return reject_mismatched_lineage(op, "source_ref.external_id") end

    local external_version = trim(a.external_version)
    if external_version == "" then external_version = trim(metadata.external_version) end
    if external_version == "" then external_version = trim(source_ref.external_version) end
    if external_version == "" then return reject_missing_lineage(op, "external_version") end
    if trim(source_ref.external_version) == "" then return reject_missing_lineage(op, "source_ref.external_version") end
    if trim(source_ref.external_version) ~= external_version then return reject_mismatched_lineage(op, "source_ref.external_version") end

    local event_id = trim(a.thread_event_id)
    if event_id == "" then event_id = trim(metadata.thread_event_id) end
    if event_id == "" then event_id = trim(source_ref.thread_event_id) end
    if event_id == "" then return reject_missing_lineage(op, "thread_event_id") end
    if trim(source_ref.thread_event_id) == "" then return reject_missing_lineage(op, "source_ref.thread_event_id") end
    if trim(source_ref.thread_event_id) ~= event_id then return reject_mismatched_lineage(op, "source_ref.thread_event_id") end

    local event_seq = tonumber(a.thread_event_seq)
    if event_seq == nil then event_seq = tonumber(metadata.thread_event_seq) end
    if event_seq == nil then event_seq = tonumber(source_ref.thread_event_seq) end
    if event_seq == nil then return reject_missing_lineage(op, "thread_event_seq") end
    local source_ref_seq = tonumber(source_ref.thread_event_seq)
    if source_ref_seq == nil then return reject_missing_lineage(op, "source_ref.thread_event_seq") end
    if source_ref_seq ~= event_seq then return reject_mismatched_lineage(op, "source_ref.thread_event_seq") end

    return true, nil
end

local function existing_node(store_id: any, node_id: any): (any, string?)
    local node, err = kb10_store.get_node(store_id, node_id)
    if err then return nil, tostring(err) end
    return node, nil
end

local function validate_replace_document(args: { [string]: any }): string?
    local document = type(args.document) == "table" and args.document or {}
    if document.node_type ~= "document" then
        return "replace_document requires a document root"
    end
    local ok, lineage_err = require_source_lineage("replace_document", {}, document.metadata)
    if not ok then return lineage_err end

    local doc_metadata = type(document.metadata) == "table" and document.metadata or {}
    local doc_source = trim(doc_metadata.external_source)
    local doc_external_id = trim(doc_metadata.external_id)
    local doc_external_version = trim(doc_metadata.external_version)
    local doc_event_id = trim(doc_metadata.thread_event_id)
    local doc_event_seq = tonumber(doc_metadata.thread_event_seq)

    for _, child in ipairs(type(args.children) == "table" and args.children or {}) do
        local node = type(child.node) == "table" and child.node or child
        if not source_node_type(node.node_type) then
            return "replace_document child must be a document/summary/chunk source node"
        end
        local child_ok, child_lineage_err = require_source_lineage("replace_document", {}, node.metadata)
        if not child_ok then return child_lineage_err end
        local child_metadata = type(node.metadata) == "table" and node.metadata or {}
        if trim(child_metadata.external_source) ~= doc_source then
            local _, err = reject_mismatched_lineage("replace_document", "child.external_source")
            return err
        end
        if trim(child_metadata.external_id) ~= doc_external_id then
            local _, err = reject_mismatched_lineage("replace_document", "child.external_id")
            return err
        end
        if trim(child_metadata.external_version) ~= doc_external_version then
            local _, err = reject_mismatched_lineage("replace_document", "child.external_version")
            return err
        end
        if trim(child_metadata.thread_event_id) ~= doc_event_id then
            local _, err = reject_mismatched_lineage("replace_document", "child.thread_event_id")
            return err
        end
        if tonumber(child_metadata.thread_event_seq) ~= doc_event_seq then
            local _, err = reject_mismatched_lineage("replace_document", "child.thread_event_seq")
            return err
        end
    end
    return nil
end

-- ─── source write surface (DTO/colon methods) ───────────────────────────

function M.get_store(_self: any, args: any): (any, string?)
    return kb10_store.get_store(arg_table(args).component_id)
end

function M.vector_dimensions(_self: any, _args: any): (number, string?)
    return kb10_store.VECTOR_DIMENSIONS, nil
end

function M.insert_node(_self: any, args: any): (any, string?)
    local a = arg_table(args)
    local node = (type(a.node) == "table" and a.node or {}) :: { [string]: any }
    if source_node_type(node.node_type) then
        local ok, lineage_err = require_source_lineage("insert_node", {}, node.metadata)
        if not ok then return nil, lineage_err end
    end
    return kb10_store.insert_node(a.store_id, node)
end

function M.delete_node(_self: any, args: any): (any, string?)
    local a = arg_table(args)
    local node, get_err = existing_node(a.store_id, a.node_id)
    if get_err then return nil, get_err end
    if source_node_type(node and node.node_type) then
        local ok, lineage_err = require_source_lineage("delete_node", {}, node and node.metadata)
        if not ok then return nil, lineage_err end
    end
    return kb10_store.delete_node(a.store_id, a.node_id)
end

function M.insert_embedding(_self: any, args: any): (any, string?)
    local a = arg_table(args)
    if source_node_type(a.node_type) then
        local node, get_err = existing_node(a.store_id, a.node_id)
        if get_err then return nil, get_err end
        local ok, lineage_err = require_source_lineage("insert_embedding", {}, node and node.metadata)
        if not ok then return nil, lineage_err end
    end
    return kb10_store.insert_embedding(a.store_id, a.node_id, a.node_type, a.parent_id, a.embedding)
end

function M.replace_document(_self: any, args: any): (any, string?)
    local a = arg_table(args)
    local validation_err = validate_replace_document(a)
    if validation_err then return nil, validation_err end
    return kb10_store.replace_document(a.store_id, {
        document = a.document,
        children = a.children,
    })
end

function M.delete_documents_by_external_id(_self: any, args: any): (any, string?)
    local a = arg_table(args)
    local ok, lineage_err = require_source_lineage("delete_documents_by_external_id", a, a.metadata)
    if not ok then return nil, lineage_err end
    return kb10_store.delete_documents_by_external_id(a.store_id, a.external_source, a.external_id)
end

return M
