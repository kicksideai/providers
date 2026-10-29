# kickside/atlassian

Jira and Confluence connections with OAuth or stored credentials and agent tools.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/atlassian
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure the OAuth application for Cloud 3LO, or create a stored-credential connection with a Cloud API token or Server PAT.

## Key concepts

Provider registry declarations expose capabilities to the host. Connections
keep user credentials in private context; shared contracts define how agents
and application modules call those capabilities.
See the [registry and API reference](src/README.md) for the module contract.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.55a. Use current Hub dependencies
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

Connect through Atlassian OAuth or stored credentials. Select a Jira or Confluence resource for the Reader/Writer capability or source/destination port. Data Sync owns scheduling and cursor progression; the provider owns API transport and payload shaping.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`ConfluenceRead`](src/confluence/traits/_index.yaml) | `max_results`, `start_at`, `next_page_token` |
| [`ConfluenceWrite`](src/confluence/traits/_index.yaml) | See the operation schema |
| [`JiraRead`](src/jira/traits/_index.yaml) | `fields`, `start_at`, `next_page_token`, `max_results` |
| [`JiraWrite`](src/jira/traits/_index.yaml) | `fields` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.atlassian:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.atlassian:env_storage`](src/_index.yaml) | Host supplies the value |
| [`kickside.atlassian:endpoint_resources`](src/_index.yaml) | `https://api.atlassian.com/oauth/token/accessible-resources` |
| [`kickside.atlassian:endpoint_gateway`](src/_index.yaml) | `https://api.atlassian.com` |
| [`kickside.atlassian:endpoint_authorization`](src/_index.yaml) | `https://auth.atlassian.com/authorize` |
| [`kickside.atlassian:endpoint_token`](src/_index.yaml) | `https://auth.atlassian.com/oauth/token` |
| [`kickside.atlassian:endpoint_userinfo`](src/_index.yaml) | `https://api.atlassian.com/me` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/atlassian)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
