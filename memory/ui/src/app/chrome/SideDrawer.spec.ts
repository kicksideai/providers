// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SideDrawer from './SideDrawer.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

it('traps focus, restores the invoker and handles Escape from the drawer', async () => {
  const trigger = document.createElement('button')
  trigger.textContent = 'Add agent memory'
  document.body.append(trigger)
  trigger.focus()
  const close = vi.fn()
  wrapper = mount(SideDrawer, {
    props: { open: true, title: 'Add agent memory', icon: 'tabler:plus', onClose: close },
    slots: { default: '<button type="button">Save</button>' },
    attachTo: document.body,
    global: { stubs: { transition: false } },
  })
  await flushPromises()
  const drawer = wrapper.get('[role=dialog]')
  const closeButton = drawer.get('button[aria-label="Close"]').element as HTMLButtonElement
  expect(document.activeElement).toBe(closeButton)
  await drawer.trigger('keydown', { key: 'Tab' })
  expect(document.activeElement?.textContent).toBe('Save')
  await drawer.trigger('keydown', { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(closeButton)
  drawer.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  expect(close).toHaveBeenCalledOnce()
  expect(trigger.inert).toBe(true)
  await wrapper.setProps({ open: false })
  await flushPromises()
  expect(trigger.inert).toBe(false)
  expect(document.activeElement).toBe(trigger)
})
