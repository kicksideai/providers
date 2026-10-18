# Changelog

## 0.2.6 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.2.2 (2026-10-09)

- Shows the Ask controls only when the knowledge base can answer; the query function no longer shadows the answer capability (c9a7a595).

## 0.2.1 (2026-10-08)

- Preserve retrieval observations and tuning state when installing or updating the knowledge-base schema.

## 0.2.0 (2026-10-08)

- fix(kb10): document analysis admits only the identities of the summaries it was shown (7c123443)
- fix: preserve native result bounds and refresh selected model limits (b9dc370d)
- fix: bound agent tool results and derive model checkpoint budgets (ff050198)
- fix(kb10): HyDE and embedding model failures surface as classified errors through the shared model_failure library (71c821ba)
- fix(kb10): model call failures in query ranking surface as an unavailable upstream (ba3d8c8f)
- chore: refresh locks to latest published dependencies (8f6ec35e)
- fix: bind Security in provider hosts and inspect supplied configs (88d42b29)
- build: rebuild bundles from source (1696370e)
- chore: refresh locks to latest published dependencies (61715074)
- Add selectable module access policies and native scope tests (5ae4742d)
- fix(kb10): resolve Knowledge through the latest Hub version (49b3a46f)
- Preserve typed KB lifecycle cleanup errors and resume fenced stores (4fdb14ca)
- test: declare local siblings and refresh provider harness dependencies (38657c34)
- fix(kb10): preserve UTF-8 across bounded retrieval text (4dba7c10)
- feat(kb10): declare default-off HyDE and bounded retrieval tuning (136b42c6)
- Reuse parser context and batch document persistence (7645cd6c)
- Resolve KB maintenance status by queue identity and resource (155bf5f2)
- Declare KB maintenance triggers and propagate export directory errors (4f73b0fd)
- fix(release): retain published provider snapshot metadata and locks (b70f940e)
- fix(kb10): import reports an unreadable store part instead of indexing a failed read (77630717)
- fix(kb10): return portable store read errors and prove maintenance wiring (7823312d)

## 0.1.49

Current published Hub version.

## 0.1.47

Current published Hub version.
