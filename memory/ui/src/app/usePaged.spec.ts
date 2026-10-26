// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

type Reply = Promise<{ data: unknown }>
const calls: string[] = []
let respond: (url: string) => Reply = () => Promise.resolve({ data: {} })
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (url: string) => { calls.push(url); return respond(url) } },
  on: () => () => {},
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: () => {} }))

const { usePaged } = await import('./useMemory')

function deferred() {
  let resolve!: (v: { data: unknown }) => void
  const promise: Reply = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

async function flush() {
  for (let i = 0; i < 5; i++) await nextTick()
}

describe('usePaged', () => {
  it('drops a response for filters that are no longer on screen', async () => {
    const slow = deferred()
    const fast = deferred()
    respond = (url) => (url.includes('status=current') ? slow.promise : fast.promise)
    const status = ref('current')
    const list = usePaged<{ id: string }>(() => `/items?status=${status.value}`, 'items', ref(0))
    await flush()
    status.value = 'archived'
    await flush()
    fast.resolve({ data: { items: [{ id: 'archived-1' }] } })
    await flush()
    slow.resolve({ data: { items: [{ id: 'current-1' }] } })
    await flush()
    expect(list.rows.value.map((r) => r.id)).toEqual(['archived-1'])
  })

  it('appends the next page at the returned offset and stops when there is none', async () => {
    respond = (url) => Promise.resolve(url.includes('offset=2')
      ? { data: { items: [{ id: 'c' }] } }
      : { data: { items: [{ id: 'a' }, { id: 'b' }], next_offset: 2 } })
    const list = usePaged<{ id: string }>(() => '/items?limit=2', 'items', ref(0))
    await flush()
    expect(list.next.value).toBe(2)
    list.more()
    await flush()
    expect(calls[calls.length - 1]).toBe('/items?limit=2&offset=2')
    expect(list.rows.value.map((r) => r.id)).toEqual(['a', 'b', 'c'])
    expect(list.next.value).toBeNull()
  })

  it('reloads from the first page when the revision moves', async () => {
    let n = 0
    respond = () => Promise.resolve({ data: { items: [{ id: `v${++n}` }] } })
    const revision = ref(0)
    const list = usePaged<{ id: string }>(() => '/items', 'items', revision)
    await flush()
    revision.value++
    await flush()
    expect(list.rows.value.map((r) => r.id)).toEqual(['v2'])
  })

  it('reports a failed load instead of showing an empty list', async () => {
    respond = () => Promise.reject({ response: { data: { error: 'memory unavailable' } } })
    const list = usePaged<{ id: string }>(() => '/items', 'items', ref(0))
    await flush()
    expect(list.error.value).toBe('memory unavailable')
  })
})
