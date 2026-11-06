// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AccessibleOverlay from './AccessibleOverlay.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => { wrapper?.unmount(); document.body.innerHTML = '' })

it('makes background surfaces inert across a shadow boundary and restores focus on removal', async () => {
  const outside = document.createElement('button')
  const host = document.createElement('div')
  document.body.append(outside, host)
  const shadow = host.attachShadow({ mode: 'open' })
  const trigger = document.createElement('button')
  const mountPoint = document.createElement('div')
  shadow.append(trigger, mountPoint)
  trigger.focus()
  wrapper = mount(AccessibleOverlay, {
    props: { open: true, kind: 'dialog' },
    slots: { default: '<div role="dialog"><button>Continue</button><button>Cancel</button></div>' },
    attachTo: mountPoint,
    global: { stubs: { transition: false } },
  })
  await flushPromises()
  expect(shadow.activeElement?.textContent).toBe('Continue')
  expect(trigger.inert).toBe(true)
  expect(outside.inert).toBe(true)
  await wrapper.get('button').trigger('keydown', { key: 'Tab', shiftKey: true })
  expect(shadow.activeElement?.textContent).toBe('Cancel')
  wrapper.unmount()
  wrapper = undefined
  expect(trigger.inert).toBe(false)
  expect(outside.inert).toBe(false)
  expect(shadow.activeElement).toBe(trigger)
})
