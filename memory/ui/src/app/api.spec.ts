// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'

const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post: vi.fn(), put: vi.fn() } }))
const { memoryApi } = await import('./api')

describe('memory API responses', () => {
  it('rejects an item row with an unknown kind', async () => {
    get.mockResolvedValueOnce({ data: { item: { id: 'item', kind: 'unknown', status: 'current', source: 'owner' }, provenance: [], versions: [] } })
    await expect(memoryApi('memory').item('item')).rejects.toThrow('invalid item')
  })

  it('rejects a status response with a malformed run', async () => {
    get.mockResolvedValueOnce({ data: { counts: {}, runs: [{ id: 'run', run_type: 'derive', status: 'unknown', created_at: 'now' }] } })
    await expect(memoryApi('memory').status()).rejects.toThrow('invalid run')
  })
})
