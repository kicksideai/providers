// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

type Reply = Promise<{ data: unknown }>
const calls: string[] = []
let respond: (url: string) => Reply = () => Promise.resolve({ data: {} })
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (url: string) => { calls.push(url); return respond(url) } },
  on: () => () => {},
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: () => {} }))

const { usePaged, useMemory } = await import('./useMemory')
const { useDebounced } = await import('./usePaged')

function deferred() {
  let resolve!: (v: { data: unknown }) => void
  const promise: Reply = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

async function flush() {
  for (let i = 0; i < 5; i++) await nextTick()
}

describe('usePaged', () => {
  it('cancels a pending debounce when its owner stops', async () => {
    vi.useFakeTimers()
    const source = ref('')
    const scope = effectScope()
    const value = scope.run(() => useDebounced(source, 250))!
    source.value = 'query'
    await flush()
    expect(vi.getTimerCount()).toBe(1)
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })
  it('drops a response for filters that are no longer on screen', async () => {
    const slow = deferred()
    const fast = deferred()
    const status = ref('current')
    const list = usePaged<{ id: string }>(() => status.value, () => status.value === 'current' ? slow.promise.then((reply) => ({ rows: (reply.data as { items: { id: string }[] }).items, next: null })) : fast.promise.then((reply) => ({ rows: (reply.data as { items: { id: string }[] }).items, next: null })), ref(0))
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
    const offsets: number[] = []
    const list = usePaged<{ id: string }>(() => 'items', async (offset) => { offsets.push(offset); return offset ? { rows: [{ id: 'c' }], next: null } : { rows: [{ id: 'a' }, { id: 'b' }], next: 2 } }, ref(0))
    await flush()
    expect(list.next.value).toBe(2)
    list.more()
    await flush()
    expect(offsets).toEqual([0, 2])
    expect(list.rows.value.map((r) => r.id)).toEqual(['a', 'b', 'c'])
    expect(list.next.value).toBeNull()
  })

  it('reloads from the first page when the revision moves', async () => {
    let n = 0
    const revision = ref(0)
    const list = usePaged<{ id: string }>(() => 'items', async () => ({ rows: [{ id: `row-${++n}` }], next: null }), revision)
    await flush()
    revision.value++
    await flush()
    expect(list.rows.value.map((r) => r.id)).toEqual(['row-2'])
  })

  it('reports a failed load instead of showing an empty list', async () => {
    const list = usePaged<{ id: string }>(() => 'items', async () => { throw { response: { data: { error: 'memory unavailable' } } } }, ref(0))
    await flush()
    expect(list.error.value).toBe('memory unavailable')
  })
})


describe('useMemory', () => {
  it('reports a refresh failure to the action caller', async () => {
    respond = () => Promise.reject(new Error('status unavailable'))
    const memory = useMemory(ref('selected'))
    await flush()
    expect(await memory.act(() => Promise.resolve())).toBe(false)
    expect(memory.error.value).toBe('status unavailable')
  })

  it('clears a refresh error after a successful load', async () => {
    respond = () => Promise.reject(new Error('status unavailable'))
    const memory = useMemory(ref('selected'))
    await flush()
    respond = () => Promise.resolve({ data: { counts: {}, runs: [] } })
    expect(await memory.act(() => Promise.resolve())).toBe(true)
    expect(memory.error.value).toBe('')
  })
})
