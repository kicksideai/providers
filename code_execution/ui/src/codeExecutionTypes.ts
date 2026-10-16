// The code-authoring WC (kickside-code-body) contract. The canonical Run Code Block
// config is the single owner of code, the optional tool whitelist, and the optional
// exported method.
export interface CodeBodyProps {
  config?: { code?: string; tool_ids?: string[]; method?: string } | null
}
export interface CodeBodyEvents {
  'config-changed': { code: string; tool_ids?: string[]; method?: string }
  error: { message: string; error: unknown }
}

// One tool in the SDK-reference surface (GET /api/v1/code-execution/sdk-reference).
// `call` is the exact, namespace-qualified invocation the sandbox exposes.
export interface SdkTool {
  id: string
  label: string
  namespace?: string
  call?: string
  description?: string
  input_schema?: Record<string, unknown>
  output_schema?: Record<string, unknown>
}

// The callable surface the sandbox exposes for the current tool selection.
export interface SdkReference {
  tools: SdkTool[]
}

// The result of POST /api/v1/code-execution/assist. Validated code fills the editor;
// otherwise `errors` carry the gate failures.
export interface AssistResult {
  code?: string
  validated: boolean
  errors?: string[]
}
