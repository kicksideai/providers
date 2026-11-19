// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AddPanel from './AddPanel.vue'

vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))

const service = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), on: vi.fn(), handleError: vi.fn(),
}))
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: service.get, post: service.post }, on: service.on, host: { handleError: service.handleError },
}))

const kbId = 'first-kb'
const tokenPath = `/api/v1/knowledge/${kbId}/upload-token`
const uploadPath = '/api/v1/uploads'
const token = (id: string) => ({ data: { success: true, upload_token: `token-${id}`, upload_id: id } })
const admitted = (uuid: string) => ({ data: { success: true, uuid } })
const upload = (uuid: string, status: string, error?: string) => ({ data: { upload: { uuid, status, error } } })
const retryAccepted = (uuid: string) => ({ data: { success: true, upload_id: uuid } })
const rejected = (status: number, error: string, details?: string) => ({ response: { status, data: { error, details } } })
const missing = rejected(404, 'Upload not found')

async function selectFiles(wrapper: VueWrapper, filenames: string[]) {
  const input = wrapper.get('input[type=file]')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: filenames.map(name => new File(['synthetic fixture'], name, { type: 'text/plain' })),
  })
  await input.trigger('change')
  await flushPromises()
}

describe('failed file retry in AddPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    service.on.mockReturnValue(() => {})
  })

  it('retries only the failed file from its stored bytes and keeps the progress panel open', async () => {
    service.post.mockResolvedValueOnce(token('ready-id')).mockResolvedValueOnce(token('failed-id'))
      .mockResolvedValueOnce(admitted('ready-id')).mockResolvedValueOnce(admitted('failed-id'))
      .mockResolvedValueOnce(retryAccepted('failed-id'))
    service.get.mockImplementation(async (path: string) => {
      if (path === `${uploadPath}/ready-id`) return upload('ready-id', 'completed')
      const retried = service.post.mock.calls.some(([target]) => target.endsWith('/retry'))
      return retried ? upload('failed-id', 'completed') : upload('failed-id', 'error', 'The parser could not read this file.')
    })

    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['ready.txt', 'failed.txt'])
      expect(wrapper.get('.ap-item.error').text()).toContain('failed.txt')
      expect(wrapper.get('.ap-item.error').text()).toContain('The parser could not read this file.')
      expect(wrapper.get('.ap-item.done').text()).toContain('ready.txt')
      expect(wrapper.emitted('changed')).toEqual([[false]])
      expect(wrapper.find('button[aria-label="Retry ready.txt"]').exists()).toBe(false)

      await wrapper.get('button[aria-label="Retry failed.txt"]').trigger('click')
      await flushPromises()
      expect(service.post.mock.calls.map(([path]) => path)).toEqual([
        tokenPath, tokenPath, uploadPath, uploadPath, `${uploadPath}/failed-id/retry`,
      ])
      expect(wrapper.findAll('.ap-item.done')).toHaveLength(2)
      expect(wrapper.text()).not.toContain('The parser could not read this file.')
      expect(wrapper.emitted('changed')).toEqual([[false], [false]])
    } finally {
      wrapper.unmount()
    }
  })

  it('reconciles the pre-issued ID after losing a successful multipart response and skips resending', async () => {
    service.post.mockResolvedValueOnce(token('lost-id')).mockRejectedValueOnce(new Error('Connection interrupted'))
    service.get.mockRejectedValueOnce(missing).mockResolvedValueOnce(upload('lost-id', 'completed'))

    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['lost.txt'])
      expect(wrapper.get('.ap-item.error').text()).toContain('Connection interrupted')
      await wrapper.get('button[aria-label="Retry lost.txt"]').trigger('click')
      await flushPromises()
      expect(wrapper.get('.ap-item.done').text()).toContain('lost.txt')

      expect(service.post.mock.calls.map(([path]) => path)).toEqual([tokenPath, uploadPath])
      expect(service.get.mock.calls.map(([path]) => path)).toEqual(Array(2).fill(`${uploadPath}/lost-id`))
      const form = service.post.mock.calls[1][1] as FormData
      expect(form.get('upload_token')).toBe('token-lost-id')
    } finally {
      wrapper.unmount()
    }
  })

  it('shows the native conflict reason and resubmits a missing file with the same token once', async () => {
    service.post.mockResolvedValueOnce(token('conflict-id'))
      .mockRejectedValueOnce(rejected(409, 'Failed to upload file', 'upload already exists'))
      .mockResolvedValueOnce(admitted('conflict-id'))
    service.get.mockRejectedValueOnce(missing).mockRejectedValueOnce(missing)
      .mockResolvedValueOnce(upload('conflict-id', 'completed'))

    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['conflict.txt'])
      expect(wrapper.get('.ap-item.error').text()).toContain('upload already exists')
      const button = wrapper.get<HTMLButtonElement>('button[aria-label="Retry conflict.txt"]').element
      button.click()
      button.click()
      await flushPromises()

      expect(wrapper.get('.ap-item.done').text()).toContain('conflict.txt')
      expect(service.get.mock.calls.map(([path]) => path)).toEqual(Array(3).fill(`${uploadPath}/conflict-id`))
      expect(service.post.mock.calls.map(([path]) => path)).toEqual([tokenPath, uploadPath, uploadPath])
      for (const [, form] of service.post.mock.calls.slice(1)) {
        expect((form as FormData).get('upload_token')).toBe('token-conflict-id')
        expect(((form as FormData).get('file') as File).name).toBe('conflict.txt')
      }
    } finally {
      wrapper.unmount()
    }
  })

  it('asks for a new selection when the owner rejects the retry token', async () => {
    service.post.mockResolvedValueOnce(token('expired-id')).mockRejectedValueOnce(new Error('Response lost'))
      .mockRejectedValueOnce(rejected(400, 'Failed to upload file', 'Token expired'))
    service.get.mockRejectedValue(missing)

    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['expired.txt'])
      await wrapper.get('button[aria-label="Retry expired.txt"]').trigger('click')
      await flushPromises()
      expect(wrapper.get('.ap-item.error').text()).toContain('Token expired')
      expect(wrapper.get('.ap-item.error').text()).toContain('Select this file again')
      expect(wrapper.find('button[aria-label="Retry expired.txt"]').exists()).toBe(false)
      expect(service.post.mock.calls.map(([path]) => path)).toEqual([tokenPath, uploadPath, uploadPath])
    } finally {
      wrapper.unmount()
    }
  })

  it('does not resume an admission after switching to another knowledge base', async () => {
    service.post.mockResolvedValueOnce(token('old-id')).mockRejectedValueOnce(new Error('Response lost'))
    let rejectLookup!: (error: unknown) => void
    service.get.mockRejectedValueOnce(missing).mockImplementationOnce(() => new Promise((_resolve, reject) => {
      rejectLookup = reject
    }))

    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['old.txt'])
      await wrapper.get('button[aria-label="Retry old.txt"]').trigger('click')
      await wrapper.setProps({ kbId: 'other-kb' })
      rejectLookup(missing)
      await flushPromises()
      expect(wrapper.find('.ap-item').exists()).toBe(false)
      expect(service.post.mock.calls.map(([path]) => path)).toEqual([tokenPath, uploadPath])
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps a KB-wide failure out of individual upload rows', async () => {
    service.post.mockResolvedValueOnce(token('running-id')).mockResolvedValueOnce(admitted('running-id'))
    service.get.mockResolvedValue(upload('running-id', 'processing'))
    const wrapper = mount(AddPanel, { props: { kbId } })
    try {
      await selectFiles(wrapper, ['running.txt'])
      const callback = service.on.mock.calls.find(([topic]) => topic === `component.${kbId}`)?.[1]
      expect(callback).toBeTypeOf('function')
      callback({ event: 'component.meta.changed', component_id: kbId, meta: { status: 'error', last_error: 'Another source failed' } })
      await flushPromises()
      expect(wrapper.get('.ap-msg').text()).toContain('Another source failed')
      expect(wrapper.get('.ap-item.processing').text()).toContain('running.txt')
      expect(wrapper.find('.ap-item.error').exists()).toBe(false)
      expect(wrapper.find('.ap-item-retry').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  it('refreshes the catalog once at settlement of a 50-file batch with bounded follow-ups', async () => {
    let next = 0
    service.post.mockImplementation(async (path: string, form?: FormData) => {
      if (path === tokenPath) return token(`batch-${++next}`)
      return admitted(String(form?.get('upload_token')).replace('token-', ''))
    })
    service.get.mockImplementation(async (path: string) => upload(path.slice(uploadPath.length + 1), 'completed'))
    vi.useFakeTimers()
    const changed = vi.fn()
    const wrapper = mount(AddPanel, { props: { kbId, onChanged: changed } })
    try {
      await selectFiles(wrapper, Array.from({ length: 50 }, (_, i) => `entry-${i + 1}.txt`))
      expect(wrapper.findAll('.ap-item.done')).toHaveLength(50)
      expect(changed).toHaveBeenCalledExactlyOnceWith(false)
      expect(service.post.mock.calls.filter(([path]) => path === uploadPath)).toHaveLength(50)
      await vi.advanceTimersByTimeAsync(20000)
      expect(changed.mock.calls).toEqual([[false], [false], [false], [false]])
    } finally {
      wrapper.unmount()
      vi.useRealTimers()
    }
  })
})
