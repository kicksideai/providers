-- Facade over the kb10 persistence layer. The store's read/write logic lives in
-- the reader and writer libraries (sharing connection/dialect handling through
-- ops); this module re-exports every method under its original name so the
-- engine funcs and the kb_store contract binding keep a single, stable surface:
-- kickside.kb10.persist:store.

local reader = require("kb10_reader")
local writer = require("kb10_writer")
local ops = require("kb10_ops")

local store = {}

-- Reads
store.get_store = reader.get_store
store.vector_search = reader.vector_search
store.browse_nodes = reader.browse_nodes
store.count_nodes = reader.count_nodes
store.get_summaries = reader.get_summaries
store.list_document_summaries = reader.list_document_summaries
store.get_node = reader.get_node
store.get_nodes = reader.get_nodes
store.get_edges = reader.get_edges
store.get_edges_batch = reader.get_edges_batch
store.graph_traverse = reader.graph_traverse
store.find_by_external_id = reader.find_by_external_id

-- Writes
store.create_store = writer.create_store
store.update_config = writer.update_config
store.delete_store = writer.delete_store
store.insert_node = writer.insert_node
store.insert_graph_node = writer.insert_graph_node
store.update_node = writer.update_node
store.write_node_with_embedding = writer.write_node_with_embedding
store.replace_document = writer.replace_document
store.insert_embedding = writer.insert_embedding
store.insert_nodes = writer.insert_nodes
store.insert_embeddings = writer.insert_embeddings
store.insert_edges = writer.insert_edges
store.delete_node = writer.delete_node
store.delete_documents_by_external_id = writer.delete_documents_by_external_id
store.set_descriptions = writer.set_descriptions
store.insert_edge = writer.insert_edge
store.delete_edge = writer.delete_edge
store.apply_graph_patch = writer.apply_graph_patch

store.VECTOR_DIMENSIONS = ops.VECTOR_DIMENSIONS

return store
