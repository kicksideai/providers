# KickSide Memory

Memory is a knowledge-base engine (`kb_type: memory`). Each memory is a
Knowledge Base component; an agent attaches one memory.

## Storage

The knowledge base thread (`thread_id == component_id`) is the ledger. It holds
structure only, never memory text: writers append typed events at an expected
head.

- `kickside.memory.events:item.added`: `item_id, claim_id, content_hash, kind, key, cardinality, scope_family, scope_id, valid_at, source, run_id?, provenance[]`
- `item.revised`: `item_id, payload_id, content_hash, priority` (new text or priority, same claim)
- `item.superseded`: `item_id, by, invalid_at, resolved_conflict?`
- `item.merged`: `item_ids, into`
- `item.conflicted`: `item_ids, group_id` (always a complete group)
- `item.archived` and `item.restored`: `item_id, actor`
- `item.forgotten`: `item_id, actor`
- `provenance.added`: `item_id, host_kind, host_id, event_id`
- `capture.advanced`: `host_kind, host_id, last_event_id`
- `consolidation.completed`: `run_id, stats`

Memory text and typed values live in `kickside_memory_payloads`, stored under
the item id, with each revision under its own payload id and explicit item
ownership, in the transaction that appends their events; vectors (512
dimensions, the knowledge base's embedding model) live beside them in
`kickside_memory_embeddings`. The ledger projection folds events into
`kickside_memory_items` (with a searchable copy of each payload),
`kickside_memory_provenance`, the full-text index and cursors. Rebuilding the
projection from the ledger restores structure; text comes back from the
payloads.

A claim is one typed value of a canonical key in a scope
(`claim_id = canonical_json hash(component, scope, key, value)`; values keep
their JSON type, text compares without case or spacing). An item is one
occurrence of a claim: the same claim stated again later is a new item with its
own `valid_at`. Every key has a cardinality persisted in `kickside_memory_keys`, independently
of its live items: a `single` key holds at most one
current value per scope, whatever kind labels its items; `multi` keys hold
several. Versions are numbered per scope and key. A key names a topic, such as
`home_city`; owner creation and Remember require it and reject keys containing
the supplied text or value.

Forget erases: the item's text, value, vector, full-text row and provenance,
every occurrence of the same claim and every predecessor or successor linked
by replacement or merge, the retained run inputs and errors containing it, and
every pinned prompt that included it. Independent values of a multi key stay. The ledger events stay, carrying no text.
Archive is the reversible alternative: an archived item leaves recall and the
prompt until restored. Agent instructions already compiled by `wippy/agent`
remain in the active runner until the agent is compiled again; memory has no
framework hook to invalidate that snapshot.

Kinds: `identity, rule, profile_slot, fact, preference, skill, lesson`.
Scopes: `agent:<agent id>` (identity and rules, edited by people with write
access) and `owner:<user id>` (everything captured from a user's
conversations). Status: `current, superseded, conflict, archived, forgotten`.

## Engine contracts

The engine descriptor `kickside.memory:engine_memory` names
`kickside.knowledge:kb_store_lifecycle` as its store contract and
`kickside.memory:store_lifecycle` as its store binding (`create_store`, `get_store`,
`update_config`, `delete_store`). The component impl binding
`kickside.memory:memory_kb` implements `embeddable`, `queryable` (current items
in the caller's scopes; `meta.node_type`, `meta.similarity`, `meta.created_at`)
and `deletable` (bounded purge after the ledger is purged);
`kickside.memory:maintainable` implements `kickside.knowledge:maintainable`
(resummarize brings consolidation forward; reembed recomputes every vector).
Configuration is validated against the descriptor's `config_schema` on create
and update.

## Write path

Every writer (capture, the Remember tool, reflection, owner operations) settles
the read model at the ledger head, decides on that state through one decision
(`engine/decision.lua`) that applies the same state rules, and commits payloads, vectors and the
decision's events in one transaction at that head. Duplicate appends do not
restage payloads. Reflection reads its evidence and calls the model inside
that decision, so a moved head refuses the derived result. A moved head is a
retryable failure: the writer decides again on the newer state, and nothing it
staged stays behind.

1. Capture (trait `before_step`, `after_persist`, `deactivate`, checkpoint)
   moves the host cursor under compare-and-set and records a derive run that
   holds the captured span and the user's frozen identity.
2. The derive job extracts candidates with the extraction model and reconciles
   each: a claim already current is seen again; a forgotten claim is not
   learned again; a single-valued key holding another value relates to that
   value only (the reconcile model chooses `SUPERSEDE | MERGE | NOOP |
   CONFLICT`; an explicit Remember replaces it); otherwise the same-key items, including those added in the same decision, and nearest live
   items of the scope reach the reconcile model, which chooses `ADD | SUPERSEDE
   | MERGE | NOOP | CONFLICT` over their ids. On supersession the later
   `valid_at` wins. Conflicts keep every contested item in one group.
3. Owner operations use the same decision with owner authority: no judge, the
   same rules.

Failures close the run as `failed` with the reason (the memory's status and
manage view list runs). Content ingested through the knowledge control plane is
derived the same way; deleting the source keeps the memory.

Consolidation is a slot job per memory that re-arms every
`consolidation_interval_hours`; `deactivate` and the control plane's
resummarize bring it forward. The manage view archives, restores and forgets
items; `ForgetMemory` forgets the caller's own memories (never the agent's
identity, rules, skills or lessons). Deleting the knowledge base purges the
ledger and every row.

## Agents

- Memory provider `kickside.memory.agent:memory_provider`: pick it with the agent's
  memory target to recall current `fact`, `skill` and `lesson` items in the
  user's and agent's scopes each step, skipping ids already injected. Recall,
  SearchMemory and the queryable contract share `engine/recall.lua`.
- Trait `kickside.memory.agent:memory`, context `memory_id`: captures conversation, contributes the agent's
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

## Compatibility with document-backed agents

The published `kickside.memory:knowledge_based_memory` trait and its runtime,
lifecycle, checkpoint, SearchMemory and settings IDs keep their document-backed
behavior. Existing `kb_ids`, `write_kb_id`, recall prompts/budgets and checkpoint
model/prompt/temperature/budget settings remain effective. Multiple read KBs are
not collapsed into a typed store, and editing the old settings does not rewrite
them into `memory_id`.

The typed engine is an explicit capability: choose
`kickside.memory.agent:memory` and configure `memory_id`. Its provider, tools,
runtime and settings live under `kickside.memory.agent`. It requires Agent
0.5.7 or newer for the selected `after_persist` lifecycle contract. It does not
automatically migrate or replace a saved document-backed trait. Both kinds of
agent may coexist in the same installation.
