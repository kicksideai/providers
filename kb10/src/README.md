# kickside/kb10

The document/graph knowledge-base engine for KickSide.

This module owns:

- The `kb10_*` schema (`kb10_stores`, `kb10_nodes`, `kb10_embeddings`, `kb10_edges`, FTS) created by its baseline and forward migrations.
- The node/edge/embedding store (`kickside.kb10.persist:kb10_store`) — the only code that reads/writes those tables.
- The engine funcs: contextual document embedding (`embed_func`), hybrid lexical/vector query with optional document analysis (`query_func`), and teardown (`delete_func`). The shared `embed_reference_func` (content-provider dispatch) lives in knowledge.
- The bindings:
  - `kb_store` implements `kickside.knowledge:kb_store` (default), the engine seam knowledge's control plane uses to reach a KB's store.
  - `kb_store_materializer` implements `kickside.knowledge:kb_store_materializer`, the internal durable source-thread seam for document/summary/chunk materialization.
  - `embeddable` / `queryable` implement the KickSide KB surface (`kickside.contract:embeddable` / `queryable`) plus `kickside.contract:deletable`.

## Boundary

kb10 is an implementation module. Knowledge's control plane (KB CRUD, browse/graph API, concept-graph enrichment/retrieval, digest) never imports this module's persistence — it resolves the `kickside.knowledge:kb_store` contract, which kb10 binds by default. Source injection resolves the internal `kickside.knowledge:kb_store_materializer` contract from the durable thread projection worker.

kb10 depends on `kickside/knowledge` only for the contract definition it implements and for the `graph_retrieval` library `query_func` invokes on graph-type KBs.

## Engine descriptors

kb10 exposes `document`, `graph`, and `wiki` as declarative
`kickside.kb_engine` entries. Each entry declares the same embeddable/queryable
bindings, the `kickside.knowledge:kb_store` control-plane contract, and the
internal `kickside.knowledge:kb_store_materializer` contract. The knowledge
module discovers those descriptors; it does not special-case kb10 for create,
read/list, query, delete, or source projection.

## Test

```
make test
```

Boots kb10 + knowledge + component/uploads/dataflow/llm and runs the co-located `*_test.lua` suites against an in-memory SQLite database. Embedding/ingest suites issue real `llm.embed` calls — `OPENAI_API_KEY` must be set.

## Retrieval

QueryKB and the search API use the existing store retrieval entry point with the
original query text and its embedding. SQLite FTS5 (unicode61) and PostgreSQL
GIN/tsvector (simple, normalized word boundaries) preserve unstemmed terms.
Digit-bearing query tokens anchor codes and identifiers in lexical candidates;
remaining terms rank attributes and names. Tokens are quoted, so user text
cannot inject full-text operators.

The store deduplicates lexical and vector candidates by node id and applies
reciprocal rank fusion before the requested limit: rank constant 10, lexical
weight 3 for queries with identifier tokens and 1 otherwise, vector weight 1.
Candidate lists are bounded to 50–400 nodes. Results expose both component
ranks and vector similarity; `similarity` on hybrid results is the normalized
fusion score, rather than a cosine probability. When no lexical candidate
matches, retrieval retains the existing vector ranking and scores. Internal
vector-only calls retain their existing behavior.

Optional summary analysis may add focused candidates, but cannot exclude
original-query candidates from unselected documents. Document, wiki, and graph
KB descriptors share the same query binding and ranking implementation.

Migration 07 upgrades the existing indexes and backfills existing content
without embeddings or re-ingestion. Repeating it does not duplicate lexical
rows. The existing writer updates SQLite FTS rows alongside nodes inside the
same transaction, including replacement, update, rollback, and cascading
deletes. PostgreSQL's generated column maintains its GIN index on node writes.
