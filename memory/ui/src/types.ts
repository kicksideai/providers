// The trait activation context this capability persists. The first selected KB is
// the write target unless the runtime overrides it.
export interface MemoryContext {
  kb_ids: string[]
  read_enabled: boolean
  write_enabled: boolean
  checkpoint_model: string
  checkpoint_prompt: string
  recall_prompt: string
  recall_limit: number
  recall_max_chars: number
}

// The checkpoint policy the agent runtime reads from agent_options.
export interface CheckpointOptions {
  token_threshold: number
  model: string
  max_tokens: number
}

// The exact byte-shape emitted on `config-changed` and accepted as `config`.
export interface MemoryConfig {
  context: MemoryContext
  agent_options: { checkpoint: CheckpointOptions }
}

// The host may pass config as the built object, a partial (flat or nested
// context), or a JSON string attribute; the component normalizes all three.
export type IncomingConfig = Partial<MemoryConfig> & Record<string, unknown>

export interface ComponentProps {
  config?: IncomingConfig | string | null
}

export interface MemoryEvents {
  'config-changed': MemoryConfig
}
