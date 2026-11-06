# kickside/webscout-brave

Brave search provider and Research Source for WebScout.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/webscout-brave
wippy install
```

Apply host bindings and migrations through the application install plan.
Set the Brave API key in provider settings and enable Brave for WebScout.

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

Set the Brave API key in **System → Settings → Brave Search**, then select `brave` as WebScout’s `search_provider`. Installation makes Brave selectable without changing the existing provider selection. The module also contributes typed web/news Research Sources.

## Reference

- [Module reference](src/README.md)

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/webscout-brave)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
