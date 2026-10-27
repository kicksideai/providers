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
  source: 'capture' | 'tool' | 'reflection' | 'owner'
}

export interface Provenance { host_kind: string; host_id: string; event_id: string; recorded_at?: string }

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
  section?: string
}

export interface ConfigSchema { properties?: Record<string, SchemaField> }

export interface MemoryStatusView {
  config: Record<string, unknown>
  defaults: Record<string, unknown>
  config_schema: ConfigSchema
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
  if (!isRecord(data)) return { rows: [], next: null }
  const rows = Array.isArray(data[field]) ? (data[field] as T[]) : []
  return { rows, next: typeof data.next_offset === 'number' ? data.next_offset : null }
}

export interface MemoryContext {
  memory_id: string
  write_enabled: boolean
  [key: string]: unknown
}

export interface MemoryEvents {
  'config-changed': { context: MemoryContext }
}

export function eventDetail(event: Event): Record<string, unknown> {
  return event instanceof CustomEvent && isRecord(event.detail) ? event.detail : {}
}

export function parseConfig(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { return {} }
  }
  return isRecord(raw) ? raw : {}
}
