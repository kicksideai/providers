<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for Mailgun

This driver delivers messages from KickSide Mail through Mailgun. Set a Mailgun API key, verified sending domain, and matching API region. Delivery uses multipart requests with regular and inline attachments.

## Requirements

Install KickSide Mail and Settings. `us_api_base_url` and `eu_api_base_url` default to the corresponding Mailgun API origins. The driver declares outbound HTTP access to the provider’s delivery endpoint.

## Settings

Use **Integrations → Mailgun** to set `api_key` as an encrypted secret, `domain` as the verified sending domain, and `region` as `us` or `eu` (default `us`). Set `kickside.mail.driver` to `mailgun` to select this driver. The **Administer Mailgun mail delivery** capability grants access to the driver’s registry declarations and availability check. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.mailgun:transport` implements `kickside.mail:transport.send` and returns the provider’s message ID on acceptance. `kickside.mail.mailgun:available` reports whether the driver settings are configured. Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

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
provider_response_invalid       Internal            No
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

`make verify` refreshes the dependency graph and runs validation and the SQLite harness. For PostgreSQL, create a dedicated test database, then run the same target with
`WIPPY_ARGS="--profile postgres --set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run. Tests use local delivery fixtures.
