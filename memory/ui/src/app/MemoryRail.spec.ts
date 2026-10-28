// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import MemoryRail from './MemoryRail.vue'
import type { Memory } from './useMemory'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('./useMemory', () => ({
  usePaged: () => ({ rows: ref([]), loading: ref(false), error: ref(''), next: ref(null) }),
}))

afterEach(() => { vi.useRealTimers() })

it('cancels the pending search debounce when the rail unmounts', async () => {
  vi.useFakeTimers()
  const wrapper = mount(MemoryRail, {
    props: { memory: { memoryId: ref('memory'), base: ref('/memory/memory'), revision: ref(0) } as unknown as Memory, selectedId: '' },
    global: { stubs: { SelectButton: true } },
  })
  await wrapper.get('input').setValue('query')
  await flushPromises()
  expect(vi.getTimerCount()).toBe(1)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  vi.advanceTimersByTime(250)
  expect(wrapper.emitted('filtered')).toBeUndefined()
})
