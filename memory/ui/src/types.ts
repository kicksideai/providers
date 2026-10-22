// The trait context the Memory trait stores. The first memory is the one the
// agent writes captured conversation into.
export interface MemoryContext {
  memory_ids: string[]
  write_enabled: boolean
  read_enabled: boolean
  recall_limit: number
  checkpoint_model: string
}

// The checkpoint policy the agent runtime reads from agent_options.
export interface CheckpointOptions {
  token_threshold: number
  model: string
  max_tokens: number
}

// The exact shape emitted on `config-changed` and accepted as `config`.
export interface MemoryConfig {
  context: MemoryContext
  agent_options: { checkpoint: CheckpointOptions }
}

// The host may pass the built object, a partial (flat or nested context,
// including the kb_ids key of earlier releases), or a JSON string attribute.
export type IncomingConfig = Partial<MemoryConfig> & Record<string, unknown>

export interface ComponentProps {
  config?: IncomingConfig | string | null
}

export interface MemoryEvents {
  'config-changed': MemoryConfig
}
