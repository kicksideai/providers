// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MemoryCreate from './MemoryCreate.vue'

const context = vi.hoisted(() => ({ raw: undefined as unknown, emit: vi.fn() }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => ref({ config: context.raw }), useEvents: () => context.emit }))
vi.mock('./ConfigFields.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./ModelPicker.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('shows a configuration error for missing or malformed create schemas', () => {
  for (const schema of [undefined, null, [], {}, { properties: [] }, { type: 'object', properties: { model: null } }]) {
    context.raw = { config: { config_schema: schema } }
    const wrapper = mount(MemoryCreate, { global: { stubs: { ModelPicker: true, ConfigField: true } } })
    expect(wrapper.find('.kx-notice.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('schema')
    wrapper.unmount()
  }
})

it('does not emit an empty configuration for an invalid create schema', () => {
  context.emit.mockClear()
  context.raw = { config: { config_schema: {} } }
  const wrapper = mount(MemoryCreate, { global: { stubs: { ModelPicker: true, ConfigField: true } } })
  expect(wrapper.find('.kx-notice.error').exists()).toBe(true)
  expect(context.emit).not.toHaveBeenCalled()
  wrapper.unmount()
})

it('accepts the supplied object schema', () => {
  context.raw = { config: { config_schema: { type: 'object', properties: { extraction_model: { type: 'string', section: 'models' } } } } }
  const wrapper = mount(MemoryCreate, { global: { stubs: { ModelPicker: true, ConfigField: true } } })
  expect(wrapper.find('.kx-notice.error').exists()).toBe(false)
  wrapper.unmount()
})
