# KickSide Memory

Memory is a knowledge-base engine (`kb_type: memory`). Each memory is a
Knowledge Base component; an agent attaches one memory.

## Storage

The knowledge base thread (`thread_id == component_id`) is the ledger. Writers
append typed events at an expected head:

- `kickside.memory.events:item.added`: `item_id, kind, scope_family, scope_id, key, value, content, valid_at, source, provenance[]`
- `item.superseded`: `item_id, by, invalid_at`
- `item.merged`: `item_ids, into`
- `item.conflicted`: `item_ids, group_id`
- `item.forgotten` and `item.restored`: `item_id, actor, reason`
- `provenance.added`: `item_id, host_kind, host_id, event_id`
- `capture.advanced`: `host_kind, host_id, last_event_id`
- `consolidation.completed`: `run_id, stats`

The ledger projection folds events into `kickside_memory_items`,
`kickside_memory_provenance`, the full-text index and cursors; the tables are
rebuildable from the ledger, which is retained for the lifetime of the memory.
Item ids are content-derived (`sha256(component | kind | scope | key | value)`),
so replayed work is idempotent. Vectors (512 dimensions, the knowledge base's
embedding model) live in `kickside_memory_embeddings`.

Kinds: `identity, rule, profile_slot, fact, preference, skill, lesson`.
Scopes: `agent:<agent id>` (identity and rules, edited by people with write
access) and `owner:<user id>` (everything captured from a user's
conversations). Status: `current, superseded, conflict, forgotten`.

## Engine contracts

The engine descriptor `kickside.memory:engine_memory` names
`kickside.memory:kb_store_lifecycle` as its store contract: the knowledge
control plane opens an engine's store contract without a binding, so memory
declares its own contract with the methods of
`kickside.knowledge:kb_store_lifecycle` (`create_store`, `get_store`,
`update_config`, `delete_store`). The component impl binding
`kickside.memory:memory_kb` implements `embeddable`, `queryable` (current items
in the caller's scopes; `meta.node_type`, `meta.similarity`, `meta.created_at`)
and `deletable` (bounded purge after the ledger is purged);
`kickside.memory:maintainable` implements `kickside.knowledge:maintainable`
(resummarize brings consolidation forward; reembed recomputes every vector).
Configuration is validated against the descriptor's `config_schema` on create
and update.

## Write path

1. Capture (trait `before_step`, `after_persist`, `deactivate`, checkpoint)
   moves the host cursor under compare-and-set and records a derive run that
   holds the captured span and the user's frozen identity.
2. The derive job extracts candidates with the extraction model, then
   reconciles each: exact id, then same-key and nearest items of the same scope
   and kind, then the reconcile model chooses `ADD | SUPERSEDE | MERGE | NOOP |
   CONFLICT` over the neighbors' ids. On supersession the later `valid_at`
   wins. Conflicts keep both items in a conflict group.
3. The decision is appended at the head the read model was settled at; a
   moved head is a retryable failure and the job decides again.

Failures close the run as `failed` with the reason (the memory's status and
manage view list runs). Content ingested through the knowledge control plane is
derived the same way; deleting the source keeps the memory.

Consolidation is a slot job per memory that re-arms every
`consolidation_interval_hours`; `deactivate` and the control plane's
resummarize bring it forward. `ForgetMemory` and the manage view forget an
item; deleting the knowledge base purges the ledger and every row.

## Agents

- Memory provider `kickside.memory:memory_provider`: pick it with the agent's
  memory target to recall current `fact`, `skill` and `lesson` items in the
  user's and agent's scopes each step, skipping ids already injected. Recall,
  SearchMemory and the queryable contract share `engine/recall.lua`.
- Trait `kickside.memory:knowledge_based_memory`, context `memory_id` (earlier
  agents: `write_kb_id`, else the first of `kb_ids`): captures conversation, contributes the agent's
  identity, rules, skills and lessons to the compiled prompt, renders the
  user's profile and preferences pinned at activation into every step (byte
  identical until the next activation), and adds `SearchMemory`, `Remember`
  and `ForgetMemory`. Tools write only to that memory and the caller's own
  scope.

## HTTP

`/memory/{id}/items`, `/items/{item_id}` (`GET`, `PUT`), `/items/{item_id}/forget`,
`/items/{item_id}/restore`, `/conflicts`, `/conflicts/{group_id}/resolve`,
`/status` on the host's authenticated router; component access decides each
call.
