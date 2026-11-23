<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for SendGrid

This driver delivers messages from KickSide Mail through SendGrid. Set an API key with Mail Send permission and configure a verified sender in KickSide Mail. Delivery succeeds when SendGrid accepts the request and returns a message ID header.

## Requirements

Install KickSide Mail and Settings. `api_base_url` defaults to the SendGrid API origin. The driver declares outbound HTTP access to the provider’s delivery endpoint.

## Settings

Use **Integrations → SendGrid** to set `api_key`, an encrypted secret. Set `kickside.mail.driver` to `sendgrid` to select this driver. The **Administer SendGrid mail delivery** capability grants access to the driver’s registry declarations and availability check. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.sendgrid:transport` implements `kickside.mail:transport.send` and returns the provider’s message ID on acceptance. `kickside.mail.sendgrid:available` reports whether the driver settings are configured. Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

## Error codes

```text
Code                            Kind                Retryable
attachment_encoding_failed      Source error        Source flag
credentials_invalid             PermissionDenied    No
invalid_config                  Invalid             No
message_encoding_failed         Source error        Source flag
message_rejected                Invalid             No
provider_endpoint_invalid       Invalid             No
provider_rejected               Internal            No
provider_request_failed         Source error        Source flag
provider_response_invalid       Internal            No
provider_unavailable            Unavailable         Yes
rate_limited                    RateLimited         Yes
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
