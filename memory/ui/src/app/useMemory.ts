// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import { api, on } from '@wippy-fe/proxy'
import { useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import { memoryApi } from './api'
import { errorText, type MemoryStatusView } from './types'
export { usePaged } from './usePaged'

export function useMemory(memoryId: Ref<string>) {
  const base = computed(() => `/api/v1/memory/${encodeURIComponent(memoryId.value)}`)
  const status = ref<MemoryStatusView | null>(null)
  const error = ref('')
  const busy = ref(false)
  const revision = ref(0)

  let generation = 0
  async function refresh() {
    const current = ++generation
    if (!memoryId.value) return false
    try {
      const data = await memoryApi(memoryId.value).status()
      if (current !== generation) return false
      status.value = data as MemoryStatusView
      error.value = ''
      revision.value++
      return true
    } catch (err) {
      if (current === generation) error.value = errorText(err)
      return false
    }
  }

  async function act(fn: () => Promise<unknown>): Promise<boolean> {
    busy.value = true
    error.value = ''
    try {
      await fn()
      return await refresh()
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
    generation++
    status.value = null
    error.value = ''
    if (!id) return
    const off = on(`component.${id}`, () => { void refresh() })
    unsubscribe = typeof off === 'function' ? off : null
    void refresh()
  }, { immediate: true })
  onUnmounted(() => { if (unsubscribe) unsubscribe() })
  useHostVisibilityRefresh(async () => { await refresh() })

  return { memoryId, base, status, error, busy, revision, act }
}

export type Memory = ReturnType<typeof useMemory>
