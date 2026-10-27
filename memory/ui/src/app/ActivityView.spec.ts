// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ActivityView from './ActivityView.vue'
import type { Memory } from './useMemory'

vi.mock('./useMemory', () => ({ severity: () => 'danger' }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

it('shows rejected candidate counts and content-free reasons in successful activity', () => {
  const wrapper = mount(ActivityView, {
    props: { memory: { status: ref({ runs: [{ id: 'run', run_type: 'consolidate', status: 'succeeded',
      created_at: '2026-01-01T00:00:00Z', stats: { added: 1, rejected: 2,
        rejected_reflection_topic_key: 1, rejected_normalization_kind: 1 } }] }) } as unknown as Memory },
    global: { stubs: { Tag: true } },
  })
  expect(wrapper.text()).toContain('1 new')
  expect(wrapper.text()).toContain('2 rejected')
  expect(wrapper.text()).toContain('reflection: topic key (1)')
  expect(wrapper.text()).toContain('normalization: kind (1)')
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
  expect(wrapper.text()).toContain('source: too large (1)')
  expect(wrapper.text()).toContain(reason)
  expect(wrapper.findComponent({ name: 'Tag' }).props('value')).toBe('rejected')
  wrapper.unmount()
})
