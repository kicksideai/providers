// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// Shapes of the memory HTTP API, the engine config schema and the Memory trait
// context, with the small helpers the elements share.

export type MemoryKind = 'identity' | 'rule' | 'profile_slot' | 'fact' | 'preference' | 'skill' | 'lesson'
export type MemoryStatus = 'current' | 'superseded' | 'conflict' | 'archived' | 'forgotten'

export interface MemoryItem {
  id: string
  kind: MemoryKind
  scope_family: 'agent' | 'owner'
  scope_id: string
  key: string
  content: string
  status: MemoryStatus
  version: number
  valid_at: string
  invalid_at?: string | null
  recorded_at: string
  source: 'capture' | 'tool' | 'reflection' | 'owner'
}

export interface Provenance { host_kind: string; host_id: string; event_id: string }

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
  web_component?: string
  order?: number
  group?: 'advanced'
}

export interface ConfigSchema { properties?: Record<string, SchemaField> }

export interface MemoryStatusView {
  config: Record<string, unknown>
  defaults: Record<string, unknown>
  config_schema: ConfigSchema
  counts: { current: number }
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

// Trait context the Memory capability stores on an agent.
export interface MemoryContext {
  memory_id: string
  write_enabled: boolean
  [key: string]: unknown
}

export interface MemoryEvents {
  'config-changed': { context: MemoryContext }
}

// Select options for memory kinds.
export function kindOptions(kinds: MemoryKind[] = Object.keys(KIND_LABEL) as MemoryKind[]): { value: MemoryKind; label: string }[] {
  return kinds.map((kind) => ({ value: kind, label: KIND_LABEL[kind] }))
}

// The object detail of a shared widget's CustomEvent.
export function eventDetail(event: Event): Record<string, unknown> {
  return event instanceof CustomEvent && isRecord(event.detail) ? event.detail : {}
}

// An element's `config` prop arrives as an object or as its JSON text.
export function parseConfig(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { return {} }
  }
  return isRecord(raw) ? raw : {}
}
