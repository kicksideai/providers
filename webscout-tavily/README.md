# kickside/webscout-tavily

Tavily search provider for WebScout.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/webscout-tavily
wippy install
```

Apply host bindings and migrations through the application install plan.
Set the Tavily API key in provider settings (Integrations → Tavily) and select
Tavily for WebScout.

The free plan gives 1,000 API credits a month without a card; one basic search
costs one credit. When the credits run out, Tavily answers 432 and WebScout
reports "Tavily monthly credit limit reached (432)". See
[Tavily credits](https://docs.tavily.com/documentation/api-credits).

## Data use

Tavily's [terms](https://www.tavily.com/terms) allow it to use queries and
results to train its models, and free access may be withdrawn without notice.
Do not send personal names or other personal data through this provider without
legal approval.

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

Set the Tavily API key in Settings, then select `tavily` as WebScout’s `search_provider`. The provider contributes trait search; WebScout owns discovery and the provider-neutral result shape.

## Reference

- [Module reference](src/README.md)

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/webscout-tavily)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
