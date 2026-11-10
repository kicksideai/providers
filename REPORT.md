<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
# Memory structured output and uninstall

Memory sends the common structured-output grammar to supported model providers. The complete bounded schema still determines each output budget and validates every decoded result. Length, range, pattern and collection constraints remain unchanged locally and appear as direct system-prompt instructions as well as schema descriptions.

Migration 05 removes the current memory tables during uninstall. Migration 01 removes any baseline tables still present. Neither down path recreates an older schema, and the forward migrations remain unchanged.

## Validation

The focused schema and migration tests fail before the fixes. The memory suites pass 347 tests on SQLite and PostgreSQL with the official runtime v0.3.59a. Lint and the package dry run pass. Real-model browser scenarios exercise capture, independent recall, deletion and uninstall on both engines.

## Compatibility

Existing registry identities, methods, requirements, endpoints, event shapes and stored data remain unchanged. All original output-validation constraints and errors remain enforced. The new grammar helper is additive. Uninstall intentionally removes module-owned data and indexes; the shared vector extension remains installed. No forward migration changes or data-shape retirement occurs.

No table write path or retention schedule changes. This change introduces no additional steady-state rows at either 10x or 100x load.
