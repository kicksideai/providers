# kickside/telegram

Telegram bot connections, inbound adapters, and reply delivery.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/telegram
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a bot-token connection and configure inbound delivery. Link external identities to users before routing private agent conversations.

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

Connect a bot token and select the accessible chat. The provider polls `getUpdates`, normalizes inbound DM/channel messages, and supplies read/reply tools. Identity links and the configured responder determine admitted execution; the provider does not trust identity fields in message payloads.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`TelegramRead`](src/traits/_index.yaml) | See the operation schema |
| [`TelegramWrite`](src/traits/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.telegram:endpoint_api`](src/_index.yaml) | `https://api.telegram.org` |
| [`kickside.telegram:endpoint_file`](src/_index.yaml) | `https://api.telegram.org` |
| [`kickside.telegram.polling:process_host`](src/polling/_index.yaml) | Host supplies the value |
| [`kickside.telegram.polling:target_db`](src/polling/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/telegram)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

The Send Telegram Message writable port sends, edits, and deletes one message per item. It requires connection WRITE access and a chat ID; deletion requires the stored message reference. Message content fits the Telegram 4096-byte cap. The binding declares `at_most_once` delivery and `content` input. Rate limits return a delay to the engine.
