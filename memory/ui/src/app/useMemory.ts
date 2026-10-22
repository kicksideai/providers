import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { errorText, isRecord, type ConflictGroup, type MemoryStatusView } from './types'

// State of one memory for its page: status (settings, counts, runs) and open
// conflicts, refreshed when the memory's component changes. `revision` moves on
// every refresh so views holding their own queries reload with it. Writes go
// through `act`, which reports a failure and refreshes after success.
export function useMemory(kbId: Ref<string>) {
  const base = computed(() => `/api/v1/memory/${encodeURIComponent(kbId.value)}`)
  const status = ref<MemoryStatusView | null>(null)
  const conflicts = ref<ConflictGroup[]>([])
  const error = ref('')
  const busy = ref(false)
  const revision = ref(0)

  let generation = 0
  async function refresh() {
    if (!kbId.value) return
    const current = ++generation
    try {
      const [statusRes, conflictRes] = await Promise.all([api.get(`${base.value}/status`), api.get(`${base.value}/conflicts`)])
      if (current !== generation) return
      status.value = statusRes.data as MemoryStatusView
      const data: unknown = conflictRes.data
      conflicts.value = (isRecord(data) && Array.isArray(data.groups) ? data.groups : []) as ConflictGroup[]
      error.value = ''
      revision.value++
    } catch (err) {
      if (current === generation) error.value = errorText(err)
    }
  }

  async function act(fn: () => Promise<unknown>): Promise<boolean> {
    busy.value = true
    error.value = ''
    try {
      await fn()
      await refresh()
      return true
    } catch (err) {
      error.value = errorText(err)
      return false
    } finally {
      busy.value = false
    }
  }

  let unsubscribe: (() => void) | null = null
  // The first load runs on mount and on every return to view; a changed memory
  // id reloads at once.
  watch(kbId, (id, previous) => {
    if (unsubscribe) unsubscribe()
    unsubscribe = null
    if (!id) return
    const off = on(`component.${id}`, () => { void refresh() })
    unsubscribe = typeof off === 'function' ? off : null
    if (previous !== undefined) void refresh()
  }, { immediate: true })
  onUnmounted(() => { if (unsubscribe) unsubscribe() })
  useHostVisibilityRefresh(refresh)

  return { kbId, base, status, conflicts, error, busy, revision, act }
}

export type Memory = ReturnType<typeof useMemory>

const STATUS_SEVERITY: Record<string, string> = { current: 'success', conflict: 'warn', failed: 'danger' }

// PrimeVue Tag severity for an item or run status.
export function severity(status: string): string {
  return STATUS_SEVERITY[status] || 'secondary'
}

export function when(value?: string | null): string {
  if (!value) return ''
  const t = Date.parse(value.includes('T') ? value : value.replace(' ', 'T') + 'Z')
  return Number.isFinite(t) ? new Date(t).toLocaleString() : value
}
