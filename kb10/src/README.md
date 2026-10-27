# kickside/kb10

The document/graph knowledge-base engine for KickSide.

This module owns:

- The `kb10_*` schema (`kb10_stores`, `kb10_nodes`, `kb10_embeddings`, `kb10_edges`, FTS) created by its baseline and forward migrations.
- Node, edge, and embedding storage in the internal
  `kickside.kb10.persist:node_store` library.
- Document materialization in `kickside.kb10.injection:materializer_store` and
  the source, digest, and metadata projection workers.
- The `kickside.kb10:kb_store_lifecycle` binding implementing
  `kickside.knowledge:kb_store_lifecycle` for store create/get/update/delete.
- Embedding, query, maintenance, and deletion bindings for Knowledge consumers.

## Boundary and engine descriptors

Knowledge owns KB Components and the engine-neutral lifecycle. KB10 owns its
SQL storage, graph operations, retrieval, and source materialization. Consumers
open the lifecycle, query, embedding, or maintenance contract; they do not
import the internal store or write its tables.

The current descriptors are **document** and **wiki**. Wiki is the concept-graph
KB type and offers Wiki and Graph views over the same data. Both descriptors
use the same lifecycle/query bindings and declare their own source, digest,
and public-metadata projections. Knowledge discovers these declarations without
branching on the engine name. Source materialization uses the descriptor’s
workers; it does not use a public materializer contract.

## Original document source

`GET /kb10/{id}/nodes/{node_id}/source` is relative to the host's authenticated
API router. It requires an authenticated actor, KB READ access and a document
node belonging to the KB's store. The node's `upload_id`, or
`source_ref.upload_id`, selects its original upload.

The unreleased storage integration calls `uploads.delivery_url` with audience
`kb.source` and a 300-second expiry. Its successful JSON response keeps
`success`, `url`, `filename` and `content_type`. A URL can point to signed S3
content or tokened Uploads raw delivery. Obtain a new source response after the
URL expires; object-host CORS must permit browser reads.

KB10 requires Uploads >=0.3.2 for this helper; it is absent in 0.3.1. The endpoint
trusts the node's stored upload reference and does not perform an additional
upload-component access check. Source ingestion must validate that relationship
while preserving legitimate shared-KB reads. Do not treat KB READ access as
permission to attach an arbitrary upload ID.

## Test

```
make test
```

Run `make lockrefresh` first. The standalone harness owns its tests and fixtures
and loads local modules through workspace replacements. Its PostgreSQL profile
uses a dedicated database. Tests that call real model providers require the
corresponding credentials; offline suites use the declared fixtures.

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
original-query candidates from unselected documents. Document and wiki
KB descriptors share the same query binding and ranking implementation.

Migration 07 upgrades the existing indexes and backfills existing content
without embeddings or re-ingestion. Repeating it does not duplicate lexical
rows. The existing writer updates SQLite FTS rows alongside nodes inside the
same transaction, including replacement, update, rollback, and cascading
deletes. PostgreSQL's generated column maintains its GIN index on node writes.
