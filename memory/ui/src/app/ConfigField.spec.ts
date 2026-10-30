// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigField from './ConfigField.vue'

vi.mock('./ModelPicker.vue', () => ({ default: { template: '<div />' } }))
vi.mock('primevue/inputnumber', () => ({
  default: { emits: ['update:modelValue'], template: '<button data-number @click="$emit(\'update:modelValue\', null)" />' },
}))

it('clears a numeric configuration value to its schema default', async () => {
  const update = vi.fn()
  const wrapper = mount(ConfigField, {
    props: { name: 'limit', field: { type: 'integer' }, value: 12, onUpdate: update },
    global: { stubs: { InputText: true, Textarea: true, ToggleSwitch: true } },
  })
  await wrapper.get('[data-number]').trigger('click')
  expect(update).toHaveBeenCalledWith(undefined)
  wrapper.unmount()
})
