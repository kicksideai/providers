// @vitest-environment happy-dom
// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MemoryManage from './MemoryManage.vue'

const state = vi.hoisted(() => ({ config: { kb_id: 'memory', route: 'selected' }, emit: vi.fn() }))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return { useProps: () => ref({ config: state.config }), useEvents: () => state.emit }
})
vi.mock('@wippy-fe/proxy', () => ({ api: {}, on: () => () => {} }))
vi.mock('./useMemory', async () => {
  const { ref } = await import('vue')
  const memory = {
    memoryId: ref('memory'), error: ref(''), busy: ref(false), revision: ref(0),
    status: ref({ counts: { current: 3, superseded: 7, archived: 2, conflict_groups: 0 }, runs: [] }), act: vi.fn(),
  }
  return { useMemory: () => memory }
})
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('./AddMemory.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./MemoryRail.vue', () => ({ default: { template: '<button class="clear" @click="$emit(\'filtered\')">clear</button><button class="earlier" @click="$emit(\'status-change\', \'superseded\')">earlier</button>' } }))
vi.mock('./MemoryDetail.vue', () => ({ default: { template: '<div />' } }))

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => wrapper?.unmount())

function mountMemory() {
  state.emit.mockClear()
  wrapper = mount(MemoryManage, { global: { stubs: {
    MemoryRail: { template: '<button class="clear" @click="$emit(\'filtered\')">clear</button><button class="earlier" @click="$emit(\'status-change\', \'superseded\')">earlier</button>' },
    MemoryDetail: true, ActivityView: true, ConflictView: true, AddMemory: true, SideDrawer: true, IconButton: true,
  } } })
  return wrapper
}

it('navigates when filtering clears the selection', async () => {
  const view = mountMemory()
  await view.get('.clear').trigger('click')
  await flushPromises()
  expect(state.emit).toHaveBeenCalledWith('navigate', '')
})

it('shows the server count for the active view', async () => {
  const view = mountMemory()
  await view.get('.earlier').trigger('click')
  expect(view.find('.kx-railhead-title').text()).toContain('7')
})
