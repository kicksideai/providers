// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { computed, ref, watch } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import type { ComponentMetaEvent } from './componentMeta'

function pendingCount(value: unknown): number {
  const count = typeof value === 'string' || typeof value === 'number' ? Number(value) : 0
  return Number.isInteger(count) && count > 0 ? count : 0
}

export function useKbIndexing(kbId: () => string) {
  const pending = ref(0)
  const indexingNotice = computed(() => pending.value > 0
    ? `Indexing ${pending.value === 1 ? 'document' : 'documents'} — ${pending.value} waiting`
    : '')
  let revision = 0

  function onMeta(event: ComponentMetaEvent) {
    if (event.component_id !== kbId()) return
    revision++
    pending.value = pendingCount(event.meta.pending_source_count)
  }

  watch(kbId, async (id, _, onCleanup) => {
    pending.value = 0
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
