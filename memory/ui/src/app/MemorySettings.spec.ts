// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import MemorySettings from './MemorySettings.vue'

const state = vi.hoisted(() => ({ config: undefined as unknown, emit: vi.fn(), resolve: undefined as unknown }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ref({ config: state.config }),
  useEvents: () => state.emit,
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: vi.fn((url: string) => {
    if (url.startsWith('/api/v1/memory')) return Promise.resolve({ data: { items: [] } })
    return state.resolve instanceof Error ? Promise.reject(state.resolve) : Promise.resolve({ data: state.resolve })
  }) },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

afterEach(() => vi.clearAllMocks())

it.each([
  [{ response: { status: 403, data: { error: 'forbidden' } } }, 'forbidden'],
  [{ response: { status: 404, data: { error: 'missing' } } }, 'missing'],
  [{ kb_type: 'content', name: 'Other knowledge' }, 'Selected resource is not a memory'],
])('warns when the selected memory is unavailable (%s)', async (resolve, rawError) => {
  state.config = { memory_id: 'selected' }
  state.resolve = resolve instanceof Error ? resolve : Object.assign(new Error(rawError), resolve)
  if (!(resolve instanceof Error) && 'kb_type' in resolve) state.resolve = resolve
  const wrapper = mount(MemorySettings)
  await flushPromises()
  expect(wrapper.find('.kx-notice.warn').text()).toContain('not available')
  expect(wrapper.text()).not.toContain(rawError)
  wrapper.unmount()
})
