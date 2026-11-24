<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for Mailgun

This driver delivers messages from KickSide Mail through Mailgun. Set a Mailgun API key, verified sending domain, and matching API region. Delivery uses multipart requests with regular and inline attachments.

## Requirements

Install KickSide Mail and Settings. `us_api_base_url` and `eu_api_base_url` default to the corresponding Mailgun API origins. The driver declares outbound HTTP access to the provider’s delivery endpoint.

## Settings

In **Settings → Integrations → Mail**, select **Mailgun** and set `api_key` as an encrypted secret, `domain` as the verified sending domain, and `region` as `us` or `eu` (default `us`). The **Administer Mailgun mail delivery** capability grants access to the driver’s registry declarations and availability check. Platform Settings controls authorization to edit settings.

The descriptor names `kickside-mailgun-settings` as its `settings_view`. The Mail delivery block in **Integrations → Mail** mounts this panel for the API key, sending domain and region when Mailgun is the active service. The panel follows the Mail block's driver panel contract: it receives the saved values, which secrets are set and server errors, and emits `change` and `validity`; the Mail block keeps the one draft and saves it. The panel checks the domain's form as the server does and asks for a key when a domain is set without one.

## Contract and tools

`kickside.mail.mailgun:transport` implements `kickside.mail:transport.send` and returns the provider’s message ID when supplied in the acceptance response. `kickside.mail.mailgun:available` reports whether the driver settings are configured. Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

## Error codes

```text
Code                            Kind                Retryable
credentials_invalid             PermissionDenied    No
invalid_attachment              Invalid             No
invalid_config                  Invalid             No
invalid_content_id              Invalid             No
message_rejected                Invalid             No
provider_endpoint_invalid       Invalid             No
provider_rejected               Internal            No
provider_request_failed         Source error        Source flag
provider_unavailable            Unavailable         Yes
rate_limited                    RateLimited         Yes
sender_or_recipient_not_allowed PermissionDenied    No
settings_read_failed            Internal            No
```

## Development

Use Wippy v0.3.66a and Make.

```sh
make verify
```

`make verify` refreshes the dependency graph, builds and tests the settings panel in `ui/`, and runs validation and the SQLite harness. For PostgreSQL, create a dedicated test database, then run the same target with
`WIPPY_ARGS="--profile postgres --set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run. Tests use local delivery fixtures.
