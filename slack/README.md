# kickside/slack

Slack bot connections, Socket Mode inbound messages, and replies.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/slack
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a bot connection with the bot and app tokens, and configure Socket Mode and the bot scopes required by inbound messages and replies.

## Key concepts

Provider registry declarations expose capabilities to the host. Connections
keep user credentials in private context; shared contracts define how agents
and application modules call those capabilities.
See the [registry and API reference](src/README.md) for the module contract.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.55a. Use current Hub dependencies
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

Connect a bot token and app-level Socket Mode token. The socket adapter authenticates and normalizes inbound messages for DM or Channel; reply tools use the selected connection. Configure identity links and responder access before enabling shared-channel behavior.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`SlackRead`](src/traits/_index.yaml) | `limit`, `cursor` |
| [`SlackWrite`](src/traits/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.slack:endpoint_api`](src/_index.yaml) | `https://slack.com/api` |
| [`kickside.slack:endpoint_socket`](src/_index.yaml) | `https://slack.com/api/apps.connections.open` |
| [`kickside.slack.socket:process_host`](src/socket/_index.yaml) | Host supplies the value |
| [`kickside.slack.socket:target_db`](src/socket/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/slack)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
