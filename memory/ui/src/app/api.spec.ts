// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'

const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post: vi.fn(), put: vi.fn() } }))
const { memoryApi } = await import('./api')

const plan = {
  id: 'plan-1', kind: 'plan', scope_family: 'owner', scope_id: 'person-1', key: 'trip', cardinality: 'single',
  content: 'Plan the trip.', value: { details: 'Book a train and hotel.', next_step: 'Compare routes.', status: 'open' },
  status: 'current', version: 1, valid_at: '2026-01-01T00:00:00Z', recorded_at: '2026-01-01T00:00:00Z', source: 'capture',
}

describe('memory API responses', () => {
  it('rejects an item row with an unknown kind', async () => {
    get.mockResolvedValueOnce({ data: { item: { id: 'item', kind: 'unknown', status: 'current', source: 'owner' }, provenance: [], versions: [] } })
    await expect(memoryApi('memory').item('item')).rejects.toThrow('invalid item')
  })

  it('rejects a status response with a malformed run', async () => {
    get.mockResolvedValueOnce({ data: { counts: {}, runs: [{ id: 'run', run_type: 'derive', status: 'unknown', created_at: 'now' }] } })
    await expect(memoryApi('memory').status()).rejects.toThrow('invalid run')
  })

  it('decodes typed values and document provenance without assigning authorship from its role', async () => {
    get.mockResolvedValueOnce({ data: {
      item: plan,
      provenance: [{ host_kind: 'content', host_id: 'document-1', event_id: 'line-1', line: {
        role: 'document', author: { kind: 'unknown' }, text: 'Imported reference text.',
      } }],
      versions: [plan],
    } })

    await expect(memoryApi('memory').item('plan-1')).resolves.toMatchObject({
      item: { value: plan.value },
      provenance: [{ line: { role: 'document', author: { kind: 'unknown' } } }],
    })
  })

  it('sends claim value separately from display text when editing a memory', async () => {
    const put = vi.mocked((await import('@wippy-fe/proxy')).api.put)
    put.mockResolvedValueOnce({ data: { item_id: 'plan-2' } })

    await expect(memoryApi('memory').edit('plan-1', { content: 'Updated trip plan.', value: { details: 'Reserve a room.', next_step: 'Confirm dates.', status: 'done' } })).resolves.toBe('plan-2')
    expect(put).toHaveBeenCalledWith('/api/v1/memory/memory/items/plan-1', {
      content: 'Updated trip plan.', value: { details: 'Reserve a room.', next_step: 'Confirm dates.', status: 'done' },
    })
  })
})
