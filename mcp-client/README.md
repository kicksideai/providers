# kickside/mcp-client

Streamable HTTP MCP connections with OAuth sign-in, stored credentials, and dynamic agent tools.

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

Wippy 0.3.x; repository validation uses 0.3.55a. Use current Hub dependencies
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

Open **Connections → Connect app → Remote MCP**, enter the Streamable HTTP
endpoint, and choose **Sign in with OAuth**. Approve the server's consent screen,
then select the connection and permitted tools on an agent's Remote MCP capability.

The client discovers protected-resource and OAuth/OIDC metadata, verifies PKCE
S256, and binds authorization and token requests to the MCP resource. It supports
OAuth client metadata documents, dynamic client registration, and pre-registered
clients. For a pre-registered client, use Advanced settings to enter its id,
optional secret, and token authentication method. Scope overrides are optional.
OAuth endpoints require HTTPS; loopback HTTP is available for local development.

OAuth grants and client credentials use `kickside/oauth` encrypted storage.
Expiry and a rejected access token trigger refresh under the authenticated
caller's identity. A revoked refresh grant marks the connection `needs_reauth`;
choose Reconnect to sign in again. Tokens never appear in tool schemas or popup
messages. API keys, pasted bearer tokens, and unauthenticated endpoints remain
available as separate setup choices. Changing authentication type requires a new
connection.

This version must ship with the accompanying platform OAuth changes: provider
initialization options, issuer forwarding, per-connection refresh configuration,
and custom connection implementations. Install that platform update before this
provider. The host binds the existing OAuth database, routers, and process host,
and the MCP client's `public_router` for its client metadata document.

Use `kickside/mcp` to expose KickSide tools to an external client.

## Reference

- [Module reference](src/README.md)

### Registry layout

The new OAuth entries live in `kickside.mcp_client.oauth`: `provider`,
`connection`, `connector`, `service`, `config`, `init`, `callback`, and `refresh`.
The public client metadata handler belongs to `kickside.mcp_client.oauth.api`.
Existing published MCP contract and tool IDs retain their namespaces.

MCP reads private provider options through the actor-validated
`kickside.oauth.runtime:connection` contract and tokens through the existing OAuth
connection contract. OAuth owns persistence, encryption and refresh; MCP does not
import its repository. This requires `kickside/oauth >=0.1.40`.

Complete catalog discovery rejects repeated cursor tokens, including longer
cycles, and has a five-minute deadline. There is no fixed tool-count or page-size
cap. Single-page listing keeps the remote provider's native pagination.

### Verification

`make test-backend` includes a real local HTTP authorization server, PKCE code
exchange, the shared callback and encrypted persistence, MCP tool discovery and
calls, expiry, 401 refresh, reconnect, and revoked grants. `make test-ui`
checks popup origin, source, state, denial,
blocked popups, and cancellation.

For the Chromium consent test, run `make build test-prepare`, start
`wippy run` from `test/`, and run `make test-browser` with the
Playwright 1.59.1 browser installed (or in its matching Playwright container).
The test drives the built editor and real callback through a demo consent popup.

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.mcp_client:client`](src/_index.yaml) | `list_tools`, `call_tool` |

### Agent tools

Tool names link to their input/output schemas. Capabilities and the caller’s
resource access determine which tools are available.

| Tool | Selection and paging inputs |
| --- | --- |
| [`RemoteMCP`](src/_index.yaml) | See the operation schema |

### Host requirements

Bind these exact requirement IDs through the module’s dependency declaration
or Hub plan. Existing explicit bindings take precedence over defaults.

| Requirement | Declared default |
| --- | --- |
| [`kickside.mcp_client:process_host`](src/_index.yaml) | Host supplies the value |
| [`kickside.mcp_client:public_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.mcp_client:api_router`](src/_index.yaml) | Host supplies the value |
| [`kickside.mcp_client:ui_server`](src/_index.yaml) | Host supplies the value |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/mcp-client)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
