<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-dark.png">
  <img src="https://raw.githubusercontent.com/kicksideai/docs/main/getting-started/assets/brand/kickside-logo-light.png" alt="KickSide" width="320">
</picture>

# KickSide providers

Lua service connectors, sign-in providers, web search adapters, knowledge engines, upload processing, memory integrations, and agent tools for KickSide. Modules bind to the platform's connection, OAuth, agent, and automation contracts.

Examples include [GitHub](github), [GitLab](gitlab), [Google](google), [Slack](slack), [Discord](discord), [Atlassian](atlassian), [HubSpot](hubspot), [Remote MCP](mcp-client), [web search](webscout), [code execution](code_execution), the [kb10 knowledge engine](kb10), [speech transcription](asr), and [image text extraction](llm-ocr). Each module directory owns a separate module and its Lua unit tests.

Install the package you need through **System → Modules** in KickSide, then configure its connection or host requirements. See the [module installation guide](https://github.com/kicksideai/docs/blob/main/getting-started/first-module.md).

![The Remote MCP connector from this repository appears in KickSide Connections](https://raw.githubusercontent.com/kicksideai/docs/main/using/assets/providers/connections.png)

License: [KickSide Community License 1.0](LICENSE.md) · [Third-party notices](THIRD_PARTY_NOTICES.md).

[Documentation](https://github.com/kicksideai/docs) · [KickSide](https://kickside.ai)
