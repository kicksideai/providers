// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { errorText, pageOf, type MemoryStatusView } from './types'

export function useMemory(memoryId: Ref<string>) {
  const base = computed(() => `/api/v1/memory/${encodeURIComponent(memoryId.value)}`)
  const status = ref<MemoryStatusView | null>(null)
  const error = ref('')
  const busy = ref(false)
  const revision = ref(0)

  let generation = 0
  async function refresh() {
    if (!memoryId.value) return
    const current = ++generation
    try {
      const { data } = await api.get(`${base.value}/status`)
      if (current !== generation) return
      status.value = data as MemoryStatusView
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
  watch(memoryId, (id) => {
    if (unsubscribe) unsubscribe()
    unsubscribe = null
    status.value = null
    if (!id) return
    const off = on(`component.${id}`, () => { void refresh() })
    unsubscribe = typeof off === 'function' ? off : null
    void refresh()
  }, { immediate: true })
  onUnmounted(() => { if (unsubscribe) unsubscribe() })
  useHostVisibilityRefresh(refresh)

  return { memoryId, base, status, error, busy, revision, act }
}

export type Memory = ReturnType<typeof useMemory>

export function usePaged<T>(url: () => string | null, field: string, revision: Ref<number>) {
  const rows = ref<T[]>([]) as Ref<T[]>
  const next = ref<number | null>(null)
  const loading = ref(false)
  const error = ref('')

  let generation = 0
  async function fetchPage(offset: number) {
    const target = url()
    const current = ++generation
    if (!target) {
      rows.value = []
      next.value = null
      loading.value = false
      return
    }
    loading.value = true
    try {
      const sep = target.includes('?') ? '&' : '?'
      const { data } = await api.get(offset ? `${target}${sep}offset=${offset}` : target)
      if (current !== generation) return
      const page = pageOf<T>(data, field)
      rows.value = offset ? [...rows.value, ...page.rows] : page.rows
      next.value = page.next
      error.value = ''
    } catch (err) {
      if (current === generation) error.value = errorText(err)
    } finally {
      if (current === generation) loading.value = false
    }
  }

  watch([url, revision], () => { void fetchPage(0) }, { immediate: true })

  return {
    rows, next, loading, error,
    more: () => { if (next.value !== null && !loading.value) void fetchPage(next.value) },
  }
}

const STATUS_SEVERITY: Record<string, string> = { current: 'success', conflict: 'warn', failed: 'danger', archived: 'secondary' }

export function severity(status: string): string {
  return STATUS_SEVERITY[status] || 'secondary'
}
