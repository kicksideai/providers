// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import MemoryDetail from './MemoryDetail.vue'

const item = { id: 'lesson-1', kind: 'lesson', scope_family: 'owner', scope_id: 'owner', key: 'teaching_context', cardinality: 'multi', content: 'Frame examples for a chemistry classroom.', status: 'current', version: 1, valid_at: '2026-01-01T00:00:00Z', recorded_at: '2026-01-01T00:00:00Z', source: 'capture' }
const provenance = [
  { host_kind: 'session', host_id: 'session-7', event_id: 'line-1', recorded_at: '2026-01-01T00:00:00Z', line: { role: 'user', author: {kind: 'user', id: 'human:test'}, text: 'I started teaching chemistry at Lincoln Academy.' } },
  { host_kind: 'item', host_id: 'employer-1', event_id: '', recorded_at: '2026-01-01T00:00:00Z', memory: { id: 'employer-1', kind: 'profile_slot', key: 'employer', content: 'The user works at Lincoln Academy.', status: 'current' } },
]
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(() => Promise.resolve({ data: { item, provenance, versions: [item] } })) } }))
vi.mock('./useMemory', () => ({ severity: () => 'info' }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

function render(handlers: Record<string, (id: string) => void> = {}) {
  return mount(MemoryDetail, {
    props: { ...handlers, itemId: 'lesson-1', memory: { memoryId: ref('memory'), base: computed(() => '/api/v1/memory/memory'), status: ref(null), error: ref(''), revision: ref(0), busy: ref(false), act: vi.fn() } },
    global: { stubs: { Tag: true, Textarea: true, ConfirmDialog: true } },
  })
}

it('quotes the conversation line and opens its conversation', async () => {
  const onConversation = vi.fn()
  const wrapper = render({ onConversation })
  await flushPromises()
  expect(wrapper.find('.mm-quote').text()).toBe('I started teaching chemistry at Lincoln Academy.')
  expect(wrapper.text()).toContain('They said')
  const open = wrapper.findAll('button').find((button) => button.text().includes('Open conversation'))
  await open!.trigger('click')
  expect(onConversation).toHaveBeenCalledWith('session-7')
  wrapper.unmount()
})

it('links a lesson to the memory it was learned from', async () => {
  const onOpen = vi.fn()
  const wrapper = render({ onOpen })
  await flushPromises()
  const source = wrapper.find('.mm-source-link')
  expect(source.text()).toContain('The user works at Lincoln Academy.')
  await source.trigger('click')
  expect(onOpen).toHaveBeenCalledWith('employer-1')
  wrapper.unmount()
})

it('shows history only when the memory has earlier versions', async () => {
  const wrapper = render()
  await flushPromises()
  expect(wrapper.find('.mm-timeline').exists()).toBe(false)
  wrapper.unmount()
})

it('labels a parent-authored user-role source as a task', async () => {
  const line = provenance[0]!.line!
  Object.assign(line, { role: 'user', author: { kind: 'agent', id: 'agent:coordinator' } })
  const wrapper = render()
  await flushPromises()
  expect(wrapper.text()).toContain('Task from agent:coordinator')
  Object.assign(line, { author: {kind: 'user', id: 'human:test'} })
  wrapper.unmount()
})

it('labels workflow-authored input by its author', async () => {
  const line = provenance[0]!.line!
  Object.assign(line, { role: 'user', author: { kind: 'system' } })
  const wrapper = render()
  await flushPromises()
  expect(wrapper.text()).toContain('Workflow input')
  Object.assign(line, { author: {kind: 'user', id: 'human:test'} })
  wrapper.unmount()
})

it('labels a tool outcome by its persisted source role', async () => {
  const line = provenance[0]!.line!
  Object.assign(line, { role: 'tool', author: { kind: 'system' } })
  const wrapper = render()
  await flushPromises()
  expect(wrapper.text()).toContain('Tool result')
  Object.assign(line, { role: 'user', author: {kind: 'user', id: 'human:test'} })
  wrapper.unmount()
})

it('labels document provenance without inferring an author from its role', async () => {
  const line = provenance[0]!.line!
  Object.assign(line, { role: 'document', author: { kind: 'unknown' }, text: 'Imported reference text.' })
  const wrapper = render()
  await flushPromises()
  expect(wrapper.text()).toContain('Document')
  expect(wrapper.find('.mm-quote').text()).toBe('Imported reference text.')
  Object.assign(line, { role: 'user', author: { kind: 'user', id: 'human:test' }, text: 'I started teaching chemistry at Lincoln Academy.' })
  wrapper.unmount()
})

it('labels a source written by the running agent', async () => {
  const previous = {scope_family: item.scope_family, scope_id: item.scope_id}
  Object.assign(item, {scope_family: 'agent', scope_id: 'agent:reader'})
  Object.assign(provenance[0]!.line!, {role: 'assistant', author: {kind: 'agent', id: 'agent:reader'}})
  const wrapper = render()
  await flushPromises()
  expect(wrapper.text()).toContain('The agent said')
  Object.assign(item, previous)
  Object.assign(provenance[0]!.line!, {role: 'user', author: {kind: 'user', id: 'human:test'}})
  wrapper.unmount()
})
