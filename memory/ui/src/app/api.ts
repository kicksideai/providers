// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { api } from '@wippy-fe/proxy'
import { isRecord, pageOf, type ConflictGroup, type MemoryItem, type MemoryStatusView, type Page, type Provenance } from './types'

function path(id: string): string { return `/api/v1/memory/${encodeURIComponent(id)}` }

function response(data: unknown): Record<string, unknown> {
  if (!isRecord(data)) throw new Error('Memory response is malformed')
  return data
}

export function httpStatus(err: unknown): number | undefined {
  if (!isRecord(err) || !isRecord(err.response) || typeof err.response.status !== 'number') return undefined
  return err.response.status
}

async function getPage<T>(url: string, field: string): Promise<Page<T>> {
  const { data } = await api.get(url)
  return pageOf<T>(data, field)
}

export async function listMemories(query = '', offset = 0): Promise<Page<{ id: string; name: string; description?: string; item_count?: number }>> {
  const params = new URLSearchParams({ limit: '20' })
  if (query) params.set('q', query)
  if (offset) params.set('offset', String(offset))
  return getPage(`/api/v1/memory?${params}`, 'items')
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
      return { counts: value.counts as MemoryStatusView['counts'], runs: value.runs as MemoryStatusView['runs'] }
    },
    items(url: string): Promise<Page<MemoryItem>> { return getPage(url, 'items') },
    topics(url: string): Promise<Page<{ key: string; cardinality: 'single' | 'multi'; current_count: number }>> { return getPage(url, 'topics') },
    conflicts(url: string): Promise<Page<ConflictGroup>> { return getPage(url, 'groups') },
    async item(itemId: string, offset = 0, limit?: number): Promise<{ item: MemoryItem; provenance: Provenance[]; versions: Page<MemoryItem> }> {
      const params = new URLSearchParams()
      if (offset) params.set('offset', String(offset))
      if (limit) params.set('limit', String(limit))
      const { data } = await api.get(`${base}/items/${encodeURIComponent(itemId)}${params.size ? `?${params}` : ''}`)
      const value = response(data)
      if (!isRecord(value.item) || !Array.isArray(value.provenance)) throw new Error('Memory detail response is malformed')
      return { item: value.item as unknown as MemoryItem, provenance: value.provenance as Provenance[], versions: pageOf<MemoryItem>(value, 'versions') }
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
