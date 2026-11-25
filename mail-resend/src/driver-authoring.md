<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Write a KickSide Mail driver

A driver translates one rendered Mail message into a provider request. It owns its provider configuration, request encoding, outbound HTTP policy, and provider response classification. Mail owns the public send and activity surfaces, templates, attachment reads, queue, and delivery retries.

## Build the package

Start with this complete Example Relay package. Copy it into a new module, replace the package and registry namespace throughout, and adapt the transport to the provider API. The sample's default host is a reserved domain. The harness passes a loopback URL and exercises the sample through Mail and Settings on both engines.

| File | Purpose |
|---|---|
| [wippy.yaml](../../test-support/mail-driver-example/wippy.yaml) | Plugin manifest and publication exclusions |
| [src/_index.yaml](../../test-support/mail-driver-example/src/_index.yaml) | Module definition, Mail and Settings dependencies, endpoint requirement, and transport binding |
| [src/security/_index.yaml](../../test-support/mail-driver-example/src/security/_index.yaml) | Discovery, member and admin access, Settings reads, and exact egress permission |
| [src/settings/_index.yaml](../../test-support/mail-driver-example/src/settings/_index.yaml) and [validate.lua](../../test-support/mail-driver-example/src/settings/validate.lua) | Settings definitions, validation, and the provider's Integrations block |
| [src/transport/_index.yaml](../../test-support/mail-driver-example/src/transport/_index.yaml) and [relay.lua](../../test-support/mail-driver-example/src/transport/relay.lua) | The function entries, declared imports, and complete Lua adapter |

## Implement the transport contract

Create one `contract.binding` for `kickside.mail:transport` in the module root. Map `send` and `status` to two function entries. Multiple drivers can be installed together. Mail discovers implementations and opens them under `kickside.mail.security:transports`. The driver contributes this exact policy in its own security namespace.

```yaml
- name: transport_open
  kind: security.policy
  meta: { private: true, comment: Admits this driver to the Mail transports group. }
  groups: [kickside.mail.security:transports]
  policy:
    resources: [kickside.mail.example:transport]
    actions: [contract.open]
    effect: allow
```

The contract declares JSON Schemas for `send` input and output and `status` output. Use `kickside.mail:types` for the corresponding Lua types. Implementations return `(value, err)` with a native error on failure.

### `send(input) -> (TransportResult?, error?)`

| Input field | Shape |
|---|---|
| `from` | Required object with `address` and optional `name` |
| `to` | Required nonempty array of addresses |
| `cc`, `bcc` | Optional arrays of addresses |
| `reply_to` | Optional address |
| `subject` | Required nonempty subject |
| `html`, `text` | Rendered strings. Include at least one. |
| `attachments` | Optional array. Each item has `filename`, `content_type`, `content` (original bytes in a Lua string), `disposition` (`attachment` or `inline`), and `content_id` (required for `inline`). Preserve the Content-ID used in the rendered HTML. Encode bytes only as the provider requires. |
| `idempotency_key` | Optional stable key for the provider's idempotent request API |
| `deadline` | Required absolute RFC3339 delivery deadline |

Return `{provider_message_id = id}` when the provider accepts the message and returns a usable ID. Return `{}` when acceptance succeeds without an ID. An acceptance response does not confirm inbox delivery. If the provider honors an idempotency key, pass Mail's key unchanged and advertise `idempotent: true`. Set it to `false` when repeating a request may send again. Let Mail own retries and use its deadline for every delivery call.

### `status() -> (TransportStatus?, error?)`

Return nonempty `title`, `icon`, `description`, and `settings_ns`, plus boolean `idempotent` and `ready`. The optional `max_recipients` and `max_message_bytes` are positive integers. Use the provider's total recipient allowance across To, Cc, and Bcc, and its deliverable message size in bytes. Omit a limit when the provider does not publish one. Mail uses these limits before delivery. Validate credentials and any required values locally. Status makes no provider request.

For missing or invalid configuration, return `ready: false`, `code: invalid_config`, and a nonempty setup `reason`. A `code` must match `^[a-z][a-z0-9_]*$`. Propagate errors reading Settings or the registry so Mail can distinguish operational failures from setup needs. Avoid returning credentials in status or errors.

## Configure Settings and HTTP access

Declare one Settings namespace owned by the driver and return it as `settings_ns`. Give each `kickside.settings:definition` a `key`, `title`, `description`, `scope`, `value_type`, default, and validator where appropriate. Store an API key as `value_type: secret` with `read_access: admin`; use `kickside.mail.driver:config.validate_api_key` in a `validate_func` wrapper. Declare a `kickside.settings:block` under Integrations with `component_tag: kickside-settings-provider` and the same namespace in the block and `config.namespace`. This uses the platform's settings editor and gives the driver its own labeled entry. An administrator may also configure the selected provider inside Mail's delivery settings.

Give `send` and `status` a private `settings_read` policy with `contract.get`, `contract.open`, and `contract.call` on the Settings contract, its binding, and `get_namespace`. Reading an admin-only secret also requires the separate private `settings_admin_read` policy with `access` on `kickside.settings.api:list_settings.endpoint` at the pinned Settings ABI. Apply those two grants only to the functions that read the driver's own namespace. Use `module_management` for the driver's administrative capability. Use a member-scope requirement for driver discovery, with `meta.value_kind: security.scope`.

Keep the destination and egress permission linked to a single scalar requirement. Wippy applies its value verbatim to both targets. For an exact URL, accept a complete HTTPS delivery URL including its path, and use exactly that URL for the request.

```yaml
- name: endpoints
  kind: registry.entry
  endpoints: {}
- name: api_base_url
  kind: ns.requirement
  meta:
    value_type: string
    comment: Sets the delivery URL and its outbound HTTP grant.
    description: Complete HTTPS URL for the relay delivery endpoint.
  default: https://delivery.example.invalid/messages
  targets:
    - { entry: kickside.mail.example:endpoints, path: ".endpoints.api" }
    - { entry: kickside.mail.example.security:http_access, path: ".policy.resources +=" }
```

The `provider_reads` policy grants `registry.get` on your `endpoints` entry. Start `http_access.policy.resources` as `[]`, restrict its action to `http_client.request`, and attach it only to `send`. Validate the linked endpoint in Lua. When a provider requires a runtime segment in the URL, use a narrowly scoped HTTPS prefix and validate the segment before assembling the exact path. Mailgun's two regional URL prefixes illustrate this case. Keep the permissions off Mail's own entries.

## Use the public driver libraries

The signatures below omit some Lua optional-return annotations for readability. Every helper returning an error uses Wippy's native error type.

### `kickside.mail.driver:config`

| Function | Result and use |
|---|---|
| `settings(namespace)` | `(values, err)`. Read a single driver-owned Settings namespace. |
| `validate_api_key({value = value})` | Settings validation result `{valid, error?}`. An empty string clears the key. |
| `api_key(values, service)` | `(key, err)`. Validate a value already read. |
| `read_api_key(namespace, service)` | `(key, err)`. Read and validate the key for a single-key driver. |
| `missing(reason, reason_code?)` | Creates a nonretryable `Invalid` setup error with `details.code = "invalid_config"`. |
| `status_error(err)` | `(readiness, err)`. Convert a setup error into readiness data and propagate other errors. Use `invalid_config` as the driver's public status code and keep the returned reason. |
| `mailbox(sender)`, `address(value)` | Format a sender mailbox for a header or validate a single address. |
| `endpoint(entry_id, region)` | `(origin, err)`. Resolve a bare origin from `entry.data.endpoints[region]`. The current helper does not read a full delivery URL or a regional path prefix. |

### `kickside.mail.driver:http`

| Function | Result and use |
|---|---|
| `post(url, body, headers, deadline, auth?)` | `(response, err)`. POST with the deadline, a 20-second timeout ceiling, and a bounded response. `auth` accepts `{user, pass}` for Basic authentication. |
| `bearer_json(key)` | Authorization and JSON Content-Type headers. |
| `encode_message(payload)`, `encode_attachment(bytes)` | `(encoded, err)`. Encode the JSON request and Base64 attachment content. |
| `message_id(response)` | `(result, nil)`. Get the nonempty `id` property in a JSON acceptance response. Read provider-specific success headers yourself when needed. |
| `retry_hint(response, reset_header, units)` | Milliseconds until retry, or `nil`. `Retry-After` takes precedence. Provider reset units are `seconds`, `epoch_seconds`, or `epoch_milliseconds`. |
| `response_detail(response, key, basic_user?)` | Bounded provider detail with credentials and control characters removed. Keep it for the administrator-facing diagnostic. |
| `failure(kind, code, message, retryable, status?, retry_after_ms?, provider_detail?)` | Construct a classified native error. `retry_after_ms` is carried on retryable failures. |
| `status_error(status, rejected_status, retry_after_ms?, provider_detail?)` | Common provider status classification. `authorization_refused(status, detail?)` creates the specific ambiguous authorization failure. |

## Classify errors

Treat a clear credential failure as nonretryable `PermissionDenied` with `credentials_invalid`; use `authorization_refused` when a provider's response could reflect an account, plan, or authorization refusal. Use `Invalid` with `message_rejected` for a confirmed message refusal. Preserve valid `Retry-After` hints on retryable rate limits and temporary provider outages. Use `idempotency_conflict` for a key reused with different content and retryable `send_in_progress` for a provider that explicitly reports an in-flight request with that key. An exhausted quota can be a permanent `quota_exhausted` even when the provider uses HTTP 429. The shared HTTP helper handles transport errors and deadlines.

Mail shows these public aliases to ordinary senders. Administrators with activity-log access can see the original classified code and redacted provider detail.

| Driver code | Public Mail code |
|---|---|
| `credentials_invalid`, `authorization_refused`, `sender_or_recipient_not_allowed`, `request_rejected`, `idempotency_conflict` | `provider_rejected` |
| `send_in_progress`, `delivery_deadline_exceeded` | `provider_unavailable` |
| `quota_exhausted` | `rate_limited` |
| `settings_read_failed`, `invalid_transport_status`, `provider_endpoint_invalid` | `invalid_config` |

Mail can also show shared codes directly, including `invalid_config`, `message_rejected`, `provider_rejected`, `provider_transport_failed`, `provider_request_failed`, `provider_unavailable`, `rate_limited`, and attachment diagnostics. Use a stable code and a native error kind for machine decisions. Keep diagnostic text free of API keys, authorization headers, and provider response bodies outside the bounded redacted detail.

## Verify the driver

Use the standalone driver harness pattern. Bind `api_base_url` to the harness's HTTPS listener. Give the fixture a certificate trusted by the test runtime, with no public provider requests. Verify public contract discovery and open under the transports group, readiness with and without configuration, exact URL permission and refusal outside it, the wire encoding for ordinary and inline attachments, deadline refusal, and each provider's acceptance and error responses. Exercise real sender and administrator roles. Run `make verify` and `make test-pg` with Wippy v0.3.70a and a fresh PostgreSQL database. The worked example is selected and sent through Mail by the [authoring example test](../test/src/driver_example_test.lua).

The Mail-side reference should publish the contract and schema locations, the transports-group admission and dispatch model, which roles may discover transports and change the active driver, how Mail computes transport limits and provider idempotency keys, and how sender-facing codes, privileged diagnostics, and retry decisions are derived. Mail's delivery settings documentation should also explain that the selected driver's `settings_ns` feeds the shared editor.
