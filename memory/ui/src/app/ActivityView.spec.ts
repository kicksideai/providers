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
