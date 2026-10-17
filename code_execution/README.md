# kickside/code-execution

Sandboxed Lua execution and a typed Run Code Block.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/code-execution
wippy install
```

Apply host bindings and migrations through the application install plan.
Bind an explicit allowed tool set for sandboxed code. The same execution SDK backs the Run Code Block.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make build` from this directory;
commit regenerated tracked assets with the source.

## Use

Configure the Run Code capability with an explicit tool allowlist. Code uses the declared SDK surface under the caller’s identity and resource restrictions. The module contributes the canonical Run Code Block and does not grant access to arbitrary installed tools.

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`RunCode`](src/traits/_index.yaml) | See the operation schema |
| [`RecommendTools`](src/traits/_index.yaml) | `fields` |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.code_execution:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.code_execution:ui_server`](src/_index.yaml) | Host supplies the value |
| [`kickside.code_execution.security:user_security_scope`](src/security/module_access/_index.yaml) | `kickside.security.groups:members` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/code-execution)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
