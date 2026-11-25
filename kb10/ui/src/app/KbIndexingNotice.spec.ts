// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AddPanel from './AddPanel.vue'
import IconButton from './shared/IconButton.vue'
import KbNotice from './shared/KbNotice.vue'
import RailHeader from './shared/RailHeader.vue'

const proxy = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  on: vi.fn(),
  view: 'wiki' as 'wiki' | 'graph',
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: proxy.get, post: proxy.post },
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
    ? '/api/v1/kb10/kb/browse?scope=documents&limit=50&offset=0&include_indexing=true'
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
    { count: 0, truncated: true, text: 'Indexing — waiting count unknown' },
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

it('uses the accepted and failed page totals when switching document scopes', async () => {
  proxy.get.mockResolvedValueOnce({ data: { success: true, total: 91, nodes: [] } })
  const wrapper = shallowMount(KbDocument, { global: { stubs: { KbShell: false, KbTabs: false } } })
  await flushPromises()
  expect(wrapper.findComponent(RailHeader).props()).toMatchObject({ title: 'Documents', count: 91 })
  expect(proxy.get).toHaveBeenLastCalledWith(expect.stringContaining('scope=documents&limit=50&offset=0'))

  const send = proxy.on.mock.calls[0][1]
  send({ event: 'component.meta.changed', component_id: 'kb', meta: {} })
  proxy.get.mockResolvedValueOnce({ data: { success: true, total: 2, nodes: [] } })
  await wrapper.findAll('[role="tab"]')[1].trigger('click')
  await flushPromises()
  expect(wrapper.findComponent(RailHeader).props()).toMatchObject({ title: 'Indexing failures', count: 2 })
  expect(proxy.get).toHaveBeenLastCalledWith(expect.stringContaining('scope=failures&limit=50&offset=0'))
  await vi.advanceTimersByTimeAsync(400)
  expect(proxy.get).toHaveBeenCalledTimes(2)

  wrapper.unmount()
})

it('keeps an empty document rail consistent with delayed or pending indexing', async () => {
  const wrapper = shallowMount(KbDocument, { global: { stubs: { KbShell: false, KbNotice: false } } })
  try {
    await flushPromises()
    expect(wrapper.text()).toContain('No documents yet.')
    const send = proxy.on.mock.calls[0][1]
    for (const retrying of [false, true]) {
      proxy.get.mockResolvedValueOnce({ data: { success: true, pending_source: { count: 2, retrying } } })
      send({ event: 'component.meta.changed', component_id: 'kb', meta: {} })
      await vi.advanceTimersByTimeAsync(400)
      await flushPromises()
      expect(wrapper.findAll('[role="status"]').map(notice => notice.text())).toEqual(retrying
        ? ['Indexing — 2 changes waiting', 'Work is delayed and will retry automatically.']
        : ['Indexing — 2 changes waiting'])
      expect(wrapper.text()).toContain('Documents appear here after indexing.')
      expect(wrapper.text()).not.toContain('No documents yet')
    }
  } finally {
    wrapper.unmount()
  }
})

it('retries only the failed indexing attempt offered by the server', async () => {
  const wrapper = shallowMount(KbDocument, { global: { stubs: { KbShell: false, KbTabs: false, KbNotice: false } } })
  try {
    await flushPromises()
    proxy.get.mockResolvedValueOnce({ data: { success: true, total: 2, nodes: [
      { id: 'retryable', retry_source_event_id: 'failed-event', metadata: { title: 'Drive file', status: 'failed' } },
      { id: 'other', metadata: { title: 'Other file', status: 'failed' } },
    ] } })
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await flushPromises()

    const retries = wrapper.findAllComponents(IconButton).filter(button => button.props('label').startsWith('Retry'))
    expect(retries).toHaveLength(1)
    let settle!: (result: unknown) => void
    proxy.post.mockReturnValueOnce(new Promise(resolve => { settle = resolve }))
    retries[0].vm.$emit('click')
    retries[0].vm.$emit('click')
    expect(proxy.post).toHaveBeenCalledExactlyOnceWith('/api/v1/knowledge/kb/retry-source', {
      node_id: 'retryable', failed_event_id: 'failed-event',
    })
    settle({ data: { success: true } })
    await flushPromises()
    expect(wrapper.text()).toContain('Indexing retry requested.')
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
    expect(wrapper.findAllComponents(IconButton).some(button => button.props('label').startsWith('Retry'))).toBe(false)
  } finally {
    wrapper.unmount()
  }
})

it('coalesces spaced ingestion events and panel refreshes for the current document catalog', async () => {
  const wrapper = shallowMount(KbDocument, {
    global: { stubs: { KbShell: false, RailHeader: false, KbDrawer: false } },
  })
  try {
    await flushPromises()
    const add = wrapper.findAllComponents(IconButton).find(button => button.props('label') === 'Add document')!
    add.vm.$emit('click', new MouseEvent('click'))
    await flushPromises()
    const panel = wrapper.findComponent(AddPanel)
    expect(panel.exists()).toBe(true)
    const send = proxy.on.mock.calls[0][1]

    for (let index = 0; index < 50; index++) {
      send({ event: 'component.meta.changed', component_id: 'kb', meta: { document_count: index + 1 } })
      if (index === 10 || index === 30) panel.vm.$emit('changed', false)
      await vi.advanceTimersByTimeAsync(16)
    }
    expect(proxy.get).toHaveBeenCalledTimes(3)
    expect(proxy.get).toHaveBeenLastCalledWith(expect.stringContaining('scope=documents&limit=50&offset=0'))
  } finally {
    wrapper.unmount()
  }
})
