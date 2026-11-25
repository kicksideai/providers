import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import {
  type BrowseNode,
  isEngineMissing,
  ENGINE_NOTICE,
  contentDeletePayload,
} from './types'
import { subscribeComponentMeta } from './componentMeta'
import { formatIndexingNotice } from './indexingNotice'

// Browse + delete for a KB's content nodes, factored out of the document library
// and the graph's source list so both share one fetch, one delete-through-the-
// knowledge-thread path, and one realtime reconciliation. Delete is durable: the
// node disappears only after the engine materializes the delete and the component
// meta refresh tells us to reconcile. A queued row stays visible (spinner) until
// the browse read model no longer contains its node ID.
export type DocumentScope = 'documents' | 'failures'
const RECONCILE_WINDOW_MS = 400

export function useKbBrowse(kbId: () => string, opts: {
  onChanged?: () => void
  includeIndexing?: boolean
  scope?: () => DocumentScope
} = {}) {
  const loading = ref(false)
  const notice = ref('')
  const indexingNotice = ref('')
  const indexingRetrying = ref(false)
  const nodes = ref<BrowseNode[]>([])
  // Server-side pagination: one page is fetched at a time (?limit&offset) and the
  // real total comes from the browse API's count. total drives the pager rather
  // than documents.length, which is a single capped window.
  const page = ref(0)
  const pageSize = ref(50)
  const total = ref(0)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const hasPrev = computed(() => page.value > 0)
  const hasNext = computed(() => page.value < pageCount.value - 1)
  const deleting = ref<Record<string, boolean>>({})
  // A queued delete waits on materialization to clear its spinner. Bound that wait so a
  // delete that never materializes stops spinning and surfaces a retryable notice.
  const DELETE_TIMEOUT_MS = 20000
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const pendingTargets = new Map<string, { kbId: string; scope?: DocumentScope }>()
  function clearPending(nodeId: string) {
    const d = { ...deleting.value }; delete d[nodeId]; deleting.value = d
    const t = pendingTimers.get(nodeId)
    if (t) { clearTimeout(t); pendingTimers.delete(nodeId) }
    pendingTargets.delete(nodeId)
  }

  const documents = nodes

  function findDoc(id: string): BrowseNode | undefined {
    return documents.value.find((n) => n.id === id)
  }

  // Navigation can supersede an in-flight background refresh. Only the latest
  // request for the current KB can update the displayed window.
  let loadSeq = 0
  async function load() {
    const id = kbId()
    if (!id) return
    const seq = ++loadSeq
    loading.value = true
    notice.value = ''
    try {
      // Fetch only the current page. total comes from the API count, so a large KB
      // never pulls its whole node set into one list.
      const offset = page.value * pageSize.value
      const indexing = opts.includeIndexing ? '&include_indexing=true' : ''
      const scope = opts.scope?.()
      const filter = scope ? `scope=${scope}` : 'node_type=document'
      const { data } = await api.get(`/api/v1/kb10/${id}/browse?${filter}&limit=${pageSize.value}&offset=${offset}${indexing}`)
      if (seq !== loadSeq || kbId() !== id) return
      if (!data?.success) {
        notice.value = data?.error && isEngineMissing(data.error) ? ENGINE_NOTICE : data?.error || 'Could not load contents'
        return
      }
      nodes.value = (data.nodes || []) as BrowseNode[]
      total.value = Number(data.total) || 0
      indexingNotice.value = formatIndexingNotice(data.pending_source)
      indexingRetrying.value = data.pending_source?.retrying === true
      return true
    } catch (e: any) {
      if (seq !== loadSeq) return
      const msg = e?.response?.data?.error || e?.message || 'could not load contents'
      notice.value = isEngineMissing(msg) ? ENGINE_NOTICE : msg
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  // Page navigation reloads the current window. goToPage clamps into range so an
  // out-of-bounds request (e.g. the last page shrank after a delete) still lands.
  function goToPage(n: number) {
    const target = Math.max(0, Math.min(n, pageCount.value - 1))
    if (target === page.value) return
    page.value = target
    cancelRefresh()
    void load()
  }
  function next() { if (hasNext.value) goToPage(page.value + 1) }
  function prev() { if (hasPrev.value) goToPage(page.value - 1) }

  // A queued delete waits for materialization on the Knowledge content thread.
  async function remove(n: BrowseNode): Promise<boolean> {
    const id = kbId()
    if (!id || deleting.value[n.id]) return false
    const payload = contentDeletePayload(n)
    pendingTargets.set(n.id, { kbId: id, scope: opts.scope?.() })
    deleting.value = { ...deleting.value, [n.id]: true }
    let queued = false
    try {
      const { data } = await api.delete(`/api/v1/knowledge/${id}/content`, { data: payload })
      if (data?.success) {
        queued = true
        notice.value = 'Delete queued. The row clears once indexing catches up.'
      } else {
        notice.value = data?.error || 'could not queue delete'
      }
    } catch (e: any) {
      notice.value = e?.response?.data?.error || e?.message || 'could not queue delete'
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      if (!queued) {
        clearPending(n.id)
      } else {
        // Stop the spinner if materialization never catches up (e.g. the delete was
        // dropped downstream): clear it and surface a retryable notice.
        const nodeId = n.id
        pendingTimers.set(nodeId, setTimeout(() => {
          if (!deleting.value[nodeId]) return
          clearPending(nodeId)
          notice.value = 'Delete is taking longer than expected — refresh to verify, then retry if it is still listed.'
        }, DELETE_TIMEOUT_MS))
      }
    }
    return queued
  }

  function reconcilePendingDeletes() {
    const pending = Object.keys(deleting.value)
    if (pending.length === 0) return
    const liveNodeIds = new Set(nodes.value.map((node) => node.id))
    const removed = pending.filter((nodeId) => {
      const target = pendingTargets.get(nodeId)
      return target?.kbId === kbId() && target.scope === opts.scope?.() && !liveNodeIds.has(nodeId)
    })
    if (!removed.length) return
    for (const nodeId of removed) clearPending(nodeId)
    if (!Object.keys(deleting.value).length) notice.value = ''
    opts.onChanged?.()
  }

  // A 400ms window groups file-stage events even when individual GETs are fast.
  // Keep one background read in flight and schedule another window if changes
  // arrived during it. The AddPanel uses this same queue for its fallback reads.
  let reconcileTimer: ReturnType<typeof setTimeout> | undefined
  let reconciling = false
  let reconcileQueued = false
  function cancelRefresh() {
    if (reconcileTimer !== undefined) clearTimeout(reconcileTimer)
    reconcileTimer = undefined
    reconcileQueued = false
  }
  function scheduleRefresh() {
    if (!kbId()) return
    if (reconciling) { reconcileQueued = true; return }
    if (reconcileTimer !== undefined) return
    reconcileTimer = setTimeout(async () => {
      reconcileTimer = undefined
      reconciling = true
      try {
        if (await load()) reconcilePendingDeletes()
      } finally {
        reconciling = false
        const queued = reconcileQueued
        reconcileQueued = false
        if (queued) scheduleRefresh()
      }
    }, RECONCILE_WINDOW_MS)
  }

  let unbind: (() => void) | null = null
  let realtimeRun = 0
  function syncRealtime(id: string) {
    const run = ++realtimeRun
    if (unbind) { unbind(); unbind = null }
    if (!id) return
    const off = subscribeComponentMeta(id, () => {
      if (run === realtimeRun) scheduleRefresh()
    })
    if (run !== realtimeRun) {
      if (off) off()
      return
    }
    unbind = off
  }

  onBeforeUnmount(() => {
    realtimeRun++
    cancelRefresh()
    loadSeq++
    if (unbind) unbind()
    pendingTimers.forEach((t) => clearTimeout(t))
    pendingTimers.clear()
  })

  watch([kbId, () => opts.scope?.()], ([id], [previousId]) => {
    cancelRefresh()
    page.value = 0
    total.value = 0
    nodes.value = []
    indexingNotice.value = ''
    indexingRetrying.value = false
    void load()
    if (id !== previousId) syncRealtime(id)
  }, { immediate: true })

  return {
    loading, notice, indexingNotice, indexingRetrying, nodes, documents, deleting, load, reload: load, remove, findDoc,
    page, pageSize, total, pageCount, hasPrev, hasNext, next, prev, goToPage, scheduleRefresh,
  }
}
