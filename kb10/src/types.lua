local M = {}

type Map = { [string]: any }
type Vector = { number }

type StoreConfig = Map

type StoreCreateOptions = {
    kb_type: string?,
    enrichment_agent_id: string?,
    is_graph: boolean?,
    name: string?,
    description: string?,
}

type StoreRow = {
    id: string,
    component_id: string,
    embedding_model: string?,
    config: StoreConfig?,
    auto_summary: string?,
    auto_description: string?,
    kb_type: string?,
    enrichment_agent_id: string?,
}

type NodeInput = {
    id: string?,
    parent_id: string?,
    node_type: string?,
    content: any?,
    content_type: string?,
    metadata: Map?,
}

type NodePatch = {
    metadata: Map?,
    content: any?,
    content_type: string?,
}

type NodeRow = {
    id: string,
    store_id: string,
    parent_id: string?,
    node_type: string?,
    content: any?,
    content_type: string?,
    metadata: Map?,
    created_at: any?,
    updated_at: any?,
    similarity: number?,
}

type EdgeInput = {
    from_node_id: string?,
    to_node_id: string?,
    edge_type: string?,
    weight: number?,
    metadata: Map?,
}

type EdgeRow = {
    id: string,
    store_id: string,
    from_node_id: string,
    to_node_id: string,
    edge_type: string,
    weight: number?,
    metadata: Map?,
    created_at: any?,
}

type VectorSearchOptions = {
    query_text: string?,
    limit: integer?,
    node_types: { string }?,
    parent_id: string?,
}

type BrowseNodesOptions = {
    parent_id: string?,
    top_level: boolean?,
    node_type: string?,
    limit: integer?,
    offset: integer?,
    include_content: boolean?,
}

type EdgeQueryOptions = {
    direction: string?,
    edge_type: string?,
    limit: integer?,
    offset: integer?,
}

type GraphTraverseOptions = {
    depth: integer?,
    limit: integer?,
}

type StoreCreateArgs = {
    component_id: string?,
    embedding_model: string?,
    config: StoreConfig?,
    opts: StoreCreateOptions?,
}

type ComponentStoreArgs = {
    component_id: string?,
    config: StoreConfig?,
}

type StoreIdArgs = {
    store_id: string?,
}

type BrowseNodesArgs = StoreIdArgs & {
    opts: BrowseNodesOptions?,
}

type SummariesArgs = {
    component_ids: { string }?,
}

type DescriptionsArgs = {
    store_id: string?,
    auto_summary: string?,
    auto_description: string?,
}

type NodeLookupArgs = {
    store_id: string?,
    node_id: string?,
}

type NodeMutationArgs = NodeLookupArgs & {
    node: NodeInput?,
    metadata: Map?,
    content: any?,
    content_type: string?,
}

type GraphNodeInsertArgs = StoreIdArgs & {
    node: NodeInput?,
    parent_edge: EdgeInput?,
}

type NodeBatchArgs = {
    store_id: string?,
    node_ids: { string }?,
}

type ExternalIdArgs = {
    store_id: string?,
    external_source: string?,
    external_id: string?,
}

type ExternalDeleteArgs = ExternalIdArgs & {
    metadata: Map?,
}

type EmbeddingArgs = {
    store_id: string?,
    node_id: string?,
    node_type: string?,
    parent_id: string?,
    embedding: Vector?,
}

type ReplaceDocumentChild = {
    node: NodeInput?,
    embedding: Vector?,
}

type ReplaceDocumentArgs = {
    store_id: string?,
    document: NodeInput?,
    children: { ReplaceDocumentChild }?,
}

type VectorSearchArgs = {
    store_id: string?,
    query_vector: Vector?,
    opts: VectorSearchOptions?,
}

type EdgeMutationArgs = {
    store_id: string?,
    edge: EdgeInput?,
    edge_id: string?,
}

type GraphPatchArgs = StoreIdArgs & {
    delete_edge_ids: { string }?,
    insert_edges: { EdgeInput }?,
    delete_node_id: string?,
}

type EdgeQueryArgs = {
    store_id: string?,
    node_id: string?,
    opts: EdgeQueryOptions?,
}

type EdgeBatchQueryArgs = {
    store_id: string?,
    node_ids: { string }?,
    opts: EdgeQueryOptions?,
}

type GraphTraverseArgs = {
    store_id: string?,
    start_node_id: string?,
    opts: GraphTraverseOptions?,
}

type GraphTraverseResult = {
    nodes: { NodeRow },
    edges: { EdgeRow },
}

M.Map = Map
M.Vector = Vector
M.StoreConfig = StoreConfig
M.StoreCreateOptions = StoreCreateOptions
M.StoreRow = StoreRow
M.NodeInput = NodeInput
M.NodePatch = NodePatch
M.NodeRow = NodeRow
M.EdgeInput = EdgeInput
M.EdgeRow = EdgeRow
M.VectorSearchOptions = VectorSearchOptions
M.BrowseNodesOptions = BrowseNodesOptions
M.EdgeQueryOptions = EdgeQueryOptions
M.GraphTraverseOptions = GraphTraverseOptions
M.StoreCreateArgs = StoreCreateArgs
M.ComponentStoreArgs = ComponentStoreArgs
M.StoreIdArgs = StoreIdArgs
M.BrowseNodesArgs = BrowseNodesArgs
M.SummariesArgs = SummariesArgs
M.DescriptionsArgs = DescriptionsArgs
M.NodeLookupArgs = NodeLookupArgs
M.NodeMutationArgs = NodeMutationArgs
M.GraphNodeInsertArgs = GraphNodeInsertArgs
M.NodeBatchArgs = NodeBatchArgs
M.ExternalIdArgs = ExternalIdArgs
M.ExternalDeleteArgs = ExternalDeleteArgs
M.EmbeddingArgs = EmbeddingArgs
M.ReplaceDocumentChild = ReplaceDocumentChild
M.ReplaceDocumentArgs = ReplaceDocumentArgs
M.VectorSearchArgs = VectorSearchArgs
M.EdgeMutationArgs = EdgeMutationArgs
M.GraphPatchArgs = GraphPatchArgs
M.EdgeQueryArgs = EdgeQueryArgs
M.EdgeBatchQueryArgs = EdgeBatchQueryArgs
M.GraphTraverseArgs = GraphTraverseArgs
M.GraphTraverseResult = GraphTraverseResult

-- kb10 engine binding ids. The kb_store and maintainable bindings implement
-- knowledge's engine contracts; the embeddable/queryable bindings implement the
-- KickSide KB surface. Centralized so every reference shares one vocabulary.
M.KB_STORE_BINDING = "kickside.kb10:kb_store_lifecycle"
M.EMBED_BINDING = "kickside.kb10:embeddable"
M.QUERY_BINDING = "kickside.kb10:queryable"
M.MAINTENANCE_BINDING = "kickside.kb10:maintainable"

-- Lifecycle contract this engine implements for knowledge's control plane. Only
-- the model-agnostic store lifecycle (create/get/update/delete) crosses this
-- seam; node/edge/embedding/graph ops are kb10-internal (node_store).
M.KB_STORE_LIFECYCLE_CONTRACT = "kickside.knowledge:kb_store_lifecycle"

-- Maintenance contract this engine implements for knowledge's control plane: the
-- two whole-KB rewrites and the read that follows a run. The engine descriptors
-- name MAINTENANCE_BINDING as maintenance_binding so knowledge dispatches here
-- without naming kb10.
M.MAINTAINABLE_CONTRACT = "kickside.knowledge:maintainable"

-- KB type discriminator stored in component_meta.kb_type and kb10_stores.kb_type.
type KbTypeSet = {
    DOCUMENT: string,
    WIKI: string,
}
M.KbTypeSet = KbTypeSet
M.KB_TYPE = { DOCUMENT = "document", WIKI = "wiki" } :: KbTypeSet

-- Node/edge taxonomy of the kb10 graph store. Every kb10 KB materializes
-- documents, summaries and chunks; the graph control plane adds concepts and
-- links them. Owned here (the engine) so the model-agnostic control plane never
-- names node types.
M.NODE_TYPE = { DOCUMENT = "document", SUMMARY = "summary", CHUNK = "chunk", CONCEPT = "concept" }
M.EDGE_TYPE = { SUBTOPIC_OF = "subtopic_of", CATEGORIZED_AS = "categorized_as", RELATED_TO = "related_to" }
M.CONCEPT_TYPE = { TOPIC = "topic", DOCUMENT = "document", ROOT = "root" }

-- Whether concept metadata flags the concept as its taxonomy's root.
function M.is_root_metadata(metadata: any): boolean
    return type(metadata) == "table" and (metadata.is_root == true or metadata.concept_type == M.CONCEPT_TYPE.ROOT)
end

-- Registry ids for the concept-placement tools the placement/treatment agents
-- call, and the agents themselves. kb10 owns concept-graph enrichment.
M.TOOL_BROWSE_TREE = "kickside.kb10.graph:browse_tree"
M.TOOL_CREATE_CONCEPT = "kickside.kb10.graph:create_concept"
M.TOOL_ATTACH_DOCUMENT = "kickside.kb10.graph:attach_document"
M.TOOL_MOVE_DOCUMENT = "kickside.kb10.graph:move_document"
M.TOOL_GET_CONCEPT_DOCUMENTS = "kickside.kb10.graph:get_concept_documents"
M.TOOL_MERGE_CONCEPT = "kickside.kb10.graph:merge_concept"
M.AGENT_CONCEPT_PLACEMENT = "kickside.kb10.graph.agents:concept_placement_agent"
M.AGENT_TREATMENT = "kickside.kb10.graph.agents:treatment_agent"

-- Registry id for the graph enrichment tool bundle the enrichment agent loads.
M.TOOL_GRAPH_TOOLS = "kickside.kb10.graph:graph_tools"

return M
