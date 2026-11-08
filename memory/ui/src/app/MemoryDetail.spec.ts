// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import MemoryDetail from './MemoryDetail.vue'

vi.mock('primevue/textarea', () => ({ default: { props: ['modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' } }))

const item = (id: string, version: number) => ({ id, kind: 'fact', scope_family: 'owner', scope_id: 'owner', key: 'topic', cardinality: 'single', content: id, status: version === 200 ? 'current' : 'superseded', version, valid_at: '2026-01-01T00:00:00Z', recorded_at: '2026-01-01T00:00:00Z', source: 'owner' })
const first = Array.from({ length: 100 }, (_, index) => item(`version-${index + 101}`, index + 101))
const older = Array.from({ length: 100 }, (_, index) => item(`version-${index + 1}`, index + 1))
const state = vi.hoisted(() => ({ put: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn((url: string) => Promise.resolve({ data: {
  item: item('version-200', 200), provenance: [], versions: url.includes('offset=100') ? older : first,
  next_offset: url.includes('offset=100') ? undefined : 100,
} })), put: state.put } }))
vi.mock('./useMemory', () => ({ severity: () => 'info' }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('keeps every loaded history page after a revision refresh', async () => {
  const revision = ref(0)
  const wrapper = mount(MemoryDetail, {
    props: { itemId: 'version-200', memory: { memoryId: ref('memory'), base: computed(() => '/api/v1/memory/memory'), status: ref(null), error: ref(''), revision, busy: ref(false), act: vi.fn() } },
    global: { stubs: { Tag: true, Textarea: true, ConfirmDialog: true } },
  })
  await flushPromises()
  const more = wrapper.findAll('button').find((button) => button.text().includes('Show older versions'))
  expect(more).toBeDefined()
  await more!.trigger('click')
  await flushPromises()
  expect(wrapper.findAll('.mm-timeline li')).toHaveLength(200)
  revision.value++
  await flushPromises()
  await flushPromises()
  expect(wrapper.findAll('.mm-timeline li')).toHaveLength(200)
  wrapper.unmount()
})

it('renders and changes a plan claim value separately from its display text', async () => {
  const plan = { ...item('plan-1', 200), kind: 'plan', content: 'Prepare the trip.', value: { details: 'Book travel.', next_step: 'Compare routes.', status: 'open' } }
  vi.mocked((await import('@wippy-fe/proxy')).api.get).mockResolvedValueOnce({ data: { item: plan, provenance: [], versions: [plan] } })
  state.put.mockResolvedValueOnce({ data: { item_id: 'plan-2' } })
  const onReplaced = vi.fn()
  const wrapper = mount(MemoryDetail, {
    props: { itemId: 'plan-1', onReplaced, memory: { memoryId: ref('memory'), base: computed(() => '/api/v1/memory/memory'), status: ref(null), error: ref(''), revision: ref(0), busy: ref(false), act: async (fn: () => Promise<unknown>) => { await fn(); return true } } },
    global: { stubs: { Tag: true, ConfirmDialog: true } },
  })
  await flushPromises()
  expect(wrapper.find('#mm-details').text()).toBe('Details')
  expect(wrapper.text()).not.toContain('Claim value')
  expect(wrapper.find('pre').exists()).toBe(false)
  expect(wrapper.text()).toContain('Book travel.')
  expect(wrapper.text()).toContain('Compare routes.')
  expect(wrapper.text()).toContain('open')
  await wrapper.findAll('button').find((button) => button.text().includes('Edit'))!.trigger('click')
  expect(wrapper.find('label[for=memory_value]').text()).toBe('Details')
  expect(wrapper.find('#memory_value').attributes('aria-label')).toBe('Details')
  const fields = wrapper.findAll('textarea')
  await fields[0]!.setValue('Updated trip plan.')
  await fields[1]!.setValue('{"details":"Reserve a room.","next_step":"Confirm dates.","status":"done"}')
  await wrapper.findAll('button').find((button) => button.text().includes('Save'))!.trigger('click')
  expect(state.put).toHaveBeenCalledWith('/api/v1/memory/memory/items/plan-1', {
    content: 'Updated trip plan.', value: { details: 'Reserve a room.', next_step: 'Confirm dates.', status: 'done' },
  })
  expect(onReplaced).toHaveBeenCalledWith('plan-2')
  wrapper.unmount()
})

it.each([
  ['green tea', ['Topic', 'green tea']],
  [false, ['Topic', 'No']],
  [0, ['Topic', '0']],
  [null, ['Topic', 'Not set']],
  [{ preferred_drink: 'green tea', delivery: { window_days: 17, enabled: true }, notes: ['Ring the bell', 'Leave by the door'] },
    ['Preferred drink', 'green tea', 'Delivery · Window days', '17', 'Delivery · Enabled', 'Yes', 'Notes · 1', 'Ring the bell', 'Notes · 2', 'Leave by the door']],
  [[], ['Topic', 'None']],
  [{}, ['Topic', 'None']],
])('renders %j as readable details without a JSON fallback', async (value, expected) => {
  const fact = { ...item('fact-1', 200), content: 'Delivery preferences.', value }
  vi.mocked((await import('@wippy-fe/proxy')).api.get).mockResolvedValueOnce({ data: { item: fact, provenance: [], versions: [fact] } })
  const wrapper = mount(MemoryDetail, {
    props: { itemId: fact.id, memory: { memoryId: ref('memory'), base: computed(() => '/api/v1/memory/memory'), status: ref(null), error: ref(''), revision: ref(0), busy: ref(false), act: vi.fn() } },
    global: { stubs: { Tag: true, ConfirmDialog: true } },
  })
  await flushPromises()
  const details = wrapper.find('section[aria-labelledby=mm-details]')
  expect(details.exists()).toBe(true)
  expect(details.findAll('dt, dd').map((field) => field.text())).toEqual(expected)
  expect(details.find('pre').exists()).toBe(false)
  expect(details.text()).not.toContain('[object Object]')
  expect(details.text()).not.toContain('preferred_drink')
  expect(wrapper.find('.mm-title').text()).toBe('Delivery preferences.')
  wrapper.unmount()
})
