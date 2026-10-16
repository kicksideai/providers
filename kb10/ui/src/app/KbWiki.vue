<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import {
  type GraphConcept,
  type GraphEdge,
  buildTree,
  isEngineMissing,
  ENGINE_NOTICE,
} from './types'
import { KbNotice, KbLoading } from './shared'
import WikiView from './WikiView.vue'
import GraphView from './GraphView.vue'
import { subscribeComponentMeta } from './componentMeta'
import { canGenerateAnswer } from './queryMode'

// kx-kb-wiki — the kb10 concept-graph KB detail. This root owns everything the two
// readings share: the single /graph data load, the realtime refresh, the deep-link
// route, the selected node, and the capability probe. It hands that state to the
// active view (the wiki reader or the graph canvas) and applies the picks /
// mutations they emit. The view is switched by the host (knowledge top bar), which
// passes the choice down via config.view.
interface P { config?: { kb_id?: string; route?: string; view?: 'wiki' | 'graph' } | null }
interface E {
  'kb-changed': { kb_id: string }
  navigate: string
}
const props = useProps<P>()
const emit = useEvents<E>()
const kbId = computed(() => props.value.config?.kb_id || '')
const routeParam = computed(() => props.value.config?.route || '')
// Guards the selection→navigate sync while a route / default / post-edit selection
// is being applied, so reflecting the URL doesn't echo a navigate back out.
let applyingRoute = false

// The active view (wiki reader / graph canvas) is driven by the host: the knowledge
// page renders the Wiki|Graph switch in its top bar and passes the choice down via
// config.view. Fall back to the persisted/default when mounted standalone.
const VIEW_KEY = 'kb10:wiki:view'
function readView(): 'wiki' | 'graph' {
  const v = props.value.config?.view
  if (v === 'graph' || v === 'wiki') return v
  return localStorage.getItem(VIEW_KEY) === 'graph' ? 'graph' : 'wiki'
}
const view = ref<'wiki' | 'graph'>(readView())
watch(() => props.value.config?.view, (v) => {
  if ((v === 'graph' || v === 'wiki') && v !== view.value) view.value = v
})

const loading = ref(false)
const notice = ref('')
const concepts = ref<GraphConcept[]>([])
const edges = ref<GraphEdge[]>([])
const selectedId = ref('')
const canAnswer = ref(false)

// Enrichment attention state maintained by the backend on component meta and
// carried on the /graph response: a failed graph pass (enrichment.error) or a
// dangling custom enrichment agent (enrichment.agent_missing). Rendered as a
// needs-attention banner; failures offer a retry (POST /enrichment re-runs
// placement for the unplaced documents).
interface EnrichmentState { error?: string; agent_missing?: boolean; agent_error?: string }
const enrichment = ref<EnrichmentState | null>(null)
const retrying = ref(false)
const attention = computed(() => {
  const e = enrichment.value
  if (!e) return ''
  if (e.error) return `Graph enrichment failed: ${e.error}`
  if (e.agent_missing) return e.agent_error || 'The configured enrichment agent is unavailable; documents fall back to default placement.'
  return ''
})
const canRetry = computed(() => !!enrichment.value?.error)
async function retryEnrichment() {
  if (!kbId.value || retrying.value) return
  retrying.value = true
  try {
    await api.post(`/api/v1/kb10/${kbId.value}/enrichment`)
    // The retry cleared the standing flag server-side; reflect that now. A pass
    // that fails again re-raises the flag through the realtime meta refresh.
    enrichment.value = null
  } catch (e: any) {
    host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
  } finally {
    retrying.value = false
  }
}

const conceptsById = computed(() => {
  const m = new Map<string, GraphConcept>()
  for (const c of concepts.value) m.set(c.id, c)
  return m
})
// The page the wiki reader opens by default: the first root of the hierarchy.
const firstConceptId = computed(() => buildTree(concepts.value, edges.value)[0]?.concept.id || '')

async function loadCapability() {
  if (!kbId.value) { canAnswer.value = false; return }
  try {
    const { data } = await api.get(`/api/v1/knowledge/${kbId.value}`)
    const cfg = (data?.config || data?.knowledge_base?.config || {}) as Record<string, unknown>
    canAnswer.value = canGenerateAnswer(cfg)
  } catch { canAnswer.value = false }
}

let loadRunId = 0
async function load(quiet = false) {
  if (!kbId.value) return
  const run = ++loadRunId
  if (!quiet) loading.value = true
  notice.value = ''
  try {
    const { data } = await api.get(`/api/v1/kb10/${kbId.value}/graph`)
    if (run !== loadRunId) return
    if (data?.success) {
      concepts.value = (data.nodes || []) as GraphConcept[]
      edges.value = (data.edges || []) as GraphEdge[]
      const enr = (data.enrichment || {}) as EnrichmentState
      enrichment.value = enr.error || enr.agent_missing ? enr : null
      // Drop a selection whose node vanished. Only reconcile when nothing is
      // selected (first load, or the selected node was deleted) — otherwise a
      // periodic realtime refresh would keep yanking selection back to the
      // mount-time route param (config.route isn't updated on in-KB navigation),
      // which flickers the nav. Route *changes* are handled by watch(routeParam).
      if (selectedId.value && !conceptsById.value.has(selectedId.value)) selectedId.value = ''
      if (!selectedId.value) {
        if (routeParam.value && conceptsById.value.has(routeParam.value)) {
          applyRoute(routeParam.value)
        } else if (view.value === 'wiki' && firstConceptId.value) {
          applyingRoute = true
          selectedId.value = firstConceptId.value
          applyingRoute = false
        }
      }
    } else {
      notice.value = data?.error && isEngineMissing(data.error) ? ENGINE_NOTICE : data?.error || ''
    }
  } catch (e: any) {
    if (run !== loadRunId) return
    const msg = e?.response?.data?.error || e?.message || 'could not load the knowledge base'
    notice.value = isEngineMissing(msg) ? ENGINE_NOTICE : msg
    host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
  } finally {
    if (run === loadRunId && !quiet) loading.value = false
  }
}

function applyRoute(r: string) {
  if ((r || '') === (selectedId.value || '')) return
  if (!r) { selectedId.value = ''; return }
  if (!conceptsById.value.has(r)) return
  applyingRoute = true
  selectedId.value = r
  applyingRoute = false
}
watch(selectedId, (id) => { if (!applyingRoute) emit('navigate', id || '') })
watch(routeParam, (r) => applyRoute(r))

// Realtime: public component-meta changes are the canonical "this KB moved"
// signal. Coalesce bursts into one quiet refresh so the active view updates in place.
let refreshTimer: ReturnType<typeof setTimeout> | null = null
function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => { refreshTimer = null; load(true) }, 400)
}
let unbindRealtime: (() => void) | null = null
let realtimeRun = 0
function syncRealtime(id: string) {
  const run = ++realtimeRun
  if (unbindRealtime) { unbindRealtime(); unbindRealtime = null }
  if (!id) return
  const off = subscribeComponentMeta(id, () => scheduleRefresh())
  if (run !== realtimeRun) {
    if (off) off()
    return
  }
  unbindRealtime = off
}
onBeforeUnmount(() => {
  realtimeRun++
  if (refreshTimer) clearTimeout(refreshTimer)
  if (unbindRealtime) unbindRealtime()
})

// Switching to the reader with nothing open lands on the first page.
watch(view, (v) => {
  if (v === 'wiki' && !selectedId.value && firstConceptId.value) {
    applyingRoute = true
    selectedId.value = firstConceptId.value
    applyingRoute = false
  }
})

watch(kbId, (id) => { selectedId.value = ''; load(); loadCapability(); syncRealtime(id) }, { immediate: true })

function onSelect(id: string) { if (id !== selectedId.value) selectedId.value = id }
function onChanged() {
  if (kbId.value) emit('kb-changed', { kb_id: kbId.value })
  load(true)
}
function onReload() { load() }
</script>

<template>
  <div class="kb-page">
    <KbNotice v-if="notice" tone="info">{{ notice }}</KbNotice>

    <KbNotice v-if="attention" tone="warn">
      {{ attention }}
      <button
        v-if="canRetry"
        type="button"
        class="kc-notice-action"
        :disabled="retrying"
        @click="retryEnrichment"
      >{{ retrying ? 'Retrying…' : 'Retry' }}</button>
    </KbNotice>

    <KbLoading
      v-if="loading && !concepts.length"
      :icon="view === 'graph' ? 'tabler:topology-star-3' : undefined"
      :label="view === 'graph' ? 'Building the concept graph…' : undefined"
    />

    <Transition v-else name="kb-fade" mode="out-in">
      <WikiView
        v-if="view === 'wiki'"
        key="wiki"
        class="kb-view"
        :kb-id="kbId"
        :concepts="concepts"
        :edges="edges"
        :selected-id="selectedId"
        :can-answer="canAnswer"
        :loading="loading"
        @select="onSelect"
        @changed="onChanged"
        @reload="onReload"
      />
      <GraphView
        v-else
        key="graph"
        class="kb-view"
        :kb-id="kbId"
        :concepts="concepts"
        :edges="edges"
        :selected-id="selectedId"
        :can-answer="canAnswer"
        :loading="loading"
        @select="onSelect"
        @changed="onChanged"
        @reload="onReload"
      />
    </Transition>
  </div>
</template>
