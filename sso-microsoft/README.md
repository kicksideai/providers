# kickside/sso-microsoft

Microsoft Entra OIDC login provider for the KickSide SSO framework.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/sso-microsoft
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure the Entra OIDC client, tenant settings, and callback URI, then enable the provider in SSO settings.

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
| [`kickside.sso.providers.microsoft/enabled`](src/_index.yaml) | `bool` |
| [`kickside.sso.providers.microsoft/client_id`](src/_index.yaml) | `string` |
| [`kickside.sso.providers.microsoft/client_secret`](src/_index.yaml) | `secret` |
| [`kickside.sso.providers.microsoft/tenant`](src/_index.yaml) | `string` |
| [`kickside.sso.providers.microsoft/scopes`](src/_index.yaml) | `json` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/sso-microsoft)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.sso.providers.microsoft:endpoint_issuer_template`](src/_index.yaml) | `https://login.microsoftonline.com/{tenant}/v2.0` |
