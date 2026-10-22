// Trait context the Memory capability stores on an agent.
export interface MemoryContext {
  memory_id: string
  write_enabled: boolean
  [key: string]: unknown
}

export interface MemoryConfig {
  context: MemoryContext
}

export interface ComponentProps {
  config?: Record<string, unknown> | string | null
}

export interface MemoryEvents {
  'config-changed': MemoryConfig
}
