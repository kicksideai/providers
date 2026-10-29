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
    learn_in_isolation: false
```

Runners supply a stable opaque `host.id`, an open `host.kind`, and an author for
each history event. Human-authored attributes and goals belong to that human.
Parent tasks and workflow input never establish a human profile. Agent lessons,
skills and work facts stay in agent scope. Runs acting for a person recall their
profile alongside the agent's rules and relevant learning.

**Learn from isolated runs** defaults to off. Isolated runs still recall memory;
enabling it captures reusable lessons, skills and stable knowledge. Task inputs,
intermediate values, fetched page contents and one-off results do not qualify.
Plans in isolation require work that explicitly spans runs. Human conversation
capture remains active with either setting. **Memory rules** use the memory's
existing `extraction_instructions` to specify what to keep and what to skip in
both modes.

Requires the runner-neutral `wippy.agent:run_context` contract. The trait supplies SearchMemory and
ForgetMemory. Background capture learns from conversation automatically.
Corrections supersede values and retain history. SearchMemory returns canonical
keys and typed values. ForgetMemory selects the caller's attribute by key and
erases its versions, payloads, vectors, provenance and retained source input. A
value narrows it to that value and the versions it replaced, so a value that
replaced it stays current; a multi-valued key requires the value. Owner-scoped
items belong to the signed-in user; agent identity and rules are managed on the
memory page.

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
