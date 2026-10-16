# kickside/google

Google as a KickSide OAuth connection provider: Gmail, Drive, Calendar, Docs,
Sheets, Slides, Contacts and Analytics.

This module is **purely declarative**. It carries no OAuth logic of its own: it
declares one provider entry that `kickside/oauth` discovers (registry scan on
`meta.oauth_provider`) and drives through the shared `kickside.oauth:base_connector`.
Adding a provider is a module like this one, not an edit to oauth.

## What it declares (`kickside.google` namespace)

| Entry | Kind | Purpose |
|---|---|---|
| `google` | `registry.entry` (`meta.oauth_provider: google`) | The provider: Google's authorize/token/userinfo endpoints, scopes, and the connector/component contracts to use. |
| `client_id` / `client_secret` | `env.variable` | OAuth client credentials, read from `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. |
| `setting_client_id` / `setting_client_secret` | `registry.entry` (`kickside.settings:definition`) | Encrypted admin-editable OAuth client credentials. These override env variables when set. |
| `env_storage` | `ns.requirement` | Host-supplied env store that resolves the credentials. |

## Configuration

Preferred: set credentials in KickSide Settings. They are stored as encrypted
secret settings under the `kickside.google` namespace:

- `client_id`
- `client_secret`

Fallback: set the host environment variables:

```
GOOGLE_CLIENT_ID=<google oauth client id>
GOOGLE_CLIENT_SECRET=<google oauth client secret>
```

The OAuth callback (`<host>/api/public/oauth/callback`) must be an authorized
redirect URI on the Google client (Google Cloud Console).

## Scopes

The default Google connection requests only sign-in/profile/email scopes:

- `openid`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`

Service access is opt-in through `available_scopes`. Gmail, Drive, Calendar,
Docs, Sheets, Slides, Contacts and Analytics scopes are advertised by the
provider so the shared connection picker can request only what an automation
needs.

Existing Google connections that were created with only the default sign-in
scopes remain authenticated, but they cannot use service APIs until the user
reauthorizes the connection and grants the required service scopes.

## Agent Traits

The module ships agent traits for Gmail, Drive, Calendar, Docs, Sheets, Slides,
Contacts and Analytics. Each trait uses the `kickside-google-picker`
configuration component in the agent editor:

- Select a specific Google connection to pin the trait to that account.
- Leave the picker on auto-select to use the actor's default accessible Google
  connection.

Tools read the selected `connection_id` from trait context. The model-facing tool
schemas do not expose raw connection component IDs.

## Customizing

- **Scopes** — edit `available_scopes` / `default_scopes` on the `google` entry.
- **Credentials storage** — prefer encrypted settings; override the
  `env_storage` requirement when depending on this module only if a different env
  router is required.
- **Connector** — all flow mechanics live in `kickside/oauth`; this module only
  supplies Google's endpoints + `context_values`.

## Dependencies

`kickside/oauth` (the connector + component contracts and the discovery it plugs
into).

Google authorization requests offline access and explicit consent. The transport
reads tokens through the shared OAuth connection for each API request. On an
API 401 it passes the rejected token to that same connection and retries the
request once with the returned token. A second 401 or a failed refresh returns
an error; a 403 does not trigger refresh.
