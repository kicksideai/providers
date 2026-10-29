// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { api } from '@wippy-fe/proxy'
import { isRecord, type ConflictGroup, type MemoryItem, type MemoryRun, type MemoryStatusView, type Page, type Provenance } from './types'

function path(id: string): string { return `/api/v1/memory/${encodeURIComponent(id)}` }

function response(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) throw new Error('Memory response is malformed')
  return data
}

export function httpStatus(err: unknown): number | undefined {
  if (!isRecord(err) || !isRecord(err.response) || typeof err.response.status !== 'number') return undefined
  return err.response.status
}

function text(value: unknown, label: string): string { if (typeof value !== 'string') throw new Error(`Memory response has an invalid ${label}`); return value }
function oneOf<T extends string>(value: unknown, values: readonly T[], label: string): T { if (typeof value !== 'string' || !values.includes(value as T)) throw new Error(`Memory response has an invalid ${label}`); return value as T }
const KINDS = ['identity', 'rule', 'profile_slot', 'fact', 'preference', 'plan', 'skill', 'lesson'] as const
const STATUSES = ['current', 'superseded', 'conflict', 'archived', 'forgotten'] as const
const SOURCES = ['capture', 'reflection', 'owner'] as const
const RUN_TYPES = ['derive', 'consolidate', 'reembed'] as const
const RUN_STATUSES = ['scheduled', 'running', 'succeeded', 'failed', 'rejected'] as const

function itemRow(raw: unknown): MemoryItem {
  if (!isRecord(raw)) throw new Error('Memory response has an invalid item')
  if (typeof raw.version !== 'number' || !Number.isInteger(raw.version)) throw new Error('Memory response has an invalid item version')
  return { id: text(raw.id, 'item'), kind: oneOf(raw.kind, KINDS, 'item kind'), scope_family: oneOf(raw.scope_family, ['agent', 'owner'] as const, 'item scope_family'), scope_id: text(raw.scope_id, 'item scope_id'), key: text(raw.key, 'item key'), cardinality: oneOf(raw.cardinality, ['single', 'multi'] as const, 'item cardinality'), content: text(raw.content, 'item content'), status: oneOf(raw.status, STATUSES, 'item status'), version: raw.version, valid_at: text(raw.valid_at, 'item valid_at'), invalid_at: typeof raw.invalid_at === 'string' || raw.invalid_at === null ? raw.invalid_at : undefined, recorded_at: text(raw.recorded_at, 'item recorded_at'), superseded_by: typeof raw.superseded_by === 'string' || raw.superseded_by === null ? raw.superseded_by : undefined, source: oneOf(raw.source, SOURCES, 'item source') }
}
function provenanceRow(raw: unknown): Provenance {
  const origin = response(raw)
  const row: Provenance = { host_kind: text(origin.host_kind, 'provenance host_kind'), host_id: text(origin.host_id, 'provenance host_id'), event_id: text(origin.event_id, 'provenance event_id'), recorded_at: typeof origin.recorded_at === 'string' ? origin.recorded_at : undefined }
  if (origin.line !== undefined) {
    const line = response(origin.line)
    row.line = { role: oneOf(line.role, ['user', 'assistant', 'tool'] as const, 'source line role'), text: text(line.text, 'source line text'), created_at: typeof line.created_at === 'string' ? line.created_at : undefined }
  }
  if (origin.memory !== undefined) {
    const memory = response(origin.memory)
    row.memory = { id: text(memory.id, 'source memory'), kind: oneOf(memory.kind, KINDS, 'source memory kind'), key: text(memory.key, 'source memory key'), content: text(memory.content, 'source memory content'), status: oneOf(memory.status, STATUSES, 'source memory status') }
  }
  return row
}
function runRow(raw: unknown): MemoryRun {
  if (!isRecord(raw)) throw new Error('Memory response has an invalid run')
  return { id: text(raw.id, 'run'), run_type: oneOf(raw.run_type, RUN_TYPES, 'run type'), status: oneOf(raw.status, RUN_STATUSES, 'run status'), created_at: text(raw.created_at, 'run created_at'), last_error: typeof raw.last_error === 'string' || raw.last_error === null ? raw.last_error : undefined, stats: isRecord(raw.stats) ? raw.stats as Record<string, number> : undefined, host_kind: typeof raw.host_kind === 'string' ? raw.host_kind : undefined, started_at: typeof raw.started_at === 'string' || raw.started_at === null ? raw.started_at : undefined, finished_at: typeof raw.finished_at === 'string' || raw.finished_at === null ? raw.finished_at : undefined }
}
function page<T>(data: unknown, field: string, decode: (row: unknown) => T): Page<T> {
  const value = response(data); const rows = value[field]
  if (!Array.isArray(rows)) throw new Error(`Memory response is missing ${field}`)
  if (value.next_offset !== undefined && (typeof value.next_offset !== 'number' || !Number.isInteger(value.next_offset) || value.next_offset < 0)) throw new Error('Memory response has an invalid next_offset')
  return { rows: rows.map(decode), next: typeof value.next_offset === 'number' ? value.next_offset : null }
}
async function getPage<T>(url: string, field: string, decode: (row: unknown) => T): Promise<Page<T>> {
  const { data } = await api.get(url)
  return page(data, field, decode)
}

export async function listMemories(query = '', offset = 0): Promise<Page<{ id: string; name: string; description?: string; item_count?: number }>> {
  const params = new URLSearchParams({ limit: '20' })
  if (query) params.set('q', query)
  if (offset) params.set('offset', String(offset))
  return getPage(`/api/v1/memory?${params}`, 'items', (row) => { const value = response(row); return { id: text(value.id, 'memory'), name: text(value.name, 'memory name'), description: typeof value.description === 'string' ? value.description : undefined, item_count: typeof value.item_count === 'number' ? value.item_count : undefined } })
}

export async function resolveMemory(id: string): Promise<{ id: string; name: string }> {
  const { data } = await api.get(`/api/v1/knowledge/${encodeURIComponent(id)}`)
  const value = response(data)
  if (value.kb_type !== 'memory' || typeof value.name !== 'string') throw new Error('Selected resource is not a memory')
  return { id, name: value.name }
}

export function memoryApi(id: string) {
  const base = path(id)
  return {
    async status(): Promise<MemoryStatusView> {
      const { data } = await api.get(`${base}/status`)
      const value = response(data)
      if (!isRecord(value.counts) || !Array.isArray(value.runs)) throw new Error('Memory status response is malformed')
      const counts: MemoryStatusView['counts'] = {}
      for (const [name, count] of Object.entries(value.counts)) {
        if (!['current', 'superseded', 'conflict', 'archived', 'forgotten', 'total', 'conflict_groups'].includes(name) || typeof count !== 'number' || count < 0) throw new Error('Memory response has an invalid count')
        counts[name as keyof MemoryStatusView['counts']] = count
      }
      return { counts, runs: value.runs.map(runRow) }
    },
    items(input: { status: string; query?: string; offset?: number }): Promise<Page<MemoryItem>> { const q = new URLSearchParams({ status: input.status, limit: '100' }); if (input.query) q.set('q', input.query); if (input.offset) q.set('offset', String(input.offset)); return getPage(`${base}/items?${q}`, 'items', itemRow) },
    topics(input: { kind: string; offset?: number }): Promise<Page<{ key: string; cardinality: 'single' | 'multi'; current_count: number }>> { const q = new URLSearchParams({ scope_family: 'agent', kind: input.kind }); if (input.offset) q.set('offset', String(input.offset)); return getPage(`${base}/topics?${q}`, 'topics', (row) => { const value = response(row); return { key: text(value.key, 'topic key'), cardinality: oneOf(value.cardinality, ['single', 'multi'] as const, 'topic cardinality'), current_count: typeof value.current_count === 'number' ? value.current_count : (() => { throw new Error('Memory response has an invalid topic count') })() } }) },
    conflicts(offset = 0): Promise<Page<ConflictGroup>> { return getPage(`${base}/conflicts${offset ? `?offset=${offset}` : ''}`, 'groups', (row) => { const value = response(row); if (!Array.isArray(value.items) || !value.items.length) throw new Error('Memory response has an invalid conflict group'); return { group_id: text(value.group_id, 'conflict group'), items: value.items.map(itemRow) } }) },
    async item(itemId: string, offset = 0, limit?: number): Promise<{ item: MemoryItem; provenance: Provenance[]; versions: Page<MemoryItem> }> {
      const params = new URLSearchParams()
      if (offset) params.set('offset', String(offset))
      if (limit) params.set('limit', String(limit))
      const { data } = await api.get(`${base}/items/${encodeURIComponent(itemId)}${params.size ? `?${params}` : ''}`)
      const value = response(data)
      if (!isRecord(value.item) || !Array.isArray(value.provenance)) throw new Error('Memory detail response is malformed')
      return { item: itemRow(value.item), provenance: value.provenance.map(provenanceRow), versions: page(value, 'versions', itemRow) }
    },
    async create(input: Record<string, unknown>): Promise<string> {
      const { data } = await api.post(`${base}/items`, input)
      const value = response(data)
      if (typeof value.item_id !== 'string' || !value.item_id) throw new Error('Memory create response is missing item_id')
      return value.item_id
    },
    async edit(itemId: string, content: string): Promise<string | undefined> {
      const { data } = await api.put(`${base}/items/${encodeURIComponent(itemId)}`, { content })
      const value = response(data)
      if (value.item_id !== undefined && typeof value.item_id !== 'string') throw new Error('Memory edit response is malformed')
      return value.item_id
    },
    act(itemId: string, action: 'archive' | 'restore' | 'forget'): Promise<unknown> { return api.post(`${base}/items/${encodeURIComponent(itemId)}/${action}`, {}) },
    resolve(groupId: string, winnerId: string): Promise<unknown> { return api.post(`${base}/conflicts/${encodeURIComponent(groupId)}/resolve`, { winner_id: winnerId }) },
  }
}
