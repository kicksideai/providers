# kickside/webscout-brave

Brave search for `kickside/webscout`. WebScout itself knows nothing about Brave: this module declares a search
provider descriptor, owns the Brave API key in its own settings namespace, and carries the Brave Research Source.

Install it and Brave becomes selectable in the WebScout settings card. Remove it and WebScout falls back to its
default provider — nothing in WebScout changes either way.

## What it declares

| Entry | What it is |
|---|---|
| `provider` | The `kickside.webscout:search_provider` descriptor — `id: brave`, a 20-result ceiling, and the ids of the two functions below |
| `search` | One Brave web query, normalized into WebScout's shared result shape |
| `available` | Whether the key is set; answers both the descriptor's `available_func` and the Source's `availability_ref` |
| `setting_api_key` | Brave Search API subscription token, in `kickside.webscout.providers.brave` |
| `settings_block` | The Settings page section this key appears in — "Brave Search", under Integrations |
| `source` + `block.source` + `run` + `source_core` | The typed Research Source for independent web and news discovery |

Brave is **not** marked default: installing this module makes it selectable, it does not change the selection.
Choose it by setting `kickside.webscout / search_provider` to `brave`.

## Configuration

One setting, `kickside.webscout.providers.brave / api_key`. It is read through the WebScout config reader with
this module's namespace, the one the descriptor names in `settings_ns`, so the key leaves with the module.

Without `settings_block` the Settings page would invent a section for the namespace and call it "Webscout
Providers Brave", ungrouped and sorted below every named section — so the key would be there, but not where
somebody who just installed the module would look for it.

## Development

From this module directory, `make test` runs its harness and `make lint` checks its registry namespace.
The harness mounts this module and resolves its dependencies. Its provider descriptor test verifies the
shared WebScout protocol and the module's credential namespace. Transport fixtures cover result normalization,
provider errors, and bounded Research Source operations without live Brave calls.

The suites live in `test/suites/`; module packaging excludes test entries. PostgreSQL validation uses the
harness's `postgres` profile with a dedicated scratch database that is removed after the run.
