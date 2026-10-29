# kickside/bitbucket

Bitbucket Cloud credential connections and repository discovery.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/bitbucket
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a connection with an Atlassian API token or a workspace, project, or repository access token. Select the resources the credential can access.

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

Connect a Bitbucket Cloud account with a scoped API token and account email, or a workspace/project/repository access token and workspace. Discover workspaces and repositories through Connections. Select the connection on Bitbucket Reader, Writer, or Manager to work with
repository source, branches, commits, issues, pull or merge requests, reviews,
and CI. Reader and Writer are separate capabilities; installing a connection
does not automatically grant tools to an agent. The module has no Data Sync ports.

## Registry layout

Repository operations are owned by `kickside.bitbucket.repository:service`;
agent tool declarations remain under `kickside.bitbucket.traits`.

## Reference

- [Module reference](src/README.md)

### Agent tools

| Tool | Purpose |
| --- | --- |
| [`BitbucketRead`](src/traits/_index.yaml) | Read repositories and their source, changes, issues, and CI with explicit paging. |
| [`BitbucketWrite`](src/traits/_index.yaml) | Perform named, typed mutations through the selected connection. |

Writes require the provider's corresponding repository, issue, pull-request,
and pipeline permissions. Inspect the current state before changes. Only perform
requested merges, approvals, deletions, and CI runs. Every action has a closed
payload schema; arbitrary HTTP endpoints and credentials are not tool inputs.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/bitbucket)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
