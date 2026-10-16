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

## Key concepts

See the [registry and API reference](src/README.md) for the module contract.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
cd test
wippy install
cd ..
make lint
make test
cd test
wippy test --profile postgres --set vars.pg_database=kickside_readme_test
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/webscout)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
