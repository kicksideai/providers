<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for Mailgun

This driver delivers messages from KickSide Mail through Mailgun. Delivery uses multipart requests with regular and inline attachments.

## Install

Install `kickside/mail-mailgun` alongside KickSide Mail and Settings. The US and EU API prefixes default to `https://api.mailgun.net/v3/*` and `https://api.eu.mailgun.net/v3/*`. An installation can override them through `us_api_base_url` and `eu_api_base_url` using the same `https://<host>/v3/*` form. Each requirement supplies both the regional endpoint and its HTTP policy grant. The driver builds the delivery URL from the selected region and the current sending domain.

## Settings

In **Settings → Integrations → Mail**, select **Mailgun** and set `api_key` as an encrypted secret, `domain` as the verified sending domain (defaults to the installation’s `sending_domain`), and `region` as `us` or `eu` (default `us`). The **Administer Mailgun mail delivery** capability grants access to the driver’s registry declarations for its settings. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.mailgun:transport` implements the Mail `send` and `status` methods. `send` uses Mail’s delivery deadline and returns the provider’s message ID when Mailgun supplies one. `status` reports display data, the settings namespace, limits of 1,000 recipients and 25,000,000 bytes, and `idempotent: false`. A missing or invalid setting returns `ready: false`, `code: invalid_config`, and a setup reason.

Mail discovers and opens the binding through the transports group. Mailgun contributes this policy to the group.

```yaml
- name: transport_open
  kind: security.policy
  meta: { private: true }
  groups: [kickside.mail.security:transports]
  policy:
    resources: [kickside.mail.mailgun:transport]
    actions: [contract.open]
    effect: allow
```

Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

## Error codes

```text
Code                            Kind                Retryable
authorization_refused              PermissionDenied   No
credentials_invalid                PermissionDenied   No
delivery_deadline_exceeded         Unavailable        Yes
delivery_deadline_invalid          Invalid            No
invalid_attachment                 Invalid            No
invalid_config                     Invalid            No
invalid_content_id                 Invalid            No
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

Use Wippy v0.3.70a and Make. The harness uses the sibling `components/mail`, `kickside`, and `converters` checkouts. Delivery goes to a loopback HTTPS Mailgun stub.

```sh
make verify
```

`make verify` refreshes the dependency graph and runs validation and both SQLite harness profiles. The default-install profile checks readiness and policy admission without making HTTP requests. For PostgreSQL, create a dedicated test database, then run the same target with
`WIPPY_ARGS="--profile postgres --set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run.
