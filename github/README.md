# kickside/github

GitHub OAuth connections, repository sources, and issue and pull-request tools.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/github
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure the provider OAuth application and authorize a connection. Repository source and agent tools respect the connection access.

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

Configure a GitHub OAuth application and callback, authorize a connection, and select it on Reader or Writer capabilities. The OAuth grant and repository access bound available operations. Data Sync can read repository issues and pull requests through the declared source port.

The existing Reader, Writer, and Manager capabilities include the corresponding
repository tools. `upsert_file` takes base64 file content, an explicit branch and
commit message; updates also require the current file SHA. `create_branch` takes
`refs/heads/<name>` and the starting commit SHA. Merging requires the expected
pull-request head SHA. The OAuth grant or PAT must allow each requested operation.

The opt-in `test/repository_live_test.lua` verifies the actual tools against a
disposable repository, including a branch, file commit, pull request, merge, and
read-back. It is disabled in normal test runs and requires demo-only environment
credentials; never point it at a production repository.

## Registry layout

Repository operations are owned by `kickside.github.repository:service`;
agent tool declarations remain under `kickside.github.traits`.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`GitHubRead`](src/traits/_index.yaml) | `limit`, `page` |
| [`GitHubWrite`](src/traits/_index.yaml) | Issue create, update, and comment actions |
| [`GitHubRepoRead`](src/traits/_index.yaml) | Repositories, branches, files, commits, pull requests, reviews, checks, and workflow runs |
| [`GitHubRepoWrite`](src/traits/_index.yaml) | Branches, file commits, pull requests, reviews, expected-SHA merges, and workflow dispatch |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.github:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.github:env_storage`](src/_index.yaml) | Host supplies the value |
| [`kickside.github:endpoint_api`](src/_index.yaml) | `https://api.github.com` |
| [`kickside.github:endpoint_authorization`](src/_index.yaml) | `https://github.com/login/oauth/authorize` |
| [`kickside.github:endpoint_token`](src/_index.yaml) | `https://github.com/login/oauth/access_token` |
| [`kickside.github:endpoint_userinfo`](src/_index.yaml) | `https://api.github.com/user` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/github)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
