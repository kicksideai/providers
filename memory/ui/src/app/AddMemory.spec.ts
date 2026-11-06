// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import PrimeVue from 'primevue/config'
import AddMemory from './AddMemory.vue'
import type { Memory } from './useMemory'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn().mockRejectedValue(new Error('Topics are unavailable')) } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: () => {} }))
vi.mock('./useWidget', () => ({ useWidget: () => ({ ready: ref(true), failed: ref('') }) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('shows topic request errors while keeping manual entry available', async () => {
  const wrapper = mount(AddMemory, {
    props: { memory: { memoryId: ref('memory'), base: ref('/memory/memory'), revision: ref(0), busy: ref(false) } as unknown as Memory },
    global: { plugins: [PrimeVue], stubs: { SelectButton: true, Textarea: true, 'wc-agent-picker': true } },
  })
  await flushPromises()
  expect(wrapper.text()).toContain('Topics are unavailable')
  await wrapper.get('#add_topic').setValue('Response style')
  expect((wrapper.get('#add_topic').element as HTMLInputElement).value).toBe('Response style')
  wrapper.unmount()
})
