# kickside/webscout

Web research tools and typed evidence sources over pluggable search providers.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/webscout
wippy install
```

Apply host bindings and migrations through the application install plan.
Install a search provider and select the providers and evidence Sources the research capability uses.

## Requirements

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

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

## Use

Configure an available search-provider descriptor in Settings, then attach WebScout capabilities to an agent or compose its Research Sources. Search returns evidence summaries; read the selected page for content. Provider modules own API keys and provider-specific search behavior.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`FetchAllLinks`](src/traits/_index.yaml) | `limit`, `cursor` |
| [`ReadPage`](src/traits/_index.yaml) | See the operation schema |
| [`WebSearch`](src/traits/_index.yaml) | `cursor` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.webscout:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.webscout:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.webscout:endpoint_api`](src/_index.yaml) | `https://www.googleapis.com/customsearch/v1` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/webscout)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
