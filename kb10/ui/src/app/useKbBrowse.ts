import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import {
  type BrowseNode,
  isEngineMissing,
  ENGINE_NOTICE,
  contentDeletePayload,
  canonicalSourceKey,
} from './types'
import { subscribeComponentMeta } from './componentMeta'

// Browse + delete for a KB's content nodes, factored out of the document library
// and the graph's source list so both share one fetch, one delete-through-the-
// knowledge-thread path, and one realtime reconciliation. Delete is durable: the
// node disappears only after the engine materializes the delete and the component
// meta refresh tells us to reconcile. A queued row stays visible (spinner) until
// the browse read model no longer contains its durable external id.
export function useKbBrowse(kbId: () => string, opts: { onChanged?: () => void } = {}) {
  const loading = ref(false)
  const notice = ref('')
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
  const deletingExternalIds = ref<Record<string, string>>({})
  // A queued delete waits on materialization to clear its spinner. Bound that wait so a
  // delete that never materializes stops spinning and surfaces a retryable notice.
  const DELETE_TIMEOUT_MS = 20000
  const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>()
  function clearPending(nodeId: string) {
    const d = { ...deleting.value }; delete d[nodeId]; deleting.value = d
    const ids = { ...deletingExternalIds.value }; delete ids[nodeId]; deletingExternalIds.value = ids
    const t = pendingTimers.get(nodeId)
    if (t) { clearTimeout(t); pendingTimers.delete(nodeId) }
  }

  // Concept/edge nodes belong to the graph; chunks/summaries are indexing detail.
  const EXCLUDED = new Set(['concept', 'edge', 'chunk', 'summary'])

  function docTime(n: BrowseNode): number {
    return Date.parse(n.updated_at || n.created_at || '') || 0
  }

  // Collapse document nodes that share a canonical source identity to one row —
  // the newest — so an in-flight replace or a redelivered ingest never shows the
  // same file twice. Nodes without a canonical identity cannot be duplicates and
  // are kept individually. First-seen position is preserved so the list is stable.
  function dedupeDocuments(list: BrowseNode[]): BrowseNode[] {
    const indexByKey = new Map<string, number>()
    const out: BrowseNode[] = []
    for (const n of list) {
      const key = canonicalSourceKey(n)
      if (!key) { out.push(n); continue }
      const at = indexByKey.get(key)
      if (at === undefined) { indexByKey.set(key, out.length); out.push(n); continue }
      if (docTime(n) >= docTime(out[at])) out[at] = n
    }
    return out
  }

  const documents = computed(() =>
    dedupeDocuments(nodes.value.filter((n) => !EXCLUDED.has(n.node_type || ''))))

  function findDoc(id: string): BrowseNode | undefined {
    return documents.value.find((n) => n.id === id)
  }

  // Realtime reconciliation reloads on every meta event, so overlapping loads are
  // routine. A per-call sequence guards the writes: only the latest-issued load may
  // mutate state, so a slow earlier response can never clobber a newer one, and a
  // load whose kb switched mid-flight is dropped.
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
      const { data } = await api.get(`/api/v1/kb10/${id}/browse?limit=${pageSize.value}&offset=${offset}`)
      if (seq !== loadSeq || kbId() !== id) return
      if (!data?.success) {
        notice.value = data?.error && isEngineMissing(data.error) ? ENGINE_NOTICE : data?.error || ''
        return
      }
      nodes.value = (data.nodes || []) as BrowseNode[]
      total.value = Number(data.total) || 0
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
    void load()
  }
  function next() { if (hasNext.value) goToPage(page.value + 1) }
  function prev() { if (hasPrev.value) goToPage(page.value - 1) }

  // Queue a delete through the knowledge content thread by the node's durable
  // external identity. Returns true when the request was accepted (the row then
  // waits for materialization), false when it could not be queued.
  async function remove(n: BrowseNode): Promise<boolean> {
    const id = kbId()
    if (!id || deleting.value[n.id]) return false
    const payload = contentDeletePayload(n)
    if (!payload) {
      notice.value = 'This document has no durable source identity and cannot be deleted here.'
      return false
    }
    deleting.value = { ...deleting.value, [n.id]: true }
    deletingExternalIds.value = { ...deletingExternalIds.value, [n.id]: String(payload.external_id || '') }
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

  function externalIdOf(n: BrowseNode): string {
    return String(contentDeletePayload(n)?.external_id || '')
  }

  // A queued delete clears once the browse read model no longer carries its durable
  // external id. Runs after a fresh load against the reconciled document set — the
  // reconciliation is per-page (documents holds the current page), and total
  // decrements naturally as the reload reports the smaller count.
  function reconcilePendingDeletes() {
    if (Object.keys(deletingExternalIds.value).length === 0) return
    const liveExternalIds = new Set(documents.value.map(externalIdOf).filter(Boolean))
    const nextDeleting = { ...deleting.value }
    const nextExternalIds = { ...deletingExternalIds.value }
    let matched = false
    for (const [nodeId, externalId] of Object.entries(deletingExternalIds.value)) {
      if (externalId && !liveExternalIds.has(externalId)) {
        delete nextDeleting[nodeId]
        delete nextExternalIds[nodeId]
        const t = pendingTimers.get(nodeId)
        if (t) { clearTimeout(t); pendingTimers.delete(nodeId) }
        matched = true
      }
    }
    if (!matched) return
    deleting.value = nextDeleting
    deletingExternalIds.value = nextExternalIds
    if (!Object.keys(nextDeleting).length) notice.value = ''
    opts.onChanged?.()
  }

  // Ingest emits a rapid burst of component.meta.changed events (one per stage of
  // every file). Coalesce them: one load runs at a time, and any events that land
  // while it is in flight collapse into a single trailing reload. A burst of N
  // events costs at most two reads, and the read that wins is always the freshest.
  let reconciling = false
  let reconcileQueued = false
  async function reconcileAfterMeta() {
    if (reconciling) { reconcileQueued = true; return }
    reconciling = true
    try {
      do {
        reconcileQueued = false
        await load()
        reconcilePendingDeletes()
      } while (reconcileQueued)
    } finally {
      reconciling = false
    }
  }

  let unbind: (() => void) | null = null
  let realtimeRun = 0
  function syncRealtime(id: string) {
    const run = ++realtimeRun
    if (unbind) { unbind(); unbind = null }
    if (!id) return
    const off = subscribeComponentMeta(id, () => { void reconcileAfterMeta() })
    if (run !== realtimeRun) {
      if (off) off()
      return
    }
    unbind = off
  }

  onBeforeUnmount(() => {
    realtimeRun++
    // Halt any in-flight paginated load so it stops walking pages after teardown.
    loadSeq++
    if (unbind) unbind()
    pendingTimers.forEach((t) => clearTimeout(t))
    pendingTimers.clear()
  })

  // A KB switch starts over on the first page; total is stale until the reload lands.
  watch(kbId, (id) => { page.value = 0; total.value = 0; load(); syncRealtime(id) }, { immediate: true })

  return {
    loading, notice, nodes, documents, deleting, load, reload: load, remove, findDoc,
    page, pageSize, total, pageCount, hasPrev, hasNext, next, prev, goToPage,
  }
}
