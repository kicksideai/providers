// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import PrimeVue from 'primevue/config'
import type { PanelProps } from '../types'

const { props, emitted } = vi.hoisted(() => ({ props: { value: {} as unknown }, emitted: [] as [string, unknown][] }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => props.value,
  useEvents: () => (name: string, detail: unknown) => emitted.push([name, detail]),
}))

import MailgunSettings from './MailgunSettings.vue'

async function render(value: PanelProps) {
  props.value = ref(value)
  emitted.length = 0
  const wrapper = mount(MailgunSettings, { global: { plugins: [PrimeVue] } })
  await nextTick()
  return wrapper
}
const last = (name: string) => [...emitted].reverse().find(([event]) => event === name)?.[1]

describe('Mailgun settings panel', () => {
  it('shows a saved key as set and never receives its value', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com', region: 'eu' }, secrets: { api_key: true } })
    expect(wrapper.text()).toContain('Set')
    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
    expect(last('validity')).toEqual({ valid: true })
  })

  it('reports only changed values and refuses a malformed sending domain', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com', region: 'us' }, secrets: { api_key: true } })
    const domain = wrapper.find('input[placeholder="mg.example.com"]')
    await domain.setValue('not a domain')
    await nextTick()
    expect(last('change')).toEqual({ values: { domain: 'not a domain' } })
    expect(last('validity')).toEqual({ valid: false })
    expect(wrapper.text()).toContain('Enter a domain such as mg.example.com.')

    await domain.setValue('mail.example.org')
    await nextTick()
    expect(last('change')).toEqual({ values: { domain: 'mail.example.org' } })
    expect(last('validity')).toEqual({ valid: true })
  })

  it('asks for a key when a domain is set without one', async () => {
    const wrapper = await render({ values: {}, secrets: { api_key: false } })
    await wrapper.find('input[placeholder="mg.example.com"]').setValue('mg.example.com')
    await nextTick()
    expect(last('validity')).toEqual({ valid: false })
    expect(wrapper.text()).toContain('Enter the API key for this domain.')

    await wrapper.find('input[type="password"]').setValue('key-good')
    await nextTick()
    expect(last('change')).toEqual({ values: { domain: 'mg.example.com', api_key: 'key-good' } })
    expect(last('validity')).toEqual({ valid: true })
  })

  it('shows the server refusal for a value', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com' }, secrets: { api_key: true }, errors: { domain: 'Enter a valid sending domain' } })
    expect(wrapper.text()).toContain('Enter a valid sending domain')
  })
})
