// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import ConfirmDialog from './ConfirmDialog.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

it('focuses confirmation controls when initially open and handles Escape', async () => {
  const cancel = vi.fn()
  wrapper = mount(ConfirmDialog, {
    props: { open: true, title: 'Erase an attribute', onCancel: cancel },
    attachTo: document.body,
    global: { plugins: [[PrimeVue, { unstyled: true }]], stubs: { transition: false } },
  })
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await flushPromises()
  expect(document.querySelector('[role=alertdialog]')?.contains(document.activeElement)).toBe(true)
  expect(document.activeElement?.textContent).toBe('Cancel')
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))
  await flushPromises()
  expect(cancel).toHaveBeenCalledOnce()
})
