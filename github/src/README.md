# KickSide GitHub

GitHub as a KickSide repository provider.

This module is OAuth-primary. It declares one `component` registry entry with
`meta.oauth_provider: github`, which `kickside/oauth` discovers and drives
through the shared `kickside.oauth:base_connector`. The module owns only GitHub's
endpoints, scopes, repository API client, traits, and source declarations; it
does not implement OAuth flow mechanics.

The stored personal access token connection binding is intentionally secondary.
It exists for development, self-hosted deployments, and environments where an
OAuth app is not available. The transport resolves both modes to one `Conn`
shape, so sources and tools do not branch on auth.

## What It Declares

| Entry | Kind | Purpose |
|---|---|---|
| `kickside.github:github` | `registry.entry` (`meta.oauth_provider: github`) | OAuth provider declaration: authorization/token/userinfo endpoints, component contract, and GitHub scopes. |
| `client_id` / `client_secret` | `env.variable` | OAuth app credentials from `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. |
| `setting_client_id` / `setting_client_secret` | `registry.entry` (`kickside.settings:definition`) | Encrypted admin-editable OAuth credentials; preferred over env vars when set. |
| `kickside.github.ui:connect_view` | `registry.entry` (`view.component`) | Connections-page setup UI with OAuth and PAT tabs. |
| `kickside.github.connection:github_connection` | `contract.binding` | Stored PAT fallback connection. |
| `kickside.github.source:repo_items` | `registry.entry` (`kickside.automation.port`) | Pullable repository issues / pull requests source. |
| `kickside.github.traits:reader` / `writer` / `manager` | `registry.entry` (`agent.trait`) | Agent capabilities over the selected GitHub connection. |

## Configuration

Preferred: set credentials in KickSide Settings under namespace
`kickside.github`:

- `client_id`
- `client_secret`

Fallback: set host environment variables:

```sh
GITHUB_CLIENT_ID=<github oauth app client id>
GITHUB_CLIENT_SECRET=<github oauth app client secret>
```

The OAuth callback is built from the runtime `PUBLIC_API_URL` environment
variable as `${PUBLIC_API_URL}/api/public/oauth/callback`. Register that exact
externally reachable callback URL on the GitHub OAuth App.

## GitHub OAuth App Setup

Create a GitHub **OAuth App** (not a GitHub App) for this provider. GitHub
recommends considering GitHub Apps because they have finer-grained permissions,
repository-level installation control, and short-lived tokens. That is a future
provider mode; this module is wired to `kickside.oauth:base_connector`, which
expects the OAuth App authorize/token flow.

Official GitHub references:

- Creating an OAuth App: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- OAuth App scopes: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps

In GitHub:

1. Open GitHub as an account or organization admin.
2. Go to **Settings** -> **Developer settings** -> **OAuth Apps**.
3. Click **New OAuth App** or **Register a new application**.
4. Fill the app settings:

| GitHub field | Value |
|---|---|
| Application name | `KickSide` or `KickSide <environment>` such as `KickSide Staging` |
| Homepage URL | `https://<kickside-host>/` matching the user-facing KickSide app origin |
| Application description | `Connects KickSide agents and automations to GitHub repositories.` |
| Authorization callback URL | `${PUBLIC_API_URL}/api/public/oauth/callback`, for example `https://kickside.example.com/api/public/oauth/callback` |
| Enable Device Flow | Leave disabled |

Use the externally reachable KickSide origin for `PUBLIC_API_URL`; the OAuth API
trims one trailing slash before appending `/api/public/oauth/callback`. For
local development behind a tunnel, use that tunnel URL, for example
`https://<name>.ngrok-free.app`. GitHub OAuth Apps allow one callback URL, so
create separate OAuth Apps for dev/staging/prod if the hosts differ.

After registering:

1. Open the registered OAuth App settings page. The **Client ID** is shown on
   the page; copy it into the `kickside.github` `client_id` setting, or set
   `GITHUB_CLIENT_ID`.
2. Click **Generate a new client secret**.
3. Copy the secret once and store it in the `kickside.github` `client_secret`
   setting, or set `GITHUB_CLIENT_SECRET`.
4. Restart or reload the app if your deployment only reads env variables at
   process start.

Do not use the SSO GitHub OAuth app for this provider. `sso-github` is for
sign-in identity. This provider needs repository scopes and produces GitHub
connection components for agents, sources, and tools.

The Connections page mounts `kickside-github-connect` for this provider. Its
default tab starts the OAuth App flow. The personal access token tab is a
fallback path and is the only mode that requires a token field.

## Scopes

Default scopes are identity-only:

- `read:user`
- `user:email`

Repository access is opt-in through `available_scopes`. GitHub scopes limit the
OAuth token but never grant permissions the authorizing user does not already
have.

| Scope | Select when |
|---|---|
| `public_repo` | The reader, writer, manager, or repo source only needs public repositories. |
| `repo` | Any selected repository is private, or one connection should cover public and private repositories. This is broad GitHub repository access. |
| `read:org` | Organization membership or team visibility affects repository access or discovery. |

Existing connections created with only default identity scopes remain valid but
will receive GitHub `403` responses for repository actions until reauthorized
with repository scopes. GitHub lets users grant fewer scopes than requested and
edit scopes later, so reduced-scope connections must be handled as runtime
authorization failures; send the user through reauthorization when a workflow
needs additional permission.

Fine-grained personal access tokens are acceptable only for the fallback
`github_connection` binding. Choose repository read/write permissions matching
the same capabilities: read access for `reader` and the source, issues write for
`writer`/`manager`, and contents read for `get_file`.

## Agent Traits

Traits are public `agent.trait` registry entries. The agent editor and
Capability Manager discover them from metadata; their `prompt` text is injected
when the trait is active, and their `tools` list grants the callable tools.

GitHub traits use the generic `kickside-connection-trait-picker` with
`connection_provider: github`. The picked connection id is stored in the trait
context as `connection_id`, matching each trait's `context_schema`;
model-facing tool schemas do not expose raw component ids. Leaving the picker on
auto-select lets the transport use the actor's single accessible GitHub
connection. Pin the connection when an agent must always use a specific GitHub
account or organization membership.

Available capabilities:

| Trait | Grants | Use when |
|---|---|---|
| `kickside.github.traits:reader` | `GitHubRead` | The agent should inspect repositories, issues, pull requests, comments, or files. |
| `kickside.github.traits:writer` | `GitHubWrite` | The agent should create/update issues or add comments, usually paired with Reader. |
| `kickside.github.traits:manager` | `GitHubRead` + `GitHubWrite` | The agent owns a repo workflow and needs both lookup and issue mutation in one capability. |

`GitHubRead` actions:

- `viewer`
- `get_repo`
- `list_issues`
- `get_issue`
- `list_issue_comments`
- `get_pull`
- `list_pull_files`
- `get_file`

`GitHubWrite` actions:

- `create_issue`
- `update_issue`
- `create_issue_comment`

The writer deliberately avoids file mutation in this provider version. GitHub
contents writes require SHA/ref semantics and stronger confirmation boundaries;
issue operations are the first supported write surface.

## Connection Discovery

`discover_resources` lists the repositories the connection's user can access
(`GET /user/repos` with owner, collaborator, and organization-member
affiliation, sorted by full name), one page per call:

| Argument | Meaning |
|---|---|
| `cursor` | Page returned as `next_cursor` by the previous call; omitted for the first page. |
| `limit` | Page size, clamped to 1..100 (default 100). |
| `type` | `github_repo` or omitted; any other type returns no rows. |
| `parent_id` | Repositories form a flat list; any parent returns no rows. |
| `q` | Not supported by this endpoint; the call fails instead of ignoring it. |

Each row is `{ type = "github_repo", id/key/name = "owner/repo", description,
url, selectable = true, metadata = { owner, visibility, default_branch,
archived, updated_at } }`. `next_cursor` is present when GitHub's `Link`
header names a next page.

## Source

`kickside.github.source:repo_items` pulls `/repos/{owner}/{repo}/issues` with
`state=all`, sorts by update time, and classifies rows with `pull_request` as
pull requests. It emits pullable upserts with stable keys:

```text
github:<owner>/<repo>:<issue|pull_request>:<number>
```

`item_type` can be `all`, `issues`, or `pull_requests`. `backfill_since` is
passed to GitHub's `since` query parameter and preserved in cursors.

## Tests

The harness in `test/` loads the module through a workspace replacement, so
the module's `exclude_meta` keeps `meta.type: test` entries out of its own
tree. The suites therefore live in the harness child namespace `app.suites`
(`test/suites/`) and cover, offline:

- OAuth provider and encrypted settings declarations.
- PAT fallback connection declaration.
- Trait picker/tool schema wiring.
- REST path/query/header/auth helpers and `Link` paging.
- Repository discovery rows, cursors, limits, type filter, and failures.
- Source item shaping/filtering/error handling.
- Tool argument validation and dispatch with fake transports.
- Output redaction and truncation.
