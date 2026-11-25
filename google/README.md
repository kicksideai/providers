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

Wippy 0.3.x; repository validation uses the latest stable Wippy release. Use current Hub dependencies
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
| [`GoogleSheetsImport`](src/traits/_index.yaml) | `spreadsheet`, optional `range` or `sheet`, `dataset {code, title}`, `mode` |
| [`GoogleSlidesRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleSlidesWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleDocsRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleDocsWrite`](src/traits/_index.yaml) | See the operation schema |
| [`GoogleContactsRead`](src/traits/_index.yaml) | `fields`, `max_results`, `page_token` |
| [`GoogleAnalyticsRead`](src/traits/_index.yaml) | `fields`, `limit`, `max_results`, `page_token`, `offset` |

### Import a Sheets dataset

Attach the `kickside.google.traits:sheets_importer` trait to the agent. Pair it
with Google Sheets Reader or Google Drive Reader to find the spreadsheet. The
Google connection needs `https://www.googleapis.com/auth/spreadsheets.readonly`
and `https://www.googleapis.com/auth/drive.metadata.readonly`. If the account is
not connected or a Google tool reports missing access, call `ConnectAccount`
with provider `google` and both scopes before making or retrying Google calls.
Wait for consent before continuing. Find a spreadsheet by name with
`GoogleDriveRead` action `list_files` and a `name = 'Sheet name'` query, optionally
filtered to `mimeType = 'application/vnd.google-apps.spreadsheet'`. The
[Drive files.list API](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list)
accepts the metadata scope for this lookup. The import uses the connection
selected by the trait, or the caller's default accessible Google connection.

Bind `kickside.google:import_administrator_binding` to a
`kickside.data:definable` implementation and
`kickside.google:import_receiver_binding` to its `kickside.data:loadable`
implementation. For Storage, the bindings are
`spiralscout.storage.definable:administrator` and
`spiralscout.storage.loadable:receiver`. The host owns installation and access
grants. Google declares a Data Explorer source that maps these requirements to
the contracts, without depending on Data Explorer or Storage modules.

Call `GoogleSheetsImport` with, for example:

```json
{
  "spreadsheet": "https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit",
  "sheet": "Kickside demo sales",
  "dataset": {"code": "demo_sales", "title": "Demo sales"},
  "mode": "replace"
}
```

The first row supplies field labels. Field names use lowercase Latin letters,
digits and underscores. Empty headers and duplicate normalized names fail.
Numbers, booleans and ISO dates retain their types. Mixed columns become text,
and blank cells are nullable. A missing range and sheet selects the first visible
sheet. One values request reads unformatted values and date serials. One
[formats request](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get)
reads only each cell's number format type over the same resolved range.
DATE cells become ISO dates, and DATE_TIME cells become ISO datetimes before
column inference. Other cells keep their values. Mixed date and number columns
become text with ISO dates. Dates use the original serial's whole day, and
datetimes round fractional seconds and clamp the time to 23:59:59. If the store
has no writable datetime type, datetime columns use dates.

The tool reads the store's type vocabulary and existing fields before defining
new fields. Compatible existing types stay unchanged, including float fields
receiving integers and text fields receiving other values as strings. A type
conflict returns an error naming the field before schema changes or staging.
Columns with no nonblank values keep their existing type. An unchanged schema
omits `columns` from the define request. Existing text fields increase their
supported `max_length` before staging when a later import needs more space.
The field type stays unchanged; an unsupported increase fails before staging.
New string fields use the longest value to set the supported length option,
or use long text when the value exceeds the short string limit.

The tool loads batches under one load and commits once. Replace requests
replacement of all dataset rows. A replacement with no data rows fails before
schema changes or staging, so existing rows stay. Append adds rows, so a
repeated call can add duplicates. A refused commit or a `noop` result returns
a failure. A schema change can remain if a later load fails. The result
contains `dataset {code, title, target}`, `rows`, `fields` and at most five
`preview` rows. The full row set stays inside the import.

On Windows, run `make.bat test` from this module. Set `WIPPY_BIN` to the selected
Wippy executable and `WIPPY_TEST_PORT` to an isolated test port. The adapter
mirrors the Makefile's install and test steps. `make.bat lint` checks this
module's namespaces.

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
