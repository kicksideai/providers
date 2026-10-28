// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import MemoryDetail from './MemoryDetail.vue'

const item = (id: string, version: number) => ({ id, kind: 'fact', scope_family: 'owner', scope_id: 'owner', key: 'topic', cardinality: 'single', content: id, status: version === 200 ? 'current' : 'superseded', version, valid_at: '2026-01-01T00:00:00Z', recorded_at: '2026-01-01T00:00:00Z', source: 'owner' })
const first = Array.from({ length: 100 }, (_, index) => item(`version-${index + 101}`, index + 101))
const older = Array.from({ length: 100 }, (_, index) => item(`version-${index + 1}`, index + 1))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn((url: string) => Promise.resolve({ data: {
  item: item('version-200', 200), provenance: [], versions: url.includes('offset=100') ? older : first,
  next_offset: url.includes('offset=100') ? undefined : 100,
} })) } }))
vi.mock('./useMemory', () => ({ severity: () => 'info' }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('keeps every loaded history page after a revision refresh', async () => {
  const revision = ref(0)
  const wrapper = mount(MemoryDetail, {
    props: { itemId: 'version-200', memory: { memoryId: ref('memory'), base: computed(() => '/api/v1/memory/memory'), status: ref(null), error: ref(''), revision, busy: ref(false), act: vi.fn() } },
    global: { stubs: { Tag: true, Textarea: true, ConfirmDialog: true } },
  })
  await flushPromises()
  const more = wrapper.findAll('button').find((button) => button.text().includes('Show older versions'))
  expect(more).toBeDefined()
  await more!.trigger('click')
  await flushPromises()
  expect(wrapper.findAll('.mm-timeline li')).toHaveLength(200)
  revision.value++
  await flushPromises()
  await flushPromises()
  expect(wrapper.findAll('.mm-timeline li')).toHaveLength(200)
  wrapper.unmount()
})
