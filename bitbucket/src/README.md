# KickSide Bitbucket

Bitbucket Cloud as a KickSide connection provider. The module declares one
stored-credential connection binding and the Bitbucket Cloud REST 2.0 client
behind it (`https://api.bitbucket.org/2.0`).

Bitbucket Data Center / Server is out of scope: it has a different REST API
(`/rest/api/1.0`), different token types, and a per-deployment base URL. This
module talks to Bitbucket Cloud only.

## What It Declares

| Entry | Kind | Purpose |
|---|---|---|
| `kickside.bitbucket.connection:bitbucket_connection` | `contract.binding` | Credential connection (`meta.provider: bitbucket`) implementing `kickside.connection:connection`, `kickside.contract:component`, and `kickside.contract:deletable`. |
| `kickside.bitbucket.connection:connection_lib` | `library.lua` | `test_connection`, `discover_resources`, `get_status`, `delete`. |
| `kickside.bitbucket.client:api` | `library.lua` | REST client: URL building, headers, error mapping, pagination. |
| `kickside.bitbucket.client:transport` | `library.lua` | Resolves a connection component's stored credentials into an authenticated handle. |

The generic Connections UI renders the binding's `credential_schema`; the
module ships no UI bundle.

## Credentials

`auth_type` selects one of two modes.

### `api_token` — Atlassian API token

An Atlassian account API token, sent as HTTP Basic with the Atlassian account
email and the token (`Authorization: Basic base64(email:api_token)`).

- Create it at id.atlassian.com -> Security -> **Create API token with scopes**,
  choose Bitbucket, and grant `read:user:bitbucket`,
  `read:workspace:bitbucket`, and `read:repository:bitbucket`.
- Fields: `email`, `api_token`, optional `workspace`. Without a workspace,
  discovery lists every workspace the account can access; with one, discovery
  lists that workspace's repositories only.

### `access_token` — workspace, project, or repository access token

A Bitbucket access token, sent as `Authorization: Bearer <token>`. Access tokens
belong to a bot user bound to one workspace (workspace tokens are a Premium
feature; project and repository tokens are narrower).

- Create it under the workspace, project, or repository settings -> **Access
  tokens** with at least **Repositories: Read**.
- Fields: `access_token`, `workspace` (the slug the token belongs to).

### App passwords are not supported

Atlassian deprecated Bitbucket Cloud app passwords in favour of API tokens:
creating new app passwords stopped on 9 September 2025, and the Bitbucket Cloud
changelog (29 May 2026 brownout notice) sets full deprecation for
28 July 2026, after which app passwords stop working. This module has no
app-password mode.

## Connection Test

`test_connection` calls an endpoint the credential kind is allowed to reach:

- `api_token`: `GET /user`, then, when a workspace is configured,
  `GET /repositories/{workspace}?pagelen=1` so a mistyped workspace fails at
  connect time.
- `access_token`: `GET /repositories/{workspace}?pagelen=1`. Access tokens
  are not user credentials and cannot call `GET /user`.

## Discovery

`discover_resources` follows the shared connection picker convention.

| Connection | Call | Rows |
|---|---|---|
| `api_token`, no workspace | root | `bitbucket_workspace` containers from `GET /user/workspaces` (`selectable = false`, `drillable = true`, `id` = slug) |
| `api_token`, no workspace | `parent_id = <slug>` | that workspace's repositories |
| `api_token` with workspace, or `access_token` | any | the configured workspace's repositories from `GET /repositories/{workspace}` |

Repository rows carry `type = "bitbucket_repository"`, `id`/`key`/`name` =
`full_name` (`workspace/repo_slug`), `url` = `links.html.href`, and metadata
`owner` (workspace slug), `uuid`, `visibility` (from `is_private`),
`default_branch` (from `mainbranch.name`), and `updated_at` (from
`updated_on`). Bitbucket reports no archived flag, so the row has none.

- Pagination: Bitbucket pages are numbered; `next_cursor` is the page number
  from the response's `next` link and is returned only when `next` is present.
- Order is stable across pages: workspaces sort by `slug`, repositories by
  `full_name`.
- `limit` maps to `pagelen`, clamped to 1..100 (default 100). Bitbucket
  rejects `pagelen` above 100 with `400 Invalid pagelen`.
- `q` filters server-side with the Bitbucket query language: `name ~ "<q>"` for
  repositories and `slug ~ "<q>"` for workspaces, with `\` and `"` escaped.
- `type` other than the type the call would return yields an empty list.
- A `parent_id` other than the configured workspace is rejected.

## Endpoints and Deprecations

Atlassian removed the cross-workspace APIs (CHANGE-2770, sunset
31 March 2026 after brownouts from 23 March 2026). `GET /2.0/repositories`
(user-wide) and `GET /2.0/workspaces` now answer 404, and
`GET /2.0/user/permissions/workspaces` is gone from the published OpenAPI
spec. The endpoints this module uses are current in that spec:

- `GET /2.0/user/workspaces` (CHANGE-3022) — workspaces accessible to the caller.
- `GET /2.0/repositories/{workspace}` — repositories of one workspace.
- `GET /2.0/user` — the authenticated account.

References:

- REST API reference: https://developer.atlassian.com/cloud/bitbucket/rest/
- OpenAPI spec: https://dac-static.atlassian.com/cloud/bitbucket/swagger.v3.json
- Changelog: https://developer.atlassian.com/cloud/bitbucket/changelog/
- API tokens: https://support.atlassian.com/bitbucket-cloud/docs/using-api-tokens/
- Access tokens: https://support.atlassian.com/bitbucket-cloud/docs/using-workspace-access-tokens/
- App password deprecation: https://www.atlassian.com/blog/bitbucket/bitbucket-cloud-transitions-to-api-tokens-enhancing-security-with-app-password-deprecation

## Development

```sh
make lint   # wippy lint over kickside.bitbucket.* from the test harness
make test   # packaging and offline unit suites (no Bitbucket account needed)
```

Suites live in `test/suites/` (namespace `app.suites`) because the harness
loads the module through a workspace replacement, which drops `meta.type: test`
entries from the module tree.
