# Contributing to KickSide Providers

Follow the [organization contribution guide](https://github.com/kicksideai/.github/blob/main/CONTRIBUTING.md),
[Code of Conduct](https://github.com/kicksideai/.github/blob/main/CODE_OF_CONDUCT.md), and
[CLA](https://github.com/kicksideai/.github/blob/main/CLA.md). Send the signed CLA privately to
[licensing@wippy.ai](mailto:licensing@wippy.ai) before merge.

## Development and testing

Install the Wippy CLI version used by [CI](.github/workflows/ci.yml), Make,
Python 3, and Node.js/npm for providers with UI (CI uses Node.js 20).
From the repository root:

```sh
make verify-declarations
make lint
make test
```

For a focused change, use the provider's own targets, such as
`make -C github build`, `make -C github lint`, and `make -C github test`.
Targets differ by provider; inspect its Makefile and harness. Root targets
provide a development-only encryption key; direct module tests may require the
harness environment to be set separately. Never use production credentials.
For SQL or migration changes, exercise SQLite and PostgreSQL where the harness
supports them. Keep generated UI bundles with their source and add new modules
to the root Makefile and CI matrices.

## Pull requests

Create a focused branch and submit a GitHub pull request to this repository.
Use a commit subject such as
`docs: clarify setup` or `fix: handle an empty result`. Explain the behavior and
validation in the PR; include relevant commands and outcomes. Maintainers review
and merge GitHub pull requests after the required checks and CLA confirmation.
