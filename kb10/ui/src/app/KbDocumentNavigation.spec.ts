// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import DocReader from './DocReader.vue'
import KbDocument from './KbDocument.vue'
import IconButton from './shared/IconButton.vue'
import KbConfirm from './shared/KbConfirm.vue'

const proxy = vi.hoisted(() => ({ get: vi.fn(), remove: vi.fn(), navigate: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: proxy.get, delete: proxy.remove },
  on: () => () => {},
  loadByTagName: vi.fn(async () => {}),
  host: { handleError: vi.fn() },
}))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return {
    useProps: () => ref({ config: { kb_id: 'kb' } }),
    useEvents: () => proxy.navigate,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  const nodes = ['first', 'second'].map(id => ({ id, node_type: 'document', metadata: { title: id } }))
  proxy.get.mockResolvedValue({ data: { success: true, nodes, total: nodes.length } })
})

it.each([
  { target: 'second', accepted: true, routes: ['second', ''] },
  { target: 'first', accepted: true, routes: ['second'] },
  { target: 'second', accepted: false, routes: ['second'] },
])('updates the current document route after deleting $target with accepted=$accepted', async ({ target, accepted, routes }) => {
  proxy.remove.mockResolvedValue({ data: { success: accepted } })
  const wrapper = shallowMount(KbDocument, { global: { stubs: { KbShell: false } } })
  try {
    await flushPromises()
    await wrapper.get('.kd-row:nth-child(2) .kd-row-select').trigger('click')
    const button = wrapper.findAllComponents(IconButton).find(item => item.props('label') === 'Delete ' + target)!
    button.vm.$emit('click')
    await flushPromises()
    wrapper.getComponent(KbConfirm).vm.$emit('confirm')
    await flushPromises()
    expect(proxy.remove).toHaveBeenCalledOnce()
    expect(proxy.navigate.mock.calls).toEqual(routes.map(route => ['navigate', route]))
  } finally {
    wrapper.unmount()
  }
})

it('identifies a rejected source and shows its indexing error in the reader', async () => {
  const metadata = {
    title: 'Indexing failed',
    source_title: 'Policy archive.txt',
    status: 'failed',
    error: 'document content too large: source exceeds the configured limit',
  }
  const node = { id: 'failed-source', node_type: 'document', metadata }
  const wrapper = shallowMount(DocReader, { props: { kbId: 'kb', node } })
  try {
    await flushPromises()
    expect(wrapper.get('h2').text()).toBe('Policy archive.txt')
    expect(wrapper.get('[role="status"]').text()).toBe('Indexing failed: ' + metadata.error)
    expect(wrapper.text()).not.toContain('No readable content')
  } finally {
    wrapper.unmount()
  }
})
