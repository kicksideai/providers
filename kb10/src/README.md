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

Knowledge may request `get_store({component_id, stats = true})` or the stats-only
`get_store({component_ids})` on the named lifecycle binding. Both reads require
an authorized Knowledge caller. Each returned `stats` object includes committed
accepted and failed roots, nodes, edges, installed embeddings, non-root concepts,
chunks and summaries from one database snapshot. A batch omits stores the owner
cannot find and carries no configuration.

The read does one scoped SQL statement for up to 2,000 component IDs. Its cost
tracks the node, edge and vector populations in the requested stores. Revisit
transaction-owned store totals if large populated pages dominate catalog latency.
Ordinary store/config lookups keep their existing query.

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

## Installed source projection

Core 0.3.51 or later runs the primary KB source worker through Jobs under the
projection's stored actor and scope. It keeps the ordinary extractor, model
options, source reducer, graph events, and digest and treatment finalizers.
Graph placement is best effort after the checkpoint commits. A stop between
commit and placement delivery can leave a document without a placement request.

Keeper Update all runs migration 15 and wakes Core's existing declaration
converger. Core preserves the projection, cursor, job, source fold and the
operator's active or paused state. A busy active predecessor serves its
backlog through the head recorded at upgrade. At a settled Jobs boundary,
Core switches the existing slot and the new worker consumes later uploads. A pre-upgrade
target write whose acknowledgment was lost has no saved outcome from which to
recover its original counts.

For a shared database resource, Core commits the checked node and vector
writes, projection fold, cursor advancement and emitted events together. For
separate databases, KB10 prepares its changes in a target transaction and
commits that transaction from Core's fenced checkpoint. If the subsequent
Core commit fails, the next attempt reuses the target's recorded outcome.
Recovery verifies the store token, owner, cursor, reset and eligible event IDs
and sequence numbers. Deleting the store retires its token and recovery data.
Migration 15 initializes existing stores on their next primary-source run.

The store retains one result. It contains the manifest, changed fold fields,
changed source entries, new dead letters, graph events and placement requests.
The worker groups inputs up to a 16 MiB prepared-change budget or a 1 MiB
serialized contribution budget, checking between inputs. It also closes the
group when the time remaining on Core’s deadline would be consumed by another
input as slow as the longest in the group and a publication taking as long as
the group’s preparation. After a failed claim it publishes the first eligible
input by itself. An unexpectedly slow input can still exceed the estimate on
the first attempt. One admitted input can exceed these budgets. Core limits
incoming event rows through
`limits.max_row_bytes` (4 MiB by default), and a source outcome can contain
multiple copies of lineage or diagnostic text. The underlying projection fold
still contains the source history and Core rewrites that fold at checkpoint.
Existing graph state carries the counts available at cutover.

### Opt-in model response preparation

Once the Core and KB10 preparation migrations are installed, a host can select
`proc://kickside.kb10.injection:resumable_primary_source_worker` in the
installed source projection declaration. Core's declaration converger performs
the same retained-slot transition described above. The default source
declarations continue to select the primary worker.

Preparation applies to the first eligible Markdown, plain-text, or CSV input
of at least 128 KiB on a shared Core, Jobs, and KB10 database resource. The
input must use concrete model names with one configured provider route and
carry no image artifacts. A converted workbook uses its Markdown input. Other
inputs and split storage use the ordinary publication path.

A new claim rebuilds the existing parser plan and verifies the rendered model
requests before reusing saved responses. This retains spreadsheet headers,
row windows, contextual decisions, and the final checked publication. A
response costs at most 1 MiB per saved batch, with bounds of 1,024 calls and
128 MiB for one preparation. Once a bound is reached, remaining calls in
that claim use the ordinary model path. Large parser work and final native
publication must still fit in one claim. A provider response lost before its
checkpoint may need to be requested again.

## Browse document populations

`GET /api/v1/kb10/{id}/browse?scope=documents` lists accepted top-level
document roots. `scope=failures` lists failed-only roots. A rejected update
that preserves the accepted revision stays in Documents. Each page's `total`
is the count of committed roots in its scope and includes rows outside the
page. Requesting a scope requires KB READ access, as with ordinary browse.

Omit `scope` to browse the existing `node_type` or `parent_id` filters. That
route continues to count the full set matching the filter.

## Original document source

`GET /kb10/{id}/nodes/{node_id}/source` is relative to the host's authenticated
API router. It requires an authenticated actor, KB READ access and a document
node belonging to the KB's store. The node's `upload_id`, or
`source_ref.upload_id`, selects its original upload.

`uploads.delivery_url` receives the stored upload ID, audience `kb.source` and
a 300-second expiry. The JSON response contains `success`, `url`, `filename`
and `content_type`. S3-backed uploads return a signed URL to the object.
Local uploads return a tokenized raw-file URL. For browser reads, configure
CORS on the object host. Request the source route again to renew an expired URL.

The KB10 dependency declaration sets the minimum supported Uploads version.
Ingestion must validate the upload reference it attaches to a document. This
allows a KB reader to open that document's original through the KB access
check. [Dependency declaration](_index.yaml)

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
