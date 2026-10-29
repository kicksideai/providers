// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import ConfirmDialog from './ConfirmDialog.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

it('focuses the dialog close control and handles Escape', async () => {
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
  expect((document.activeElement as HTMLElement)?.getAttribute('aria-label')).toBe('Close')
  document.querySelector('[role=alertdialog]')!.dispatchEvent(new window.KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }))
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

it('traps focus, makes the underlying surface inert and restores the invoking control', async () => {
  const trigger = document.createElement('button')
  trigger.textContent = 'Forget'
  document.body.append(trigger)
  trigger.focus()
  wrapper = mount(ConfirmDialog, {
    props: { open: true, title: 'Forget this memory' }, attachTo: document.body,
    global: { plugins: [[PrimeVue, { unstyled: true }]], stubs: { transition: false } },
  })
  await flushPromises()
  const dialog = wrapper.get('[role=alertdialog]')
  const first = dialog.find('button[aria-label="Close"]').element as HTMLButtonElement
  first.focus()
  await dialog.trigger('keydown', { key: 'Tab' })
  expect(document.activeElement?.textContent).toBe('Cancel')
  await dialog.trigger('keydown', { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(first)
  expect(trigger.inert).toBe(true)
  await wrapper.setProps({ open: false })
  await flushPromises()
  expect(trigger.inert).toBe(false)
  expect(document.activeElement).toBe(trigger)
})
