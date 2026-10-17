# kickside/google

Google OAuth connections and tools for mail, files, calendars, and documents.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/google
wippy install
```

Apply host bindings and migrations through the application install plan.
Configure the Google OAuth application, redirect URI, and required scopes; authorize a connection for the services the host exposes.

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

Configure the Google OAuth client in Settings, authorize a connection, and grant the service scopes required by the selected Gmail, Drive, Calendar, Docs, Sheets, Slides, Contacts, or Analytics capability. Select the account in the capability picker. Service scopes require consent even when profile sign-in already works.

## Reference

- [Module reference](src/README.md)

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`GoogleGmailRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleGmailWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleDriveRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleDriveWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleCalendarRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleCalendarWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleSheetsRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleSheetsWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleSlidesRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleSlidesWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleDocsRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleDocsWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleContactsRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleAnalyticsRead`](src/traits/_index.yaml) | `fields`, `limit`, `max_results`, `page_token`, `offset` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.google:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.google:env_storage`](src/_index.yaml) | Host supplies the value |
| [`kickside.google:endpoint_drive`](src/_index.yaml) | `https://www.googleapis.com/drive/v3` |
| [`kickside.google:endpoint_sheets`](src/_index.yaml) | `https://sheets.googleapis.com/v4/spreadsheets` |
| [`kickside.google:endpoint_analytics_admin`](src/_index.yaml) | `https://analyticsadmin.googleapis.com/v1beta` |
| [`kickside.google:endpoint_analytics_data`](src/_index.yaml) | `https://analyticsdata.googleapis.com/v1beta` |
| [`kickside.google:endpoint_gmail`](src/_index.yaml) | `https://gmail.googleapis.com/gmail/v1/users/me` |
| [`kickside.google:endpoint_contacts`](src/_index.yaml) | `https://people.googleapis.com/v1` |
| [`kickside.google:endpoint_docs`](src/_index.yaml) | `https://docs.googleapis.com/v1` |
| [`kickside.google:endpoint_calendar`](src/_index.yaml) | `https://www.googleapis.com/calendar/v3` |
| [`kickside.google:endpoint_slides`](src/_index.yaml) | `https://slides.googleapis.com/v1/presentations` |
| [`kickside.google:endpoint_authorization`](src/_index.yaml) | `https://accounts.google.com/o/oauth2/v2/auth` |
| [`kickside.google:endpoint_token`](src/_index.yaml) | `https://oauth2.googleapis.com/token` |
| [`kickside.google:endpoint_userinfo`](src/_index.yaml) | `https://www.googleapis.com/oauth2/v2/userinfo` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/google)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
