import { ref, onBeforeUnmount } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import { type SearchHit } from './types'

// Two-stage retrieval against a KB, shared by the wiki nav search and the
// document library search. The shells differ (popover vs results list, Ask
// mode); the query → /search → ranked passages plumbing is one place. run()
// searches immediately; runDebounced() coalesces as-you-type input.
export function useKbSearch(kbId: () => string) {
  const query = ref('')
  const results = ref<SearchHit[]>([])
  const answer = ref('')
  const loading = ref(false)
  const error = ref('')
  const performed = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function clear() {
    if (timer) { clearTimeout(timer); timer = null }
    query.value = ''
    results.value = []
    answer.value = ''
    performed.value = false
    error.value = ''
  }

  async function run(limit = 20) {
    const id = kbId()
    const q = query.value.trim()
    if (!q || !id) { results.value = []; performed.value = false; return }
    loading.value = true
    error.value = ''
    performed.value = true
    try {
      const { data } = await api.get(`/api/v1/kb10/${id}/search?q=${encodeURIComponent(q)}&limit=${limit}`)
      if (data?.success) { results.value = (data.results || []) as SearchHit[]; answer.value = '' }
      else error.value = data?.error || 'search failed'
    } catch (e: any) {
      error.value = e?.response?.data?.error || e?.message || 'search error'
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      loading.value = false
    }
  }

  // Grounded question answering: same retrieval plus a synthesized answer from
  // the engine (null when the KB has no analysis model — the caller then leans
  // on the ranked passages alone).
  async function ask(limit = 8) {
    const id = kbId()
    const q = query.value.trim()
    if (!q || !id) { results.value = []; answer.value = ''; performed.value = false; return }
    loading.value = true
    error.value = ''
    answer.value = ''
    performed.value = true
    try {
      // Answering lives in the knowledge control plane (the per-KB query driver),
      // not the kb10 provider; the provider only does retrieval.
      const { data } = await api.post(`/api/v1/knowledge/${id}/ask`, { query: q, limit })
      if (data?.success) {
        results.value = (data.results || []) as SearchHit[]
        answer.value = String(data.answer || '')
      } else {
        error.value = data?.error || 'ask failed'
      }
    } catch (e: any) {
      error.value = e?.response?.data?.error || e?.message || 'ask error'
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      loading.value = false
    }
  }

  function runDebounced(ms = 300) {
    if (timer) clearTimeout(timer)
    if (!query.value.trim()) { results.value = []; performed.value = false; return }
    timer = setTimeout(() => run(), ms)
  }

  onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

  return { query, results, answer, loading, error, performed, run, ask, runDebounced, clear }
}

export function pct(v?: number): string {
  return v == null ? '' : `${Math.round(v * 100)}%`
}
