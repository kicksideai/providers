# KickSide GitLab

GitLab as a KickSide connection provider for gitlab.com and self-managed
GitLab instances.

## What It Declares

| Entry | Kind | Purpose |
|---|---|---|
| `kickside.gitlab.connection:gitlab_connection` | `contract.binding` | Access-token connection (`meta.provider: gitlab`) implementing `kickside.connection:connection`, `kickside.contract:component`, and `kickside.contract:deletable`. |
| `kickside.gitlab.client:api` | `library.lua` | GitLab REST API v4 client: base URL normalization, auth headers, error mapping, pagination. |
| `kickside.gitlab.client:transport` | `library.lua` | Resolves a connection component into a `Conn`. |

## Credentials

The generic Connections page renders the binding's `credential_schema`:

- `base_url` (optional): the GitLab instance URL. Blank means
  `https://gitlab.com`. Only absolute `http`/`https` URLs are accepted; the
  scheme and host are lowercased, trailing slashes and a pasted `/api/v4` are
  removed, and a sub-path such as `https://example.com/gitlab` is kept. The API
  base is `<base_url>/api/v4`.
- `token` (required): a personal, group, or project access token, sent as the
  `PRIVATE-TOKEN` header. `read_api` is enough for the current read-only
  surface; `api` also grants write access for later write actions.

## Connection Methods

- `test_connection`: `GET /user`.
- `discover_resources`: `GET /projects?membership=true&simple=true&order_by=path&sort=asc`
  with `page`/`per_page` from `cursor`/`limit` (1..100, default 100) and
  `search` from `q`. Rows have type `gitlab_project`, `id` = numeric project
  id as a string, `key`/`name` = `path_with_namespace`, `url` = `web_url`, and
  `metadata` with `owner` (namespace `full_path`), `visibility`,
  `default_branch`, and `updated_at` (`last_activity_at`). The simple
  representation carries no `archived` flag, so rows omit it. `next_cursor`
  comes from the `X-Next-Page` header, falling back to the `Link` header.
- `get_status` / `delete`: `kickside.connection:base_connection` helpers.

## Tests

`make test` boots the offline harness in `test/` and runs the packaging and
unit suites in `test/suites/`.
