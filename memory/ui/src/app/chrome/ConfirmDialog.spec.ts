// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import ConfirmDialog from './ConfirmDialog.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

it('focuses the memory cancel control and handles Escape', async () => {
  const cancel = vi.fn()
  wrapper = mount(ConfirmDialog, {
    props: { open: true, title: 'Forget this memory', onCancel: cancel },
    attachTo: document.body,
    global: { plugins: [[PrimeVue, { unstyled: true }]], stubs: { transition: false } },
  })
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await flushPromises()
  expect(wrapper.find('.p-dialog').exists()).toBe(false)
  expect(wrapper.html()).not.toContain('data-pc-name')
  expect(document.querySelector('[role=alertdialog]')?.getAttribute('aria-label')).toBe('Forget this memory')
  expect(document.querySelector('[role=alertdialog]')?.contains(document.activeElement)).toBe(true)
  expect(document.activeElement?.textContent).toBe('Cancel')
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))
  await flushPromises()
  expect(cancel).toHaveBeenCalledOnce()
})

it('blocks mask and Escape dismissal while the memory action is busy', async () => {
  const cancel = vi.fn()
  wrapper = mount(ConfirmDialog, { props: { open: true, busy: true, title: 'Forget this memory', onCancel: cancel }, attachTo: document.body, global: { plugins: [[PrimeVue, { unstyled: true }]], stubs: { transition: false } } })
  await flushPromises()
  await wrapper.get('.kx-modal-mask').trigger('click')
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  expect(cancel).not.toHaveBeenCalled()
})
