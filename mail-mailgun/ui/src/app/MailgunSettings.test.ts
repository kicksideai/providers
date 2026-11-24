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

  it('lets a key replacement be cancelled, dropping the typed key from the changes', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com' }, secrets: { api_key: true } })
    await wrapper.findAll('button').find(node => node.text() === 'Replace')!.trigger('click')
    await wrapper.find('input[type="password"]').setValue('key-new')
    await nextTick()
    expect(last('change')).toEqual({ values: { api_key: 'key-new' } })
    await wrapper.findAll('button').find(node => node.text() === 'Cancel')!.trigger('click')
    await nextTick()
    expect(last('change')).toEqual({ values: {} })
    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
  })

  it('starts from the block\'s draft when the block holds one', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com', region: 'us' }, secrets: { api_key: true }, draft: { domain: 'mg.example.net', api_key: 'key-kept' } })
    expect((wrapper.find('input[aria-label="Sending domain"]').element as HTMLInputElement).value).toBe('mg.example.net')
    expect((wrapper.find('input[type="password"]').element as HTMLInputElement).value).toBe('key-kept')
  })

  it('shows the server refusal of a key beside the key the block kept in its draft', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com' }, secrets: { api_key: true }, draft: { api_key: 'key with space' },
      errors: { api_key: 'Enter a Mailgun API key without spaces or line breaks.' } })
    expect((wrapper.find('input[type="password"]').element as HTMLInputElement).value).toBe('key with space')
    expect(wrapper.find('.mg-error').text()).toBe('Enter a Mailgun API key without spaces or line breaks.')
  })

  it('shows the server refusal for a value', async () => {
    const wrapper = await render({ values: { domain: 'mg.example.com' }, secrets: { api_key: true }, errors: { domain: 'Enter a valid sending domain' } })
    expect(wrapper.text()).toContain('Enter a valid sending domain')
  })
})
