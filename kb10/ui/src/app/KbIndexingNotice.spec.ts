// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import KbNotice from './shared/KbNotice.vue'

const proxy = vi.hoisted(() => ({
  get: vi.fn(),
  on: vi.fn(),
  view: 'wiki' as 'wiki' | 'graph',
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: proxy.get },
  on: proxy.on,
  host: { handleError: vi.fn() },
  loadByTagName: vi.fn(async () => {}),
}))
vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return {
    useProps: () => ref({ config: { kb_id: 'kb', view: proxy.view } }),
    useEvents: () => vi.fn(),
  }
})

const { default: KbDocument } = await import('./KbDocument.vue')
const { default: KbWiki } = await import('./KbWiki.vue')

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  proxy.get.mockResolvedValue({ data: { success: true, pending_source: { count: 0, truncated: false } } })
  proxy.on.mockReturnValue(vi.fn())
})

afterEach(() => vi.useRealTimers())

it.each(['document', 'wiki', 'graph'] as const)('shows waiting work in the %s view through existing refreshes', async (view) => {
  proxy.view = view === 'graph' ? 'graph' : 'wiki'
  const component = view === 'document' ? KbDocument : KbWiki
  const endpoint = view === 'document'
    ? '/api/v1/kb10/kb/browse?node_type=document&limit=50&offset=0&include_indexing=true'
    : '/api/v1/kb10/kb/graph?include_indexing=true'
  const wrapper = shallowMount(component, { global: { stubs: { KbNotice: false } } })
  await flushPromises()
  expect(wrapper.findAllComponents(KbNotice)).toHaveLength(0)
  expect(proxy.get).toHaveBeenCalledExactlyOnceWith(endpoint)
  expect(proxy.on).toHaveBeenCalledExactlyOnceWith('component.kb', expect.any(Function))
  const send = proxy.on.mock.calls[0][1]

  for (const [index, { count, truncated, text }] of [
    { count: 1, truncated: false, text: 'Indexing — 1 change waiting' },
    { count: 145, truncated: true, text: 'Indexing — 100+ changes waiting' },
    { count: 0, truncated: false, text: '' },
  ].entries()) {
    proxy.get.mockResolvedValueOnce({ data: { success: true, pending_source: { count, truncated } } })
    send({ event: 'component.meta.changed', component_id: 'kb', meta: {} })
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
    const notices = wrapper.findAllComponents(KbNotice)
    expect(notices).toHaveLength(text ? 1 : 0)
    if (text) expect(notices[0].text()).toBe(text)
    expect(proxy.get).toHaveBeenCalledTimes(index + 2)
    expect(proxy.get).toHaveBeenLastCalledWith(endpoint)
  }
  wrapper.unmount()
})
