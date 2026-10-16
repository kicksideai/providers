# kickside/mcp-client

Streamable HTTP MCP connections and dynamic agent tools.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/mcp-client
wippy install
```

Apply host bindings and migrations through the application install plan.
Create a Streamable HTTP connection to an MCP server. Discover its tools and attach the required connection capability to the agent.

## Key concepts

Provider registry declarations expose capabilities to the host. Connections
keep user credentials in private context; shared contracts define how agents
and application modules call those capabilities.
See the [registry and API reference](src/README.md) for the module contract.

The `kickside.mcp_client:client` contract's `call_tool` returns `(result, nil)`
for a remote MCP tool result, including `isError: true`. Callers inspect
`result.isError` for a tool failure. Transport and protocol failures return
`(nil, err)`. The module's agent-tool adapters turn remote tool failures into
agent errors.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Frontend development also uses Node.js 22, npm, and Make.

## Development

From this module directory:

```sh
cd test
wippy install
cd ..
make lint
make test
cd test
wippy test --profile postgres --set vars.pg_database=kickside_readme_test
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.
Edit frontend source under `ui/` and run `make build` from this directory;
commit regenerated tracked assets with the source.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/mcp-client)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
