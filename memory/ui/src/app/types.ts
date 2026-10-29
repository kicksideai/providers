// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

export type MemoryKind = 'identity' | 'rule' | 'profile_slot' | 'fact' | 'preference' | 'plan' | 'skill' | 'lesson'
export type MemoryStatus = 'current' | 'superseded' | 'conflict' | 'archived' | 'forgotten'

export interface MemoryItem {
  id: string
  kind: MemoryKind
  scope_family: 'agent' | 'owner'
  scope_id: string
  key: string
  cardinality: 'single' | 'multi'
  content: string
  status: MemoryStatus
  version: number
  valid_at: string
  invalid_at?: string | null
  recorded_at: string
  superseded_by?: string | null
  source: 'capture' | 'reflection' | 'owner'
}

export interface SourceLine { role: 'user' | 'assistant' | 'tool'; text: string; created_at?: string }

export interface SourceMemory { id: string; kind: MemoryKind; key: string; content: string; status: MemoryStatus }

export interface Provenance {
  host_kind: string
  host_id: string
  event_id: string
  recorded_at?: string
  line?: SourceLine
  memory?: SourceMemory
}

export interface ConflictGroup { group_id: string; items: MemoryItem[] }

export interface MemoryRun {
  id: string
  run_type: 'derive' | 'consolidate' | 'reembed'
  status: 'scheduled' | 'running' | 'succeeded' | 'failed' | 'rejected'
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
  section?: string
}

export interface ConfigSchema {
  type: 'object'
  properties: Record<string, SchemaField>
}

export interface MemoryStatusView {
  counts: Partial<Record<MemoryStatus | 'total' | 'conflict_groups', number>>
  runs: MemoryRun[]
}

export interface Page<T> { rows: T[]; next: number | null }

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

export function pageOf<T>(data: unknown, field: string): Page<T> {
  if (!isRecord(data) || !Array.isArray(data[field])) throw new Error(`Memory response is missing ${field}`)
  const next = data.next_offset
  if (next !== undefined && (typeof next !== 'number' || !Number.isInteger(next) || next < 0)) {
    throw new Error('Memory response has an invalid next_offset')
  }
  return { rows: data[field] as T[], next: typeof next === 'number' ? next : null }
}

export interface MemoryContext { memory_id: string }

export interface MemoryEvents {
  'config-changed': { context: MemoryContext }
}

export function eventDetail(event: Event): Record<string, unknown> {
  return event instanceof CustomEvent && isRecord(event.detail) ? event.detail : {}
}

export function parseConfig(raw: unknown): Record<string, unknown> {
  if (raw === undefined) return {}
  if (typeof raw === 'string') raw = JSON.parse(raw)
  if (!isRecord(raw)) throw new Error('Memory configuration must be an object')
  return raw
}

export function parseCreateSchema(raw: unknown): ConfigSchema {
  if (!isRecord(raw) || raw.type !== 'object' || !isRecord(raw.properties) || !Object.keys(raw.properties).length) {
    throw new Error('Memory create schema must supply object properties')
  }
  for (const field of Object.values(raw.properties)) {
    if (!isRecord(field) || !['string', 'integer', 'number', 'boolean'].includes(String(field.type))) {
      throw new Error('Memory create schema must supply object properties')
    }
  }
  return { type: 'object', properties: raw.properties as Record<string, SchemaField> }
}

export interface MemoryCreateEvents {
  'config-changed': { embedding_model: string; config: Record<string, unknown> }
}
