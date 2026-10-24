// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AddPanel from './AddPanel.vue'

vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))

const service = vi.hoisted(() => ({
  listMyUploads: vi.fn(), ingestExistingUploads: vi.fn(),
  reset: vi.fn(), clearItems: vi.fn(), uploadFiles: vi.fn(), ingestText: vi.fn(),
}))
vi.mock('./useIngest', async () => {
  const { ref } = await import('vue')
  return { useIngest: () => ({ ...service, errMsg: ref(''), busy: ref(false), items: ref([]) }) }
})

async function openUploads() {
  const wrapper = mount(AddPanel, { props: { kbId: 'review-kb' }, global: { stubs: { Icon: true } } })
  const tab = wrapper.findAll('[role="tab"]').find(item => item.text() === 'My uploads')!
  await tab.trigger('click')
  await flushPromises()
  return wrapper
}

describe('existing upload selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    service.listMyUploads.mockResolvedValue({ uploads: [
      { uuid: 'upload-a', filename: 'first.txt', size: 16 },
      { uuid: 'upload-b', filename: 'second.txt', size: 32 },
    ] })
    service.ingestExistingUploads.mockResolvedValue(undefined)
  })

  it('submits exactly the selected existing uploads and clears selection after success', async () => {
    const wrapper = await openUploads()
    const choices = wrapper.findAll('button[aria-pressed]')
    expect(choices).toHaveLength(2)
    expect(wrapper.get('.ap-submit').attributes('disabled')).toBeDefined()
    await choices[0].trigger('click')
    await choices[1].trigger('click')
    expect(choices.map(choice => choice.attributes('aria-pressed'))).toEqual(['true', 'true'])
    await wrapper.get('.ap-submit').trigger('click')
    await flushPromises()
    expect(service.ingestExistingUploads).toHaveBeenCalledExactlyOnceWith([
      { uuid: 'upload-a', name: 'first.txt' }, { uuid: 'upload-b', name: 'second.txt' },
    ])
    expect(choices.map(choice => choice.attributes('aria-pressed'))).toEqual(['false', 'false'])
    expect(wrapper.get('.ap-submit').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('allows deselection without submitting an empty or unintended upload list', async () => {
    const wrapper = await openUploads()
    const choice = wrapper.get('button[aria-pressed]')
    await choice.trigger('click')
    expect(wrapper.get('.ap-submit').attributes('disabled')).toBeUndefined()
    await choice.trigger('click')
    expect(choice.attributes('aria-pressed')).toBe('false')
    expect(wrapper.get('.ap-submit').attributes('disabled')).toBeDefined()
    expect(service.ingestExistingUploads).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
