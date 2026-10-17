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

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
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

Connect a Bitbucket Cloud account with a scoped API token and account email, or a workspace/project/repository access token and workspace. Discover workspaces and repositories through Connections. This module supplies connection discovery, without agent tools or Data Sync ports.

## Reference

- [Module reference](src/README.md)

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/bitbucket)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
