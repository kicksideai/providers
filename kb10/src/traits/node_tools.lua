-- KB node/graph explorer agent tools (GetKBNode / BrowseKB / TraverseKBGraph /
-- SurveyKB). Engine-shaped: they read the kb10 node/edge store through
-- kickside.kb10.reader:kb_nodes, and share the render + kb_id-resolution helpers
-- with knowledge's generic tools (kickside.knowledge.traits:kb_render). Every
-- tool returns markdown (a string) with full labels and full node content. An
-- unresolved kb_id is a domain error { success = false, error, kb_ids }; access
-- refusals and store failures are the typed errors of the component service and
-- the node store.

local render = require("render")
local kb_nodes = require("kb_nodes")
local component = require("component")
local tool_result = require("tool_result")

local M = {}

local id_str = render.id_str
local node_label = render.node_label
local result_line = render.result_line
local norm_limit = render.norm_limit
local pick_kb_ids = render.pick_kb_ids

-- The single KB a node-targeted tool acts on, or the domain error naming the
-- configured choices when none or several resolve.
local function single_kb(args: any, context: any): (string?, any?)
    local kb_id = render.pick_kb_id(args, context)
    if kb_id then return kb_id, nil end
    local kb_ids = pick_kb_ids(args, context)
    if #kb_ids >= 2 then
        return nil, tool_result.domain_error("kb_id is required: several KBs are configured; pass kb_id (the @kbid from QueryKB results)",
            { kb_ids = kb_ids })
    end
    return nil, tool_result.domain_error("kb_id is required")
end

local function readable(kb_id: string): error?
    local _, err = component.validate_access(kb_id, component.ACCESS.READ)
    return err
end

function M.get_node(args: any, context: any): (any?, error?)
    local a = (type(args) == "table") and (args :: { node_id: any }) or {}
    local kb_id, missing = single_kb(args, context)
    if not kb_id then return missing end
    local access_err = readable(kb_id)
    if access_err then return nil, access_err end
    local node, err = kb_nodes.get_node(kb_id, a.node_id)
    if err then return nil, err end
    local n = node :: { id: any, node_type: any, content: any }
    local node_type = (type(n.node_type) == "string") and (n.node_type :: string) or "node"
    local content = (type(n.content) == "string") and (n.content :: string) or ""
    return "# " .. id_str(n.id) .. " [" .. node_type .. "]\n\n" .. content
end

-- browse: list nodes under a parent (or top-level), filterable by node_type.
-- Returns one summary row per node (id, type, label). With a parent_id, lists
-- that node's children. With a node_type and no
-- parent, spans all parents (so summaries/chunks/child concepts are reachable).
-- With neither, lists the top-level nodes.
function M.browse(args: any, context: any): (any?, error?)
    local a = (type(args) == "table") and (args :: { parent_id: any, node_type: any, limit: any, offset: any }) or {}
    local kb_id, missing = single_kb(args, context)
    if not kb_id then return missing end
    local access_err = readable(kb_id)
    if access_err then return nil, access_err end
    local has_parent = type(a.parent_id) == "string" and a.parent_id ~= ""
    local has_type = type(a.node_type) == "string" and a.node_type ~= ""
    local limit = norm_limit(a.limit) :: integer
    local offset = (type(a.offset) == "number" and a.offset >= 0) and math.floor(a.offset :: number) or 0
    local nodes, err = kb_nodes.browse(kb_id, {
        parent_id = a.parent_id,
        top_level = (not has_parent) and (not has_type),
        node_type = a.node_type,
        limit = limit + 1,
        offset = offset,
        include_content = false,
    })
    if err then return nil, err end
    local list = (nodes :: {any}?) or {}
    local parent = has_parent and id_str(a.parent_id) or "top"
    if #list == 0 then return "# Browse " .. parent .. " (0)\n\n_No nodes here._" end
    local shown = math.min(#list, limit)
    local blocks = { "# Browse " .. parent .. " (" .. tostring(shown) .. ")" }
    for index = 1, shown do
        local raw = list[index]
        local node = (type(raw) == "table") and (raw :: { id: any, node_type: any, content: any }) or {}
        local node_type = (type(node.node_type) == "string") and (node.node_type :: string) or "node"
        local row = result_line(node.id, node_label(node), node_type)
        blocks[#blocks + 1] = row
    end
    if #list > limit then
        blocks[#blocks + 1] = "_More nodes: pass offset=" .. tostring(offset + shown) .. "._"
    end
    return table.concat(blocks, "\n\n")
end

local function browse_one(kb_id: string, node_type: string, limit: integer?, with_content: boolean?): ({any}?, error?)
    local nodes, err = kb_nodes.browse(kb_id, {
        node_type = node_type,
        include_content = with_content == true,
        limit = limit,
    })
    if err then return nil, err end
    return (nodes :: {any}?) or {}, nil
end

local SCOPE_ORDER = { "concept", "document", "chunk", "summary" }
local SCOPE_PLURAL = { concept = "concepts", document = "documents", chunk = "chunks", summary = "summaries" }
local function scope_line(meta: any): string
    local m = type(meta) == "table" and meta or {}
    local types = {
        concept = tonumber(m.concept_count) or 0,
        document = tonumber(m.document_count) or 0,
        chunk = tonumber(m.chunk_count) or 0,
        summary = tonumber(m.summary_count) or 0,
    }
    local parts: {string} = {}
    for _, t in ipairs(SCOPE_ORDER) do
        local n = types[t]
        if type(n) == "number" and n > 0 then
            parts[#parts + 1] = tostring(n) .. " " .. SCOPE_PLURAL[t]
        end
    end
    if #parts == 0 then return "" end
    return "# " .. table.concat(parts, " · ")
end

-- Deterministic concept enumeration: the holistic topic map for a graph/wiki KB.
-- Concepts are walked root-first by hierarchy (parent path), then by label, then id
-- — a stable, reproducible order with NO vector ranking and NO content, so the same
-- KB yields the same numbered topic list every call and the agent drills by id.
local CONCEPT_PAGE = 500
local function all_concepts(kb_id: string): ({any}?, error?)
    local concepts: {any} = {}
    local offset = 0
    while true do
        local page, err = kb_nodes.browse(kb_id, { node_type = "concept", limit = CONCEPT_PAGE, offset = offset })
        if err then return nil, err end
        local rows = (page :: {any}?) or {}
        for _, row in ipairs(rows) do concepts[#concepts + 1] = row end
        if #rows < CONCEPT_PAGE then return concepts, nil end
        offset = offset + #rows
    end
end

local function concept_map(kb_id: string, cap: integer): ({any}, {[string]: integer}, integer, error?)
    -- Read every concept (labels only) so the hierarchy is complete before the
    -- rendered order is capped.
    local concepts, err = all_concepts(kb_id)
    if not concepts then return {}, {}, 0, err end
    if #concepts == 0 then return {}, {}, 0, nil end

    -- Index by id and group children by parent for a hierarchy walk.
    local by_id: { [string]: any } = {}
    local children: { [string]: {any} } = {}
    local roots: {any} = {}
    for _, raw in ipairs(concepts) do
        local node = (type(raw) == "table") and (raw :: { id: any, parent_id: any, metadata: any }) or {}
        local id = (type(node.id) == "string") and (node.id :: string) or tostring(node.id)
        by_id[id] = node
    end
    local function sort_nodes(list: {any})
        table.sort(list, function(x: any, y: any): boolean
            local lx, ly = node_label(x), node_label(y)
            if lx ~= ly then return lx < ly end
            return tostring(x.id) < tostring(y.id)
        end)
    end
    for _, raw in ipairs(concepts) do
        local node = (type(raw) == "table") and (raw :: { parent_id: any }) or {}
        local pid = (type(node.parent_id) == "string") and (node.parent_id :: string) or ""
        if pid ~= "" and by_id[pid] then
            children[pid] = children[pid] or {}
            table.insert(children[pid], node)
        else
            roots[#roots + 1] = node
        end
    end
    sort_nodes(roots)

    -- Stable DFS: emit a node, then its children (label-ordered), depth-first, until
    -- the render cap. Depth is tracked for indentation so the map reads as a TOC.
    local ordered: {any} = {}
    local depth_of: { [string]: integer } = {}
    local function walk(node: any, depth: integer)
        if #ordered >= cap then return end
        local id = (type(node.id) == "string") and (node.id :: string) or tostring(node.id)
        ordered[#ordered + 1] = node
        depth_of[id] = depth
        local kids = children[id]
        if kids then
            sort_nodes(kids)
            for _, child in ipairs(kids) do walk(child, depth + 1) end
        end
    end
    for _, root in ipairs(roots) do walk(root, 0) end
    return ordered, depth_of, #concepts, nil
end

-- Graph/wiki overview: the deterministic concept map, doc counts attached from one
-- bounded batch edge query (categorized_as edges into each enumerated concept).
local function survey_graph(kb_id: string, limit: integer): (string?, error?)
    local ordered, depth_of, total, err = concept_map(kb_id, limit)
    if err then return nil, err end
    if #ordered == 0 then return "_This KB has no concepts yet._" end

    local ids: {any} = {}
    for _, node in ipairs(ordered) do ids[#ids + 1] = node.id end
    local counts, counts_err = kb_nodes.concept_doc_counts(kb_id, ids)
    if counts_err then return nil, counts_err end

    local lines = { "## Concept map (" .. tostring(#ordered) .. ")" }
    for _, node in ipairs(ordered) do
        local id = (type(node.id) == "string") and (node.id :: string) or tostring(node.id)
        local indent = string.rep("  ", depth_of[id] or 0)
        local docs = (counts :: {[string]: integer})[id]
        local label = node_label(node)
        if docs and docs > 0 then label = label .. " (docs " .. tostring(docs) .. ")" end
        lines[#lines + 1] = indent .. result_line(id, label)
    end
    if total > #ordered then
        lines[#lines + 1] = "_" .. tostring(total - #ordered) .. " more concepts: list them with BrowseKB node_type=concept._"
    end
    return table.concat(lines, "\n")
end

-- Document overview: summary node identifiers under their parent document.
-- Falls back to the document list when
-- no summary nodes exist, and to an explicit empty notice for a genuinely empty KB.
local function survey_document(kb_id: string, limit: integer): (string?, error?)
    local list, err = browse_one(kb_id, "summary", limit + 1, false)
    if not list then return nil, err end
    if #list > 0 then
        local shown = math.min(#list, limit)
        local blocks = { "## Summaries (" .. tostring(shown) .. ")" }
        for index = 1, shown do
            local raw = list[index]
            local node = (type(raw) == "table") and (raw :: { parent_id: any, content: any }) or {}
            local doc_id = (type(node.parent_id) == "string" and node.parent_id ~= "")
                and node.parent_id or (node :: { id: any }).id
            blocks[#blocks + 1] = result_line((node :: {id: any}).id, node_label(node), "summary")
                .. " (document " .. id_str(doc_id) .. ")"
        end
        if #list > limit then
            blocks[#blocks + 1] = "_More summaries: list them with BrowseKB node_type=summary offset=" .. tostring(shown) .. "._"
        end
        return table.concat(blocks, "\n\n")
    end

    local docs, derr = browse_one(kb_id, "document", limit + 1, false)
    if not docs then return nil, derr end
    if #docs == 0 then return "_This KB has no documents yet._" end
    local shown = math.min(#docs, limit)
    local lines = { "## Documents (" .. tostring(shown) .. ") — no summaries generated yet" }
    for index = 1, shown do
        local raw = docs[index]
        local node = (type(raw) == "table") and (raw :: { id: any }) or {}
        lines[#lines + 1] = result_line(node.id, node_label(node))
    end
    if #docs > limit then
        lines[#lines + 1] = "_More documents: list them with BrowseKB node_type=document offset=" .. tostring(shown) .. "._"
    end
    return table.concat(lines, "\n")
end

-- One KB's holistic overview: a scope line, then a concept map (graph KB) or
-- document summaries (document KB).
local function survey_one(kb_id: string, limit: integer, meta: any): (string?, error?)
    local is_graph, graph_err = kb_nodes.is_graph(kb_id)
    if graph_err then return nil, graph_err end
    local scope = scope_line(meta)
    local head = (scope ~= "") and (scope .. "\n") or ""
    local body, err
    if is_graph then
        body, err = survey_graph(kb_id, limit)
    else
        body, err = survey_document(kb_id, limit)
    end
    if not body then return nil, err end
    return head .. body, nil
end

-- The KB's human title (public component meta) for a multi-KB survey header,
-- falling back to its id when no title is set.
local function kb_title(kb_id: string, meta: any): string
    local t = (meta :: { title: any }).title
    if type(t) == "string" and t ~= "" then return t :: string end
    return kb_id
end

-- summaries (SurveyKB): a holistic, type-aware overview of the bound KB — it leads with public component meta counts and then:
--   * graph/wiki KB → a deterministic CONCEPT MAP (labels + doc counts, no content)
--     that the agent navigates by id (TraverseKBGraph / BrowseKB / GetKBNode);
--   * document KB → summary node identifiers, labels and parent document ids.
-- An empty summary set on a document KB falls back to listing documents so the
-- survey is never misleadingly blank, and a genuinely empty KB says so.
function M.summaries(args: any, context: any): (any?, error?)
    local a = (type(args) == "table") and (args :: { limit: any }) or {}
    local kb_ids = pick_kb_ids(args, context) :: { string }
    if #kb_ids == 0 then return tool_result.domain_error("kb_id is required") end
    for _, kb_id in ipairs(kb_ids) do
        local access_err = readable(kb_id)
        if access_err then return nil, access_err end
    end
    local limit = norm_limit(a.limit) :: integer

    -- Several pinned: survey each base and concatenate under its own title header,
    -- so the agent gets a holistic overview of every KB without passing a kb_id.
    local parts: { string } = {}
    for _, kb_id in ipairs(kb_ids) do
        local meta, meta_err = kb_nodes.public_meta(kb_id)
        if meta_err then return nil, meta_err end
        local survey, survey_err = survey_one(kb_id, limit, meta)
        if not survey then return nil, survey_err end
        parts[#parts + 1] = #kb_ids == 1 and survey or ("# " .. kb_title(kb_id, meta) .. "\n\n" .. survey)
    end
    return table.concat(parts, "\n\n"), nil
end

-- graph: traverse the concept graph outward from a node (graph KBs). Returns
-- markdown: the connected concepts (with how many documents categorize under
-- each), the edges between them, and a continuation line when the node limit
-- left reachable nodes out.
function M.graph(args: any, context: any): (any?, error?)
    local a = (type(args) == "table") and (args :: { node_id: any, depth: any, limit: any }) or {}
    local kb_id, missing = single_kb(args, context)
    if not kb_id then return missing end
    local access_err = readable(kb_id)
    if access_err then return nil, access_err end
    local limit = norm_limit(a.limit)
    local result, err = kb_nodes.graph(kb_id, a.node_id, { depth = a.depth, limit = limit })
    if err then return nil, err end
    local r = (type(result) == "table") and (result :: { nodes: any, edges: any, truncated: any }) or {}
    local nodes = (type(r.nodes) == "table") and (r.nodes :: {any}) or {}
    local edges = (type(r.edges) == "table") and (r.edges :: {any}) or {}

    -- Document arity per concept: count categorized_as edges that target it, so the
    -- agent sees which concepts carry the most content without reading every node.
    local docs_into: { [string]: integer } = {}
    for _, raw in ipairs(edges) do
        local e = (type(raw) == "table") and (raw :: { edge_type: any, to_node_id: any }) or {}
        if e.edge_type == "categorized_as" and type(e.to_node_id) == "string" then
            local k = e.to_node_id :: string
            docs_into[k] = (docs_into[k] or 0) + 1
        end
    end

    local lines = { "# Graph from " .. id_str(a.node_id) }
    lines[#lines + 1] = "## Concepts (" .. tostring(#nodes) .. ")"
    for _, raw in ipairs(nodes) do
        local node = (type(raw) == "table") and (raw :: { id: any, node_type: any }) or {}
        local node_type = (type(node.node_type) == "string") and (node.node_type :: string) or "node"
        local nid = (type(node.id) == "string") and (node.id :: string) or tostring(node.id)
        local label = node_label(node)
        local docs = docs_into[nid]
        if docs and docs > 0 then label = label .. " (docs " .. tostring(docs) .. ")" end
        lines[#lines + 1] = result_line(node.id, label, node_type)
    end
    lines[#lines + 1] = "## Edges (" .. tostring(#edges) .. ")"
    for _, raw in ipairs(edges) do
        local e = (type(raw) == "table") and (raw :: { from_node_id: any, to_node_id: any, edge_type: any }) or {}
        local edge_type = (type(e.edge_type) == "string") and (e.edge_type :: string) or "edge"
        lines[#lines + 1] = "- " .. id_str(e.from_node_id) .. " —[" .. edge_type .. "]→ " .. id_str(e.to_node_id)
    end
    if r.truncated == true then
        lines[#lines + 1] = "_More nodes are reachable within this depth than limit=" .. tostring(limit)
            .. " holds: traverse again from one of the concepts above, or lower depth._"
    end
    return table.concat(lines, "\n")
end

return M
