<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# kickside/memory

The typed memory engine and agent memory capability.

This module owns:

- `kickside.memory.migrations:01_memory_schema` defines the baseline storage.
  `kickside.memory.migrations:05_memory_upgrade` drops the baseline Memory tables
  and creates typed storage with stable topic identities, payload vectors,
  source ownership, scoped pins and consolidation cycle identities. It accesses
  only Memory-owned objects and copies no data or configuration.
  The resulting tables are `kickside_memory_stores`, `kickside_memory_items`,
  `kickside_memory_keys`, `kickside_memory_payloads`, `kickside_memory_provenance`,
  `kickside_memory_embeddings`, `kickside_memory_cursors`, `kickside_memory_runs`
  and `kickside_memory_run_sources`. SQLite uses `kickside_memory_fts`;
  PostgreSQL indexes the items' generated search vector.
- `kickside.memory:engine_memory` describes the Memory knowledge-base engine.
  `kickside.memory:store_lifecycle` implements its store lifecycle;
  `kickside.memory:memory_store` supplies embedding, query and deletion;
  `kickside.memory:maintainable` schedules consolidation and re-embedding.
- `kickside.memory:memory` is the agent trait. It requires `memory_id` and uses
  `kickside.memory:memory_settings`. Its memory binding is
  `kickside.memory.agent:memory_binding`; the tools are `search_tool`
  and `forget_tool` in `kickside.memory.agent`.

## Storage and capture

The writer appends structural events and stores erasable payloads in one
transaction. Item-added events reference the key row by `key_id`; topic text,
item content and values stay outside the ledger. The projection folds accepted
items and their vectors into the read model. Forgetting an item or value erases
every occurrence of it, the versions it replaced and their retained source input;
forgetting an attribute by key erases all its versions. Content-free run
diagnostics remain.

A capture records its span and source ownership in a derive run. Its cursor
advances through `capture.advanced` only after the derive commits. An active
job owns that host's unconsumed span. A failed run remains visible; the next
capture includes the unconsumed history. Consolidation reflects across owner
scopes; re-embedding conditionally replaces payload vectors under the accepted item lock and content hash.

Invalid structured model output fails the whole call with a retryable,
content-free `model_output_invalid_<step>_<reason>` code. No partial candidates
commit. The job attempt limit retries failed derive attempts; an exhausted run
stays `failed` without advancing capture.

A source event above the derive input byte bound has its own run with a
`source_too_large` rejection, byte size and bound recorded at enrollment.
Its text stays out of retained input and subsequent capture context. Capture
records the run as `rejected` and advances the cursor past the event in the
same transaction, with no model call. Surrounding events retain their normal
capture and erasure ownership.

## Boundary

Knowledge owns knowledge-base components and engine discovery. Component ACLs
control access to each memory. Owner memories are scoped to the calling actor;
agent identity and rules are scoped to the agent. Consumers use the declared
contracts and the `/memory` HTTP API.
