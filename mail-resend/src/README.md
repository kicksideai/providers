<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# KickSide Mail for Resend

This driver delivers messages from KickSide Mail through Resend. Set an API key authorized to send from the verified domain. Resend uses an optional idempotency key on its delivery request.

## Install

Install `kickside/mail-resend` alongside KickSide Mail and Settings. `api_base_url` defaults to `https://api.resend.com/emails`. The send function has outbound HTTP access to the Resend `/emails` endpoint. To override it, pass the complete delivery URL, including the path. The same value sets the destination and its outbound HTTP grant.

## Settings

The driver declares Settings definitions only. They appear in Mail’s one block, **Settings → Integrations → Mail**, which claims the `kickside.mail.resend` namespace. Select **Resend** there and set `api_key`, an encrypted secret. The **Administer Resend mail delivery** capability grants access to the driver’s registry declarations for its settings. Platform Settings controls authorization to edit settings.

## Contract and tools

`kickside.mail.resend:transport` implements the Mail `send` and `status` methods. `send` uses Mail's delivery deadline and returns the provider’s message ID when Resend supplies one. `status` reports display data, the settings namespace, limits of 50 recipients and 40,000,000 bytes, and support for idempotency. A missing or invalid API key returns `ready: false`, a setup code, and a reason. An invalid delivery endpoint reports `ready: false` with `provider_endpoint_invalid`.

Mail discovers and opens the binding through the transports group. Resend contributes this policy to the group.

```yaml
- name: transport_open
  kind: security.policy
  meta: { private: true }
  groups: [kickside.mail.security:transports]
  policy:
    resources: [kickside.mail.resend:transport]
    actions: [contract.open]
    effect: allow
```

Use KickSide Mail’s contract, tools, and automation destination to send messages under the installation’s sender policy.

## Error codes

```text
Code                            Kind                Retryable
attachment_encoding_failed         Source error       Source flag
authorization_refused              PermissionDenied   No
credentials_invalid                PermissionDenied   No
delivery_deadline_exceeded         Unavailable        Yes
delivery_deadline_invalid          Invalid            No
idempotency_conflict               Conflict           No
invalid_config                     Invalid            No
message_encoding_failed            Source error       Source flag
message_rejected                   Invalid            No
provider_endpoint_invalid          Invalid            No
provider_rejected                  Internal           No
provider_request_failed            Source error       Source flag
provider_response_invalid          Internal           No
provider_transport_failed          Unavailable        Yes
provider_unavailable               Unavailable        Yes
quota_exhausted                    RateLimited        No
rate_limited                       RateLimited        Yes
request_rejected                   Invalid            No
send_in_progress                   Conflict           Yes
sender_or_recipient_not_allowed    PermissionDenied   No
settings_read_failed               Internal           No
```

[Mail’s driver authoring guide](https://github.com/kicksideai/components/blob/main/mail/src/driver-authoring.md) covers the transport contract, policies, helpers, and runnable example.

## Development

Use Wippy v0.3.70a, Make, and Python 3 with PyYAML. The harness uses the sibling `components/mail`, `kickside`, and `converters` checkouts. Delivery goes to a loopback HTTPS Resend stub.

```sh
make verify
```

`make verify` uses the pinned harness lock and runs validation and the fresh SQLite harness. Use `make lockrefresh` to update the lock explicitly. For PostgreSQL, create a dedicated test database and run
`make test-pg WIPPY_ARGS="--set vars.pg_host=$PGHOST --set vars.pg_port=$PGPORT --set vars.pg_database=$PGDATABASE"`.
Drop the database after the run.
