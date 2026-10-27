<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# kickside/memory

Typed long-term memory for agents. Each memory stores versioned facts,
preferences, profile attributes and goals with provenance. Identity, rules,
skills and lessons supply agent context. Hybrid search combines vectors and
full-text retrieval; the memory page shows items, conflicts, activity and settings.

Create a Memory knowledge base, attach the **Memory** trait to an agent and
select its memory. The trait configures recall on each step and requires
`memory_id`:

```yaml
traits:
  - kickside.memory:memory
trait_contexts:
  kickside.memory:memory:
    memory_id: <memory-id>
```

The trait requires a released `wippy/agent` that compiles recall behaviors
into the shared memory binding plan and recalls that plan on each step. It supplies SearchMemory, Remember and ForgetMemory. Corrections
supersede values and retain history. ForgetMemory erases the selected item's
versions, payloads, vectors, provenance and retained source input. Owner-scoped
items belong to the signed-in user; agent identity and rules are managed on
the memory page.

The host binds `ui_server`, `api_router`, `target_db` and
`kickside.memory.security:user_security_scope`. Models, capture settings,
recall budgets and consolidation cadence belong to each memory's configuration.

## Development

Run `make lockrefresh`, `make lint`, `make test`, `make test-pg` and
`make build`. The test harness loads this module locally and resolves its
other dependencies from the Hub. Use a dedicated PostgreSQL database and set
the harness's `pg_database` and connection variables. `make ui-kit` materializes
the shared UI package before frontend installation.

[KickSide Community License 1.0](LICENSE).
