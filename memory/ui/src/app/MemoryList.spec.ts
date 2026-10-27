// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import MemoryList from './MemoryList.vue'
import type { Memory } from './useMemory'
import type { ConflictGroup, MemoryItem, MemoryStatusView } from './types'

const backend = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: backend }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: vi.fn() }))

function memory(): Memory {
  const kbId = ref('first')
  return {
    kbId, base: computed(() => `/api/v1/memory/${kbId.value}`),
    revision: ref(0), error: ref(''), busy: ref(false),
    status: ref<MemoryStatusView | null>(null), conflicts: ref<ConflictGroup[]>([]),
    act: async (fn) => { await fn(); return true },
  }
}
function item(id: string): MemoryItem {
  return { id, content: id, kind: 'fact', scope_family: 'owner', scope_id: 'person', key: id,
    status: 'current', version: 1, source: 'owner', recorded_at: '', valid_at: '' }
}
function page(ids: string[], next?: number) {
  return { data: { items: ids.map(item), next_offset: next } }
}
function render(state = memory()) {
  const wrapper = mount(MemoryList, { props: { memory: state }, global: {
    plugins: [[PrimeVue, { unstyled: true }]],
    stubs: { AgentRuleForm: true, MemoryDetail: true },
  } })
  return { wrapper, state }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe('Memory list pagination', () => {
  beforeEach(() => backend.get.mockReset())

  it('loads only the requested next page and keeps earlier rows', async () => {
    backend.get.mockResolvedValueOnce(page(Array.from({ length: 200 }, (_, i) => `first-${i}`), 200))
      .mockResolvedValueOnce(page(Array.from({ length: 50 }, (_, i) => `last-${i}`)))
    const { wrapper } = render()
    await flushPromises()
    expect(backend.get).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('button.mm-row')).toHaveLength(200)
    const more = wrapper.findAll('button').find((button) => button.text() === 'Load more memories')!
    await more.trigger('click')
    await flushPromises()
    expect(backend.get.mock.calls[1]![0]).toContain('offset=200')
    expect(wrapper.findAll('button.mm-row')).toHaveLength(250)
    expect(wrapper.text()).not.toContain('Load more memories')
    wrapper.unmount()
  })

  it('discards a pending response after the selected memory changes', async () => {
    const stale = deferred<ReturnType<typeof page>>()
    backend.get.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(page(['new-memory']))
    const { wrapper, state } = render()
    state.kbId.value = 'second'
    await flushPromises()
    stale.resolve(page(['stale-memory'], 200))
    await flushPromises()
    expect(wrapper.findAll('button.mm-row').map((row) => row.text())).toEqual([expect.stringContaining('new-memory')])
    expect(wrapper.text()).not.toContain('stale-memory')
    expect(wrapper.text()).not.toContain('Load more memories')
    wrapper.unmount()
  })

  it('resets the cursor and drops an older page after a filter changes', async () => {
    const stale = deferred<ReturnType<typeof page>>()
    backend.get.mockResolvedValueOnce(page(['old-row'], 200)).mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(page(['archived-row']))
    const { wrapper } = render()
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text() === 'Load more memories')!.trigger('click')
    wrapper.findComponent({ name: 'SelectButton' }).vm.$emit('update:modelValue', 'archived')
    await flushPromises()
    expect(backend.get.mock.calls[2]![0]).toContain('status=archived')
    expect(backend.get.mock.calls[2]![0]).not.toContain('offset=')
    stale.resolve(page(['late-old-page']))
    await flushPromises()
    expect(wrapper.text()).toContain('archived-row')
    expect(wrapper.text()).not.toContain('late-old-page')
    expect(wrapper.text()).not.toContain('old-row')
    wrapper.unmount()
  })

  it('keeps the next page retryable after a failed request', async () => {
    backend.get.mockResolvedValueOnce(page(['first'], 200)).mockRejectedValueOnce(new Error('page unavailable'))
      .mockResolvedValueOnce(page(['second']))
    const { wrapper, state } = render()
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text() === 'Load more memories')!.trigger('click')
    await flushPromises()
    expect(state.error.value).toBe('page unavailable')
    expect(wrapper.findAll('button.mm-row')).toHaveLength(1)
    await wrapper.findAll('button').find((button) => button.text() === 'Load more memories')!.trigger('click')
    await flushPromises()
    expect(backend.get.mock.calls[2]![0]).toContain('offset=200')
    expect(wrapper.findAll('button.mm-row')).toHaveLength(2)
    expect(state.error.value).toBe('')
    wrapper.unmount()
  })

  it('does not offer a cursor that cannot advance', async () => {
    backend.get.mockResolvedValueOnce(page(['first'], 0))
    const { wrapper } = render()
    await flushPromises()
    expect(wrapper.text()).not.toContain('Load more memories')
    expect(backend.get).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
