# kickside/kb10

Document and graph knowledge storage, embeddings, and durable ingestion bindings.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/kb10
wippy install
```

Apply host bindings and migrations through the application install plan.
Bind the knowledge store contract and configure the model and embedding capabilities required by the installed knowledge workflows.

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
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make build` from this directory;
commit regenerated tracked assets with the source.

## Retrieval optimization

Raw question embeddings remain the default for new and existing knowledge bases.
The create/edit settings pane declares two optional retrieval settings:

- `query_strategy: hyde` generates a hypothetical answer with the KB's `analysis_model` and embeds it with the original question. `plain` or an omitted field uses the raw question. HyDE uses at most 400 generation tokens and a 20-second timeout; the passage contributes at most 2,000 UTF-8 bytes without splitting a character. Provider failures and malformed answers return typed errors without a raw-query fallback.
- `self_tuning: true` records retrieval outcomes and learns standing summary/query instructions from evenly sampled summaries and weak queries. An omitted or false field records no observations and starts no tuning. `self_tuning_query_interval` defaults to 25 and accepts integers from 5 to 500. Tuning uses the same declared `analysis_model`, at most 1,200 generation tokens, and a 30-second timeout. Each attempt reads at most 16 summary excerpts of 350 bytes and 12 weak-query excerpts of 500 bytes; the observation window holds at most 500 rows per KB.

A tuning attempt requires WRITE access and checks it again after generation. A durable lease admits one attempt at a time. Settings saved during generation remain intact; changing the model, opt-in setting or standing prompts cancels the proposal. All text bounds preserve complete UTF-8 characters. The query response carries optional `retrieval` metadata with the strategy, tuning admission and outcome. Read-only callers see `requires_write` plus the typed refusal classification. Generation or persistence failures return errors and a claimed tuning attempt records its failure. Successful tuning records its timestamp, rationale and evidence counts in `config.tuning`; the settings pane shows the last applied tuning.

Tuning updates guidance for future retrieval and ingestion. Existing documents, vectors and summaries remain in place; the existing maintenance actions regenerate them when requested.

## Use

Install with Knowledge, configure embedding and analysis models, then create a document or wiki knowledge base. Wiki offers Wiki and Graph views. Ingest through Knowledge’s content interfaces and inspect processing before query. KB10 owns materialization, retrieval, graph views, and maintenance; Knowledge owns base lifecycle.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`BrowseTree`](src/graph/_index.yaml) | See the operation schema |
| [`CreateConcept`](src/graph/_index.yaml) | See the operation schema |
| [`AttachDocument`](src/graph/_index.yaml) | See the operation schema |
| [`MoveDocument`](src/graph/_index.yaml) | See the operation schema |
| [`MergeConcept`](src/graph/_index.yaml) | See the operation schema |
| [`GetConceptDocuments`](src/graph/_index.yaml) | `limit`, `offset` |
| [`GetKBNode`](src/traits/_index.yaml) | See the operation schema |
| [`BrowseKB`](src/traits/_index.yaml) | `limit`, `offset` |
| [`TraverseKBGraph`](src/traits/_index.yaml) | `limit` |
| [`SurveyKB`](src/traits/_index.yaml) | `limit` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.kb10:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.kb10:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.kb10:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.kb10:target_db`](src/_index.yaml) | Host supplies the value |
| [`kickside.kb10.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/kb10)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
