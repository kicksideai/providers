# kickside/discord

Discord bot connections, inbound messages, replies, and message synchronization.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/discord
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a bot-token connection and select its permitted servers and channels. Inbound delivery and reply capabilities use that connection.

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

Connect a Discord bot token and select the bot’s accessible channels. The module exposes polled channel-message source and writable destination ports, reply tools, and a normalized inbound Gateway adapter. A live Gateway process supplies inbound events; the polled source is the Data Sync entry point.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`DiscordRead`](src/traits/_index.yaml) | `limit`, `cursor` |
| [`DiscordWrite`](src/traits/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.discord:endpoint_api`](src/_index.yaml) | `https://discord.com/api/v10` |
| [`kickside.discord:endpoint_gateway`](src/_index.yaml) | `wss://gateway.discord.gg/?v=10&encoding=json` |
| [`kickside.discord.gateway:process_host`](src/gateway/_index.yaml) | Host supplies the value |
| [`kickside.discord.gateway:target_db`](src/gateway/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/discord)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
