# Changelog

## [0.1.23](https://github.com/kicksideai/providers/compare/discord-v0.1.22...discord-v0.1.23) (2026-10-23)


### Bug Fixes

* **discord:** narrow captured transport rows ([e7529df](https://github.com/kicksideai/providers/commit/e7529df219fc319cf649d378ea7c7c883ca81dbc))

## [0.1.22](https://github.com/kicksideai/providers/compare/discord-v0.1.21...discord-v0.1.22) (2026-10-23)


### Bug Fixes

* **discord:** dedupe retried posts with an enforced nonce ([a3425a6](https://github.com/kicksideai/providers/commit/a3425a6ebf313072132885b2337a12facf3c3759))

## 0.1.19 (2026-10-09)

- Honor connection capacity at canonical provider transports (7c19888b)

## 0.1.18 (2026-10-08)

- fix: preserve native result bounds and refresh selected model limits (b9dc370d)
- fix: bound agent tool results and derive model checkpoint budgets (ff050198)
- fix: bind Security in provider hosts and inspect supplied configs (88d42b29)
- chore: refresh locks to latest published dependencies (61715074)
- Add selectable module access policies and native scope tests (5ae4742d)
- Use the shared authorized reader for Discord status metadata (8f21e319)
- test: declare local siblings and refresh provider harness dependencies (38657c34)
- Verify gateway grants against stored Discord connection identity (d880c68c)
- test(discord): preserve gateway constructor supervision contracts (5af2fc3d)
- fix(discord): retain and recover supervised gateway worker failures (43ffa975)
- fix(discord): register and discover the gateway in one process scope (daa53510)
- fix(discord): reconcile gateway workers on connection lifecycle changes (61aa60a1)
- Retry failed gateway admission without terminating the shared supervisor (1a76f3b1)
- fix(discord): declare optional warning results and complete the health fixture connection (41cfa5dc)
- fix(release): retain published provider snapshot metadata and locks (b70f940e)
- fix(discord): scope the gateway runtime-meta grant to Discord connection components (7091b143)
- fix(discord): keep the gateway running without MESSAGE CONTENT and surface a typed warning (48ee8008)
- fix(discord): per-message routing outcomes never write connection health (ed268711)
- test(providers): prove host-bound services and harness integrity (af18c937)
- Fix Discord responder ingress and expose typed connection failures (6fcfd385)

## 0.1.17

Current published Hub version.

## 0.1.16

Current published Hub version.
