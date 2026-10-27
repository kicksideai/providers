# kickside/memory

The typed memory engine and agent memory capability.

This module owns:

- One schema migration, `kickside.memory.migrations:01_memory_schema`, creates
  `kickside_memory_stores`, `kickside_memory_items`, `kickside_memory_keys`,
  `kickside_memory_payloads`, `kickside_memory_provenance`,
  `kickside_memory_embeddings`, `kickside_memory_cursors`,
  `kickside_memory_runs` and `kickside_memory_run_sources`. SQLite also uses
  `kickside_memory_fts`; PostgreSQL indexes the items' generated search vector.
- `kickside.memory:engine_memory` describes the Memory knowledge-base engine.
  `kickside.memory:store_lifecycle` implements its store lifecycle;
  `kickside.memory:memory_store` supplies embedding, query and deletion;
  `kickside.memory:maintainable` schedules consolidation and re-embedding.
- `kickside.memory:memory` is the agent trait. It requires `memory_id` and uses
  `kickside.memory:memory_settings`. Its memory binding is
  `kickside.memory.agent:memory_binding`; the tools are `search_tool`,
  `remember_tool` and `forget_tool` in `kickside.memory.agent`.

## Storage and capture

The writer appends structural events and stores erasable payloads in one
transaction. Item-added events reference the key row by `key_id`; topic text,
item content and values stay outside the ledger. The projection folds accepted
items and their vectors into the read model. Forgetting erases all versions
and their retained source input while keeping content-free run diagnostics.

A capture records its span and source ownership in a derive run. Its cursor
advances through `capture.advanced` only after the derive commits. An active
job owns that host's unconsumed span. A failed run remains visible; the next
capture includes the unconsumed history. Consolidation reflects across owner
scopes; re-embedding updates accepted item vectors through the shared writer.

## Boundary

Knowledge owns knowledge-base components and engine discovery. Component ACLs
control access to each memory. Owner memories are scoped to the calling actor;
agent identity and rules are scoped to the agent. Consumers use the declared
contracts and the `/memory` HTTP API.

## Test

Run `make lockrefresh` before the SQLite and PostgreSQL suites. Scripted model
fixtures cover extraction, reconciliation, capture, erasure, search and replay.
The frontend uses the shared UI kit and ships its built assets in `static/`.
