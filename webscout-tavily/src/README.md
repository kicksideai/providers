# kickside/webscout-tavily

Tavily search for `kickside/webscout`. WebScout itself knows nothing about Tavily: this module declares a search
provider descriptor and owns the Tavily API key in its own settings namespace.

Install it and Tavily becomes selectable in the WebScout settings card. Remove it and WebScout falls back to its
default provider — nothing in WebScout changes either way.

## What it declares

| Entry | What it is |
|---|---|
| `provider` | The `kickside.webscout:search_provider` descriptor — `id: tavily`, a 20-result ceiling, and the ids of the two functions below |
| `search` | One Tavily web query (`search_depth: basic`, one credit), normalized into WebScout's shared result shape |
| `available` | Whether the key is set; answers the descriptor's `available_func` |
| `setting_api_key` | Tavily API key, in `kickside.webscout.providers.tavily` |
| `settings_block` | The Settings page section this key appears in — "Tavily", under Integrations |

Tavily is **not** marked default: installing this module makes it selectable, it does not change the selection.
Choose it by setting `kickside.webscout / search_provider` to `tavily`.

## Configuration

One setting, `kickside.webscout.providers.tavily / api_key`. It is read through the WebScout config reader with
this module's namespace, the one the descriptor names in `settings_ns`, so the key leaves with the module.

When the plan's credits run out, Tavily answers 432 and the search reports "Tavily monthly credit limit reached
(432)". Tavily's terms allow it to train on queries and results: do not send personal names or other personal
data through this provider without legal approval.

## Development

From this module directory, `make test` runs its harness and `make lint` checks its registry namespace.
The harness mounts this module and resolves its dependencies. Its provider descriptor test verifies the
shared WebScout protocol and the module's credential namespace. Transport fixtures cover result normalization
and provider errors without live Tavily calls.

The suites live in `test/suites/`; module packaging excludes test entries. PostgreSQL validation uses the
harness's `postgres` profile with a dedicated scratch database that is removed after the run.
