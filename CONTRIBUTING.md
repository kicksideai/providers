# Contributing to KickSide Providers

Follow the [organization contribution guide](https://github.com/kicksideai/.github/blob/main/CONTRIBUTING.md),
[Code of Conduct](https://github.com/kicksideai/.github/blob/main/CODE_OF_CONDUCT.md), and
[CLA](https://github.com/kicksideai/.github/blob/main/CLA.md). The CLA check on your pull
request explains how to sign.

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

### Secret scan before commit

Install the hook once per clone with [pre-commit](https://pre-commit.com):
`pre-commit install`. On each commit gitleaks scans the staged changes and
refuses a commit that carries a secret (an API key, a token, a password).
pre-commit builds gitleaks on the first commit, which takes about a minute once.

If gitleaks stops a commit, remove the secret and supply it through the
environment instead. A value that only looks like a secret, such as a test
fixture, goes into `.gitleaks.toml` as an exception for that file and that
value. A secret that already reached a commit is leaked: rotate it.

## Pull requests

Create a focused branch and submit a GitHub pull request to this repository.
Use a commit subject such as
`docs: clarify setup` or `fix: handle an empty result`. Explain the behavior and
validation in the PR; include relevant commands and outcomes. Maintainers review
and merge GitHub pull requests after the required checks and CLA confirmation.
