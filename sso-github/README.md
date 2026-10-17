# kickside/sso-github

GitHub OAuth login provider for the KickSide SSO framework.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/sso-github
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure the GitHub OAuth client and callback URI, then enable the provider in SSO settings.

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
| [`kickside.sso.providers.github/enabled`](src/_index.yaml) | `bool` |
| [`kickside.sso.providers.github/client_id`](src/_index.yaml) | `string` |
| [`kickside.sso.providers.github/client_secret`](src/_index.yaml) | `secret` |
| [`kickside.sso.providers.github/scopes`](src/_index.yaml) | `json` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/sso-github)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.sso.providers.github:endpoint_authorize`](src/_index.yaml) | `https://github.com/login/oauth/authorize` |
| [`kickside.sso.providers.github:endpoint_token`](src/_index.yaml) | `https://github.com/login/oauth/access_token` |
| [`kickside.sso.providers.github:endpoint_userinfo`](src/_index.yaml) | `https://api.github.com/user` |
| [`kickside.sso.providers.github:endpoint_emails`](src/_index.yaml) | `https://api.github.com/user/emails` |
