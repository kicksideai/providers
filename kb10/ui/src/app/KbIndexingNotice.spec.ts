// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import KbNotice from './shared/KbNotice.vue'

const proxy = vi.hoisted(() => ({ get: vi.fn(), on: vi.fn(), handleError: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: proxy.get },
  on: proxy.on,
  host: { handleError: proxy.handleError },
  loadByTagName: vi.fn(async () => {}),
}))
vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return { useProps: () => ref({ config: { kb_id: 'kb' } }), useEvents: () => vi.fn() }
})

const { default: KbDocument } = await import('./KbDocument.vue')
const { default: KbWiki } = await import('./KbWiki.vue')

beforeEach(() => {
  vi.clearAllMocks()
  proxy.get.mockResolvedValue({ data: { success: true, meta: {} } })
  proxy.on.mockReturnValue(vi.fn())
})

it.each([['document', KbDocument], ['wiki', KbWiki]] as const)(
  'shows and clears one notice in the %s view from the existing subscription', async (_name, component) => {
    const wrapper = shallowMount(component, { global: { stubs: { KbNotice: false } } })
    await flushPromises()
    expect(wrapper.findAllComponents(KbNotice)).toHaveLength(0)
    expect(proxy.on).toHaveBeenCalledExactlyOnceWith('component.kb', expect.any(Function))
    const send = proxy.on.mock.calls[0][1]

    for (const [pending_source_count, noun] of [[1, 'document'], [2, 'documents']] as const) {
      send({ event: 'component.meta.changed', component_id: 'kb', meta: { pending_source_count } })
      await flushPromises()
      const notices = wrapper.findAllComponents(KbNotice)
      expect(notices).toHaveLength(1)
      expect(notices[0].text()).toBe(`Indexing ${noun} — ${pending_source_count} waiting`)
    }

    send({ event: 'component.meta.changed', component_id: 'kb', meta: { pending_source_count: 0 } })
    await flushPromises()
    expect(wrapper.findAllComponents(KbNotice)).toHaveLength(0)
    wrapper.unmount()
  },
)
