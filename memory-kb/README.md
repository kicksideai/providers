<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# kickside/memory-kb

Long-term memory for KickSide agents. A memory is a Knowledge Base of type
**Memory**: typed, versioned memory items with provenance, kept on the knowledge
base's own ledger and searched with hybrid vector and full-text recall.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/memory-kb
wippy install
```

Then:

1. Create a memory: **Knowledge → + Knowledge Base**, type **Memory**.
2. Attach it to an agent: mount the **Memory** trait and select the memory.
   For recall each step, also pick the **Memory** provider with the memory as
   the agent's memory target.
3. Chat. Conversations are captured into the memory; the memory page shows
   what was learned, earlier versions, conflicts to resolve, and every capture
   and consolidation run.

```yaml
traits:
  - kickside.memory_kb.agent:memory
trait_contexts:
  kickside.memory_kb.agent:memory:
    memory_id: <memory-knowledge-base-id>
```

The existing `kickside/memory` document-backed trait retains its IDs, settings and installation requirements. This module is separate and opt-in; select `memory_id` explicitly. Installing or removing it does not reinterpret saved agents.

## How it works

- Memory items are typed: identity, rule, profile slot, fact, preference,
  skill, lesson. Identity and rules belong to an agent and are edited on the
  memory page; everything learned from a user's conversations belongs to that
  user and is recalled only for them.
- Capture reads the conversation since the last captured message and schedules
  a derive run. The extraction model proposes candidate memories, reusing the
  kinds and keys the person's memories already use; each is matched against
  existing memories and, when ambiguous, the reconcile model decides, from what
  the person said, whether it is new, a duplicate, an update, the same memory
  phrased better, or a contradiction. A profile slot holds one value: a new
  value replaces or contests it. Updates keep the earlier version; the later
  event time wins; contradictions wait in a conflict group for a person.
- The agent's identity and rules are part of its compiled instructions; the
  user's profile and preferences are pinned when the agent activates and stay
  byte-identical across steps, so prompt caching holds. With the Memory
  provider, other relevant memories are recalled each step.
- Failed runs keep their reason and are listed on the memory page.
- Forget erases an item: its text, every earlier version of it, and the
  conversation lines it was learned from; it cannot be undone. Archive hides an
  item from recall and the prompt until it is restored. Deleting the knowledge
  base erases the memory and its ledger. Deleting a source conversation or
  document keeps what was learned from it.
- The ledger never holds memory text; see src/README.md.

See [src/README.md](src/README.md) for the ledger, tables and contracts.

### Agent tools

- [`SearchMemory`](src/_index.yaml): `query`, `fields`, `limit`, `cursor`.
- [`Remember`](src/_index.yaml): required `content` and canonical topic `key`; optional `kind`, `value`, `cardinality`, `valid_at`.
- [`ForgetMemory`](src/_index.yaml): `item_id` (the caller's own memories only).

Tools write only to the memory attached to the agent and only into the calling
user's own memories, and refuse to write when the trait's `write_enabled` is
off. Topic keys name an attribute, such as `home_city`, and cannot contain the
memory text or value. `SearchMemory` returns complete unresolved groups
separately as `alternatives`, with pagination by group.

### Host requirements

Bind these requirement IDs through the module's dependency declaration or Hub
plan. Existing explicit bindings take precedence over defaults.

- [`kickside.memory_kb:ui_server`](src/_index.yaml): HTTP server for the web components.
- [`kickside.memory_kb:api_router`](src/_index.yaml): authenticated router for the memory API.
- [`kickside.memory_kb:target_db`](src/_index.yaml): the component database for the memory tables.
- [`kickside.memory_kb.security:user_security_scope`](src/security/_index.yaml): defaults to the platform Members group.

## API

These routes use the ambient authenticated actor and the memory component ACL.
READ access permits browsing all scopes in a memory; WRITE access permits mutations.
Responses use `success: true`. Lists accept `limit` (1–200, default 50) and
`offset` (default 0), return `count` for this page, and include `next_offset`
only when another page exists. Errors use `success: false` and `error`.

| Route | Response | Filters |
| --- | --- | --- |
| `GET /memory` | `{success, items: [{id, name, title, description, item_count}], count, next_offset?}` | Optional `q` matches memory names, case-insensitively. The component control plane supplies access, names and counts. |
| `GET /memory/{id}/items` | `{success, items: [item], count, next_offset?}` | Optional comma-separated `status` and `kind`. Nonempty `q` uses the shared hybrid search with the memory's embedding model and returns ranking fields; an absent or empty `q` preserves list ordering. |
| `GET /memory/{id}/topics` | `{success, topics: [{key, cardinality, current_count}], count, next_offset?}` | Optional `scope_family=agent\|owner` and `kind`. Counts cover current items matching these filters; canonical topics remain available when their current count is zero. Ordered by key and cardinality. |
| `GET /memory/{id}/items/{item_id}` | `{success, item, provenance, versions, next_offset?}` | `limit` and `offset` page versions of the same scope and topic across kinds. |

Item rows include `id`, `kind`, `scope_family`, `scope_id`, `key`,
`cardinality`, `content`, typed `value`, `status`, `version` and validity times.
Search adds `similarity` and, when lexical and dense ranks are fused,
`hybrid_score`, `vector_rank`, and `lexical_rank`.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. The `after_persist` capture
path needs a `wippy/agent` release with that lifecycle phase. The harness uses
SQLite and declares a PostgreSQL test profile. Frontend development uses
Node.js, npm and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
make test-pg
make build
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward; set `pg_host`, `pg_port`, `pg_database`, `pg_username` and
`pg_password` in the harness configuration. Edit frontend source under `ui/`
and run `make build`; commit the regenerated `static/` assets with the source.

The suites include a capture and reconcile eval (`test/eval`): duplicates,
corrections, contradictions, small talk and recalled-memory notes, each captured
in two sessions on a fresh memory and scored as precision and recall per action.
The suite run answers every model call with the ideal answer, which checks the
pipeline; to score real models, override the target on a harness with model
providers configured:

```bash
cd test && wippy test -o app.eval:target:meta.extraction_model=<model> \
  -o app.eval:target:meta.judge_model=<model> -o app.eval:target:meta.embedding_model=<embedding-model> \
  -o app.eval:target:meta.answers=live
```

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/memory-kb)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
