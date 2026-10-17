# kickside/hubspot

HubSpot private-app connections with separate read and write tools.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/hubspot
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a connection with a HubSpot private-app token and enable the scopes required by the selected tools.

## Key concepts

Provider registry declarations expose capabilities to the host. Connections
keep user credentials in private context; shared contracts define how agents
and application modules call those capabilities.
See the [registry and API reference](src/README.md) for the module contract.

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

## Use

Create a connection with a private-app access token. Select enabled object types, properties, and watermarks for Data Sync. Reader and Writer capabilities remain separate. Engagement objects are pull-only; the writable port supports the operations declared by its input schema.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`HubSpotRead`](src/traits/_index.yaml) | `limit`, `after` |
| [`HubSpotWrite`](src/traits/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.hubspot:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.hubspot:default_field_mapping_ref`](src/_index.yaml) | `kickside.hubspot.client:default_field_mapping.standard` |
| [`kickside.hubspot:endpoint_api`](src/_index.yaml) | `https://api.hubapi.com` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/hubspot)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
