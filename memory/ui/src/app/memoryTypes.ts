export type MemoryKind = 'identity' | 'rule' | 'profile_slot' | 'fact' | 'preference' | 'skill' | 'lesson'
export type MemoryStatus = 'current' | 'superseded' | 'conflict' | 'forgotten'

export interface MemoryItem {
  id: string
  component_id: string
  kind: MemoryKind
  scope_family: 'agent' | 'owner' | 'session' | 'group'
  scope_id: string
  scope_key: string
  key: string
  content: string
  value: unknown
  status: MemoryStatus
  version: number
  valid_at: string
  invalid_at?: string | null
  recorded_at: string
  superseded_by?: string | null
  conflict_group?: string | null
  confidence?: number | null
  source: 'capture' | 'tool' | 'reflection' | 'owner'
  priority: number
}

export interface Provenance { host_kind: string; host_id: string; event_id: string; recorded_at: string }

export interface ConflictGroup { group_id: string; items: MemoryItem[] }

export interface MemoryRun {
  id: string
  run_type: 'derive' | 'consolidate' | 'reembed'
  status: 'scheduled' | 'running' | 'succeeded' | 'failed'
  last_error?: string | null
  stats?: Record<string, number>
  host_kind?: string
  created_at: string
  started_at?: string | null
  finished_at?: string | null
}

export interface SchemaField {
  type?: 'string' | 'integer' | 'number' | 'boolean'
  title?: string
  description?: string
  minimum?: number
  maximum?: number
  format?: string
  role?: string
  web_component?: string
  order?: number
  group?: 'advanced'
}

export interface ConfigSchema { properties?: Record<string, SchemaField> }

export interface MemoryStatusView {
  memory_id: string
  embedding_model: string
  config: Record<string, unknown>
  config_schema: ConfigSchema
  counts: { current: number; superseded: number; conflict: number; forgotten: number; total: number; conflict_groups: number }
  runs: MemoryRun[]
}

export const KIND_LABEL: Record<MemoryKind, string> = {
  identity: 'Identity', rule: 'Rule', profile_slot: 'Profile', fact: 'Fact',
  preference: 'Preference', skill: 'Skill', lesson: 'Lesson',
}


export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function errorText(err: unknown): string {
  if (isRecord(err)) {
    const response = err.response
    if (isRecord(response) && isRecord(response.data) && typeof response.data.error === 'string') return response.data.error
    if (typeof err.message === 'string') return err.message
  }
  return String(err)
}
