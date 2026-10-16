# KickSide Webscout

Web research tools and typed Research Sources over declared search providers,
plus page reading and bounded link extraction. Provider secrets are
admin-editable settings and never appear in Source artifacts.

## Trait

Add the `web_researcher` trait to any agent to grant search + read + link tools:

```yaml
traits:
  - id: kickside.webscout.traits:web_researcher
```

## Configuration

Credentials resolve from the admin-editable `kickside.settings:settings`
contract. A provider that ships as its own module keeps its own credentials in
the namespace its descriptor names in `settings_ns`; only the settings below
belong to this module.

| Setting / env key | Purpose |
|---|---|
| `search_provider` | Identifier of the installed search provider the trait tools call (default `google`); hidden from the generic form because the WebScout settings card draws it as a list |
| `user_agent` | User-Agent sent on outgoing requests; empty means the built-in browser-like value |
| `google_search_api_key` | Google Custom Search API key (secret) |
| `google_search_engine_id` | Google Custom Search Engine ID (`cx`) |
| `SourceOperationPolicy/v1` | Owner-selected operation values (required per call) |
| `SourceOperationControlBounds/v1` | Host-installed bounds and digest (required per call) |

## Search providers

The `search` trait tool is a dispatcher. It reads `search_provider`, resolves
the matching descriptor, and calls that provider's `search_func`; it knows no
provider by name and builds every provider-related message from the installed
descriptors. A descriptor is a `registry.entry` with
`meta.type: kickside.webscout:search_provider` declaring `id`, `label`,
`search_func`, `available_func`, and optionally `icon`, `description`,
`settings_ns`, `max_results`, `default` and `order`. A provider is called with
`{query, num, offset}` — `num` at most its `max_results`, `offset` the zero-based
position of the first result — and must return the same result shape
(`{query, results[{title, link, snippet, displayLink}], count, has_more}`);
normalizing to it is the provider's job. The tool pages the provider until the
requested `num` is reached or `has_more` is false, and returns `next_cursor`
to continue from there.

A `search_provider` value that no installed descriptor claims is refused before
it is stored. `GET /api/v1/webscout/providers` returns the installed providers,
whether each one is configured, and which is in effect; the WebScout settings
card (`kickside-webscout-settings`) renders that as a picker and mounts the
stock `kickside-settings-provider` card underneath for the rest of the
namespace. If a selected provider is uninstalled after the fact, the tool
falls back to the descriptor marked `default`; a provider that is installed but
has no credentials is reported as a configuration error rather than swapped out.

## Transport limits

The trait tools take only what the asking model can meaningfully choose: a URL
or a query, and optionally how much content to bring back. Timeouts, the
response byte ceiling and the User-Agent belong to the deployment — the client
applies them, and the model is not asked to guess. A caller that genuinely owns
these values, namely the Research Source under its operation policy, still
passes them and is still honoured.

A page longer than the requested character budget comes back trimmed, with a
`... [content truncated]` marker. It is never dropped for being long: half a
page is worth more than none, and a byte ceiling guessed too low used to lose
ordinary pages whole.

The Google-backed Public Web Source also owns page capture and site traversal.
