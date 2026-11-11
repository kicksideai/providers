// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ActivityView from './ActivityView.vue'
import type { Memory } from './useMemory'

vi.mock('./useMemory', () => ({ severity: () => 'danger' }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('shows model validation as failed activity with a visible reason', () => {
  const reason = '{"code":"model_output_invalid_extraction_value","retryable":true}'
  const wrapper = mount(ActivityView, {
    props: { memory: { status: ref({ runs: [{ id: 'run', run_type: 'derive', status: 'failed',
      created_at: '2026-01-01T00:00:00Z', last_error: reason, stats: {} }] }) } as unknown as Memory },
    global: { stubs: { Tag: true } },
  })
  expect(wrapper.text()).toContain(reason)
  expect(wrapper.text()).not.toContain('No changes')
  expect(wrapper.findComponent({ name: 'Tag' }).props('value')).toBe('Failed')
  wrapper.unmount()
})

it('shows a rejected source with its content-free reason and byte limits', () => {
  const reason = 'source_too_large: memory source event exceeds 24000 bytes (28000 bytes)'
  const wrapper = mount(ActivityView, {
    props: { memory: { status: ref({ runs: [{ id: 'run', run_type: 'derive', status: 'rejected',
      created_at: '2026-01-01T00:00:00Z', last_error: reason,
      stats: { rejected: 1, rejected_source_too_large: 1, source_bytes: 28000, input_limit_bytes: 24000 } }] }) } as unknown as Memory },
    global: { stubs: { Tag: true } },
  })
  expect(wrapper.text()).toContain('1 rejected')
  expect(wrapper.text()).toContain(reason)
  expect(wrapper.findComponent({ name: 'Tag' }).props('value')).toBe('Rejected')
  wrapper.unmount()
})

it('shows the failure reason without event identifiers or rejected output', () => {
  const output = { items: [{ valid_at: 'confidence_0.99' }] }
  const wrapper = mount(ActivityView, {
    props: { memory: { status: ref({ runs: [{ id: 'run', run_type: 'derive', status: 'failed',
      created_at: '2026-01-01T00:00:00Z', last_error: 'Invalid model output',
      from_event_id: 'start-event', to_event_id: 'end-event', model_output: output }] }) } as unknown as Memory },
    global: { stubs: { Tag: true } },
  })
  expect(wrapper.text()).toContain('Invalid model output')
  expect(wrapper.text()).not.toContain('start-event')
  expect(wrapper.text()).not.toContain('end-event')
  expect(wrapper.text()).not.toContain('confidence_0.99')
  expect(wrapper.text()).not.toContain('Rejected model output')
  expect(wrapper.find('details').exists()).toBe(false)
  wrapper.unmount()
})
