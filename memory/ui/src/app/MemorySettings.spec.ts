// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import MemorySettings from './MemorySettings.vue'

const state = vi.hoisted(() => ({ config: undefined as unknown, emit: vi.fn(), resolve: undefined as unknown, memories: [] as { id: string; name: string }[] }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ref({ config: state.config }),
  useEvents: () => state.emit,
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: vi.fn((url: string) => {
    if (url.startsWith('/api/v1/memory')) return Promise.resolve({ data: { items: state.memories } })
    return state.resolve instanceof Error ? Promise.reject(state.resolve) : Promise.resolve({ data: state.resolve })
  }) },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

afterEach(() => vi.clearAllMocks())

async function choices(wrapper: ReturnType<typeof mount>) {
  await flushPromises()
  return wrapper.findAll('[data-memory-choice]')
}

it.each([
  [{ response: { status: 403, data: { error: 'forbidden' } } }, 'forbidden'],
  [{ response: { status: 404, data: { error: 'missing' } } }, 'missing'],
  [{ kb_type: 'content', name: 'Other knowledge' }, 'Selected resource is not a memory'],
])('warns when the selected memory is unavailable (%s)', async (resolve, rawError) => {
  state.config = { memory_id: 'selected' }
  state.resolve = resolve instanceof Error ? resolve : Object.assign(new Error(rawError), resolve)
  if (!(resolve instanceof Error) && 'kb_type' in resolve) state.resolve = resolve
  const wrapper = mount(MemorySettings, { attachTo: document.body })
  await flushPromises()
  expect(wrapper.find('.kx-notice.warn').text()).toContain('not available')
  expect(wrapper.text()).not.toContain(rawError)
  wrapper.unmount()
})

it('preserves isolated learning when selecting a memory and publishes toggle changes', async () => {
  state.config = { memory_id: 'selected', learn_in_isolation: true }
  state.resolve = { kb_type: 'memory', name: 'Selected memory' }
  const wrapper = mount(MemorySettings)
  await flushPromises()
  const checkbox = wrapper.get('input[type="checkbox"]')
  expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  await checkbox.setValue(false)
  expect(state.emit).toHaveBeenLastCalledWith('config-changed', { context: { memory_id: 'selected', learn_in_isolation: false } })
  wrapper.unmount()
})

it('keeps a visible roving tab stop when the selected memory is absent and arrow keys replace it', async () => {
  state.config = { memory_id: 'unavailable' }
  state.resolve = Object.assign(new Error('missing'), { response: { status: 404, data: { error: 'missing' } } })
  state.memories = ['first', 'second'].map((id) => ({ id, name: `Memory ${id}` }))
  const wrapper = mount(MemorySettings, { attachTo: document.body })
  const buttons = await choices(wrapper)
  expect(buttons.map((button) => button.attributes('tabindex'))).toEqual(['0', '-1'])
  await buttons[0]!.trigger('keydown', { key: 'ArrowDown' })
  expect(state.emit).toHaveBeenLastCalledWith('config-changed', { context: { memory_id: 'second', learn_in_isolation: false } })
  expect(document.activeElement).toBe(buttons[1]!.element)
  wrapper.unmount()
  state.memories = []
})
