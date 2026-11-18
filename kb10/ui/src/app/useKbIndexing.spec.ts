// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises } from '@vue/test-utils'
import { effectScope, nextTick, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() }, host: { handleError: vi.fn() } }))

const { useKbIndexing } = await import('./useKbIndexing')
const get = vi.mocked(api.get)

beforeEach(() => get.mockReset())

it('keeps an absent count unknown and follows live counts in both forms', async () => {
  get.mockResolvedValue({ data: { meta: {} } } as Awaited<ReturnType<typeof api.get>>)
  const scope = effectScope()
  const { pending, indexingNotice, onMeta } = scope.run(() => useKbIndexing(() => 'kb'))!
  await flushPromises()
  expect(pending.value).toBeNull()
  expect(indexingNotice.value).toBe('')

  onMeta({ event: 'component.meta.changed', component_id: 'kb', meta: { pending_source_count: '3' }, deleted: [] })
  expect(pending.value).toBe(3)
  expect(indexingNotice.value).toBe('Indexing documents — 3 waiting')
  onMeta({ event: 'component.meta.changed', component_id: 'kb', meta: { status: 'syncing' }, deleted: [] })
  expect(pending.value).toBe(3)
  onMeta({ event: 'component.meta.changed', component_id: 'kb', meta: { pending_source_count: 0 }, deleted: [] })
  expect(pending.value).toBe(0)
  expect(indexingNotice.value).toBe('')
  expect(get.mock.calls).toEqual([['/api/v1/components/kb']])
  scope.stop()
})

it('loads an already-pending KB and keeps a newer event ahead of a late snapshot', async () => {
  type Response = Awaited<ReturnType<typeof api.get>>
  const kbId = ref('first')
  let snapshot!: (response: Response) => void
  get.mockResolvedValueOnce({ data: { meta: { pending_source_count: '2' } } } as Response)
  get.mockReturnValueOnce(new Promise(resolve => { snapshot = resolve }))
  const scope = effectScope()
  const { pending, onMeta } = scope.run(() => useKbIndexing(() => kbId.value))!
  await flushPromises()
  expect(pending.value).toBe(2)

  kbId.value = 'second'
  await nextTick()
  expect(pending.value).toBeNull()
  onMeta({ event: 'component.meta.changed', component_id: 'first', meta: { pending_source_count: 5 }, deleted: [] })
  expect(pending.value).toBeNull()
  onMeta({ event: 'component.meta.changed', component_id: 'second', meta: { pending_source_count: 1 }, deleted: [] })
  snapshot({ data: { meta: { pending_source_count: 0 } } } as Response)
  await flushPromises()
  expect(pending.value).toBe(1)
  scope.stop()
})
