# kickside/sso-oidc

Configurable generic OIDC login provider.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/sso-oidc
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure issuer, client credentials, callback URI, and claim mapping, then enable the provider in SSO settings.

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

## Provider configuration

Install with `kickside/sso`. Open **System → Settings → SSO**, configure the
provider credentials, and enable it. Register the callback displayed by the
provider panel with the identity provider. SSO login is separate from a service
OAuth connection.

| Setting | Type |
| --- | --- |
| [`kickside.sso.providers.oidc/enabled`](src/_index.yaml) | `bool` |
| [`kickside.sso.providers.oidc/issuer`](src/_index.yaml) | `string` |
| [`kickside.sso.providers.oidc/client_id`](src/_index.yaml) | `string` |
| [`kickside.sso.providers.oidc/client_secret`](src/_index.yaml) | `secret` |
| [`kickside.sso.providers.oidc/scopes`](src/_index.yaml) | `json` |
| [`kickside.sso.providers.oidc/allow_unverified_email`](src/_index.yaml) | `bool` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/sso-oidc)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
