<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for Mailgun

This driver delivers messages from KickSide Mail through Mailgun. Set a Mailgun API key, verified sending domain, and matching API region. Delivery uses multipart requests with regular and inline attachments.

## Install

Install `kickside/mail-mailgun` alongside KickSide Mail and Settings. `us_api_base_url` and `eu_api_base_url` default to the corresponding Mailgun API origins. Set the installation's `sending_domain` and supply each permitted delivery URL as `<base URL>/v3/<sending domain>/messages` in `delivery_urls`. For example, a US installation can set these dependency parameters.

```yaml
parameters:
  - name: kickside.mail.mailgun:sending_domain
    value: mg.example.org
  - name: kickside.mail.mailgun:delivery_urls
    value: [https://api.mailgun.net/v3/mg.example.org/messages]
```

Set the region in Settings to match the authorized URL. Update the installation parameters when authorizing a different region or sending domain.

## Settings

In **Settings → Integrations → Mail**, select **Mailgun** and set `api_key` as an encrypted secret, `domain` as the verified sending domain (defaults to the installation’s `sending_domain`), and `region` as `us` or `eu` (default `us`). The **Administer Mailgun mail delivery** capability grants access to the driver’s registry declarations for its settings. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.mailgun:transport` implements the Mail `send` and `status` methods. `send` uses Mail’s delivery deadline and returns the provider’s message ID when Mailgun supplies one. `status` reports display data, the settings namespace, limits of 1,000 recipients and 25,000,000 bytes, and `idempotent: false`. A missing or invalid setting or an unauthorized delivery URL returns `ready: false`, `code: invalid_config`, and a setup reason.

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
credentials_invalid             PermissionDenied    No
delivery_deadline_exceeded       Unavailable         Yes
delivery_deadline_invalid        Invalid             No
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

Use Wippy v0.3.70a and Make. The harness uses the sibling `components/mail`, `kickside`, and `converters` checkouts. Delivery goes to a loopback Mailgun stub.

```sh
make verify
```

`make verify` refreshes the dependency graph and runs validation and the in-memory SQLite harness. For PostgreSQL, create a dedicated test database, then run the same target with
`WIPPY_ARGS="--profile postgres --set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run.
