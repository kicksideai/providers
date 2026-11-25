<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for SendGrid

This driver delivers messages from KickSide Mail through SendGrid. Set an API key with Mail Send permission and configure a verified sender in KickSide Mail. Delivery succeeds when SendGrid accepts the request with HTTP 202.

## Install

Install `kickside/mail-sendgrid` alongside KickSide Mail and Settings. `api_base_url` defaults to `https://api.sendgrid.com/v3/mail/send`. The send function has outbound HTTP access to SendGrid’s `/v3/mail/send` endpoint. To override it, pass the complete delivery URL, including the path. The same value sets the destination and its outbound HTTP grant.

## Settings

In **Settings → Integrations → Mail**, select **SendGrid** and set `api_key`, an encrypted secret. The **Administer SendGrid mail delivery** capability grants access to the driver’s registry declarations for its settings. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.sendgrid:transport` implements the Mail `send` and `status` methods. `send` uses Mail’s delivery deadline and reads the provider’s message ID from the `X-Message-Id` header on HTTP 202. `status` reports display data, the settings namespace, limits of 1,000 recipients and 29,999,999 bytes, and `idempotent: false`. A missing or invalid API key returns `ready: false`, `a setup code`, and a reason. An invalid delivery endpoint reports `ready: false` with `provider_endpoint_invalid`.

Mail discovers and opens the binding through the transports group. SendGrid contributes this policy to the group.

```yaml
- name: transport_open
  kind: security.policy
  meta: { private: true }
  groups: [kickside.mail.security:transports]
  policy:
    resources: [kickside.mail.sendgrid:transport]
    actions: [contract.open]
    effect: allow
```

Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

## Error codes

HTTP 401 and 403 map to `authorization_refused`. A 401 can also mean that the account has exhausted its plan allowance.

```text
Code                            Kind                Retryable
attachment_encoding_failed         Source error       Source flag
authorization_refused              PermissionDenied   No
delivery_deadline_exceeded         Unavailable        Yes
delivery_deadline_invalid          Invalid            No
invalid_config                     Invalid            No
message_encoding_failed            Source error       Source flag
message_rejected                   Invalid            No
provider_endpoint_invalid          Invalid            No
provider_rejected                  Internal           No
provider_request_failed            Source error       Source flag
provider_transport_failed          Unavailable        Yes
provider_unavailable               Unavailable        Yes
rate_limited                       RateLimited        Yes
settings_read_failed               Internal           No
```

[Write a KickSide Mail driver](../../mail-resend/src/driver-authoring.md) for the contract, policies, helpers, and runnable example.

## Development

Use Wippy v0.3.70a and Make. The harness uses the sibling `components/mail`, `kickside`, and `converters` checkouts. Delivery goes to a loopback HTTPS SendGrid stub.

```sh
make verify
```

`make verify` uses the pinned harness lock and runs validation and the SQLite harness. Use `make lockrefresh` to update the lock explicitly. For PostgreSQL, create a dedicated test database and run
`make test-pg WIPPY_ARGS="--set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run.
