# kickside/memory

Agent memory policies and capabilities backed by knowledge providers.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/memory
wippy install
```

Apply host bindings and migrations through the application install plan.
Choose a declared memory policy and bind its backing store. Agent memory capabilities use provider contracts rather than a separate store.

## Checkpoint mount

Installing Memory makes its trait available. An agent selects Memory explicitly
through its traits configuration:

```yaml
traits:
  - kickside.memory:knowledge_based_memory
trait_contexts:
  kickside.memory:knowledge_based_memory:
    write_kb_id: <knowledge-base-id>
    checkpoint_model: class:fast
```

The trait's `behaviors` handles `checkpoint` through
`kickside.memory:checkpoint_binding`, implementing `wippy.agent:checkpoint`.
It returns a working summary containing facts, decisions, open tasks and recent
state. The durable digest is a separate result stored in the selected knowledge
base only when generation finds durable content. `write_enabled: false` disables
durable storage; the explicitly mounted trait still supplies the working summary.
Agents without this trait use the session's default checkpoint function.

The host's run-context selector bounds new history through
`checkpoint_source_max_chars` (12000 by default) and includes the prior working
summary. Model-window admission belongs to the host and LLM primitives.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test-backend
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make build` from this directory;
commit regenerated tracked assets with the source.

## Use

Select a memory policy and its permitted provider resources for the agent. Working-memory summaries and durable memory use the declared memory contracts under the same execution identity. Persisted resource selection grants no additional Component authority.

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`SearchMemory`](src/_index.yaml) | `fields`, `limit`, `cursor` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.memory:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/memory)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.


Typed, ledger-backed Memory knowledge bases are provided separately by the optional `kickside/memory-kb` module. This module continues to use the configured queryable/embeddable providers; it does not require that driver.
