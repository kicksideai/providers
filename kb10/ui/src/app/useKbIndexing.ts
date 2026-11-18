// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { computed, ref, watch } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import type { ComponentMetaEvent } from './componentMeta'

function pendingCount(value: unknown): number | null {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null
  const count = Number(value)
  return Number.isSafeInteger(count) && count >= 0 ? count : null
}

export function useKbIndexing(kbId: () => string) {
  const pending = ref<number | null>(null)
  const indexingNotice = computed(() => {
    const count = pending.value
    return count ? `Indexing ${count === 1 ? 'document' : 'documents'} — ${count} waiting` : ''
  })
  let revision = 0

  function onMeta(event: ComponentMetaEvent) {
    if (event.component_id !== kbId()) return
    const count = pendingCount(event.meta.pending_source_count)
    if (count === null && !event.deleted.includes('pending_source_count')) return
    revision++
    pending.value = count
  }

  watch(kbId, async (id, _, onCleanup) => {
    pending.value = null
    if (!id) return
    const snapshot = ++revision
    onCleanup(() => { revision++ })
    try {
      const { data } = await api.get(`/api/v1/components/${id}`)
      if (snapshot === revision && id === kbId()) {
        pending.value = pendingCount(data?.meta?.pending_source_count)
      }
    } catch (error) {
      if (snapshot === revision && id === kbId()) {
        const failure = error as Record<string, unknown> & { response?: { status?: number } }
        host.handleError(failure.response?.status === 401 ? 'auth-expired' : 'other', failure)
      }
    }
  }, { immediate: true })

  return { pending, indexingNotice, onMeta }
}
