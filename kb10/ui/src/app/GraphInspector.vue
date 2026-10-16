<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import {
  type GraphConcept,
  type GraphEdge,
  type BrowseNode,
  conceptColor,
  conceptIdsForDoc,
  EDGE_LABELS,
  isRawRenderable,
  uploadIdOf,
} from './types'
import { CountPill, KbSummary, ViewOriginalButton } from './shared'

// Docked inspector for the selected node: identity + description, a document's
// summary and reference links into the graph, the source content it was
// extracted from (rendered through the shared <wc-resource-view>), and its
// relations. Reference chips and related concepts re-select on click, so the
// panel doubles as a navigator. The whole panel is width-resizable from its left
// edge. Opening an original raises an event the graph view answers with a
// contained overlay over the canvas — the inspector itself holds no preview.
const props = defineProps<{
  kbId: string
  concept: GraphConcept
  edges: GraphEdge[]
  labelOf: (id: string) => string
  colorOf?: (id: string) => string
  // True while this node's original overlay is open, for the inline trigger label.
  originalOpen?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'close'): void
  // Reports the selected node's primary renderable original (or null) so the graph
  // view (which owns the overlay over the canvas) holds the open payload.
  (e: 'original-available', page: { contentType: string; sourceUrl: string; title: string } | null): void
  // The inline header trigger asks the graph view to toggle that overlay.
  (e: 'toggle-original'): void
}>()

const accent = computed(() => props.colorOf?.(props.concept.id) || conceptColor(props.concept).fill)
function dotColor(id: string): string {
  return props.colorOf?.(id) || conceptColor({ id } as GraphConcept).fill
}

const isDocument = computed(() => props.concept.node_type === 'document')

interface Rel { id: string; label: string; kind: string; otherId: string }
const outgoing = computed<Rel[]>(() =>
  props.edges
    .filter((e) => e.from_node_id === props.concept.id)
    .map((e) => ({ id: e.id, kind: EDGE_LABELS[e.edge_type || ''] || e.edge_type || 'related', otherId: e.to_node_id, label: e.to_label || props.labelOf(e.to_node_id) })))
const incoming = computed<Rel[]>(() =>
  props.edges
    .filter((e) => e.to_node_id === props.concept.id)
    .map((e) => ({ id: e.id, kind: EDGE_LABELS[e.edge_type || ''] || e.edge_type || 'related', otherId: e.from_node_id, label: e.from_label || props.labelOf(e.from_node_id) })))

const relationCount = computed(() => outgoing.value.length + incoming.value.length)

// A document's reference links into the graph (the concepts it is categorized
// under). Concepts use the relation sections instead.
const refs = computed(() =>
  isDocument.value
    ? conceptIdsForDoc(props.concept.id, props.edges).map((r) => ({ id: r.id, label: r.label || props.labelOf(r.id) }))
    : [])


// Document node ids attached to this concept (categorized_as → from = doc), or the
// concept itself when it is a document.
const docIds = computed<string[]>(() => {
  if (isDocument.value) return [props.concept.id]
  const out: string[] = []
  for (const e of props.edges) {
    if (e.edge_type === 'categorized_as' && e.to_node_id === props.concept.id) out.push(e.from_node_id)
  }
  return out
})

interface DocPage { id: string; title: string; content: string; contentType: string; origMime: string; sourceUrl: string }
const loading = ref(false)
const pages = ref<DocPage[]>([])
const summaryText = ref('')

// The concept-level original, surfaced as a peer of the relations stat on the
// top line. When several pages each carry their own original the first one is
// the concept-level action; per-page actions stay inline below.
const firstOriginal = computed(() => pages.value.find((p) => isRawRenderable(p.origMime)) || null)

// The node's overview text (a document's summary, else a concept's description).
// KbSummary clamps a long one so the relations/references below stay reachable.
const overview = computed(() => {
  if (summaryText.value) return { text: summaryText.value, label: 'Summary', icon: 'tabler:file-description' }
  if (props.concept.description) return { text: props.concept.description, label: 'Description', icon: 'tabler:align-left' }
  return null
})

async function fetchDoc(id: string): Promise<DocPage | null> {
  try {
    const { data } = await api.get(`/api/v1/kb10/${props.kbId}/browse?node_id=${encodeURIComponent(id)}`)
    if (!data?.success || !data.node) return null
    const n = data.node
    const content = String(n.content || '')
    if (!content.trim()) return null
    const m = n.metadata || {}
    const origMime = String(m.original_mime_type || m.source_mime || '')
    const hasUpload = !!uploadIdOf(m)
    return {
      id,
      title: m.title || m.filename || m.original_filename || props.labelOf(id),
      content,
      contentType: n.content_type || 'text/markdown',
      origMime: hasUpload ? origMime : '',
      sourceUrl: `/api/v1/kb10/${props.kbId}/nodes/${encodeURIComponent(id)}/source`,
    }
  } catch { return null }
}

// The document summary is a child node (node_type === 'summary') of the document.
async function fetchSummary(docId: string): Promise<string> {
  try {
    const { data } = await api.get(`/api/v1/kb10/${props.kbId}/browse?parent_id=${encodeURIComponent(docId)}&include_content=true&limit=200`)
    if (!data?.success) return ''
    const sum = (data.nodes as BrowseNode[] | undefined)?.find((c) => c.node_type === 'summary')
    return String(sum?.content || '')
  } catch { return '' }
}

let loadRunId = 0
async function loadContent() {
  const run = ++loadRunId
  pages.value = []
  summaryText.value = ''
  expanded.value = false
  overflows.value = false
  const ids = docIds.value
  if (!ids.length) return
  loading.value = true
  try {
    const res = await Promise.all(ids.map(fetchDoc))
    if (run !== loadRunId) return
    pages.value = res.filter((p): p is DocPage => p != null)
    if (isDocument.value) {
      const s = await fetchSummary(props.concept.id)
      if (run !== loadRunId) return
      summaryText.value = s
    }
  } finally {
    if (run === loadRunId) loading.value = false
  }
}

// Surface the node's primary original up to the graph view, which owns the overlay
// and answers the inline header trigger. Re-emits whenever the selected node (and
// thus its first original) changes.
watch(firstOriginal, (p) => {
  emit('original-available', p ? { contentType: p.origMime, sourceUrl: p.sourceUrl, title: p.title } : null)
}, { immediate: true })

// ── Inspector width (resizable from the left edge, persisted, clamped) ───────
const WIDTH_KEY = 'kb10:inspect:width'
const WIDTH_MIN = 320
const WIDTH_MAX = 860
function clampWidth(px: number) { return Math.max(WIDTH_MIN, Math.min(WIDTH_MAX, px)) }
function readStoredWidth(): number {
  const raw = Number(localStorage.getItem(WIDTH_KEY))
  return Number.isFinite(raw) && raw > 0 ? clampWidth(raw) : 430
}
const width = ref(readStoredWidth())
const asideRef = ref<HTMLElement | null>(null)
const dragging = ref(false)

function onWidthMove(e: PointerEvent) {
  const el = asideRef.value
  if (!el) return
  // The panel is pinned to the viewport's right edge, so its width is the
  // distance from the pointer to that right edge.
  const rect = el.getBoundingClientRect()
  width.value = clampWidth(rect.right - e.clientX)
}
function onWidthEnd() {
  dragging.value = false
  window.removeEventListener('pointermove', onWidthMove)
  window.removeEventListener('pointerup', onWidthEnd)
  localStorage.setItem(WIDTH_KEY, String(Math.round(width.value)))
}
function onWidthStart(e: PointerEvent) {
  e.preventDefault()
  dragging.value = true
  window.addEventListener('pointermove', onWidthMove)
  window.addEventListener('pointerup', onWidthEnd)
}

// ── Rendered-content "show more" clamp ───────────────────────────────────────
// Long rendered markdown is capped to a max-height with a bottom fade; the
// toggle only appears once the content actually overflows the threshold.
const CLAMP_PX = 560
const contentRef = ref<HTMLElement | null>(null)
const expanded = ref(false)
const overflows = ref(false)

function measureContent() {
  const el = contentRef.value
  if (!el) { overflows.value = false; return }
  overflows.value = el.scrollHeight - CLAMP_PX > 24
}
let contentObserver: ResizeObserver | null = null
function watchContent() {
  contentObserver?.disconnect()
  const el = contentRef.value
  if (!el) return
  contentObserver = new ResizeObserver(() => measureContent())
  contentObserver.observe(el)
  nextTick(measureContent)
}
const contentClamped = computed(() => overflows.value && !expanded.value)

watch([pages, loading], () => { if (!loading.value) nextTick(watchContent) })
watch(() => props.concept.id, loadContent, { immediate: true })
onBeforeUnmount(() => { contentObserver?.disconnect(); onWidthEnd() })
</script>

<template>
  <aside ref="asideRef" class="gx-inspect" :class="{ dragging }" :style="{ width: width + 'px' }">
    <div
      class="gx-ins-resizer"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize inspector"
      @pointerdown="onWidthStart"
    ><span class="gx-ins-resizer-grip" /></div>

    <header class="gx-ins-h" :style="{ '--accent': accent }">
      <span class="gx-ins-dot" />
      <div class="gx-ins-id">
        <h3 class="gx-ins-name">{{ concept.label }}</h3>
        <ViewOriginalButton
          v-if="firstOriginal"
          class="gx-ins-orig-btn"
          :class="{ on: originalOpen }"
          :label="originalOpen ? 'Hide original' : 'View original'"
          @open="emit('toggle-original')"
        />
      </div>
      <button class="gx-ins-x" aria-label="Close" @click="emit('close')"><Icon icon="tabler:x" /></button>
    </header>

    <div class="gx-ins-body">
      <div class="gx-ins-stats">
        <div v-if="concept.document_count" class="gx-stat"><Icon icon="tabler:files" /><span>{{ concept.document_count }} linked</span></div>
        <div v-if="relationCount" class="gx-stat"><Icon icon="tabler:arrows-split-2" /><span>relations</span><CountPill :value="relationCount" /></div>
      </div>

      <!-- The node's overview (a document's summary, else a concept's description).
           A long one is clamped with a toggle so relations/references stay near
           the top rather than below a wall of text. -->
      <KbSummary
        v-if="overview"
        :key="concept.id"
        :icon="overview.icon"
        :label="overview.label"
        :text="overview.text"
        collapsible
      />

      <!-- Reference links: the concepts this document is filed under. Clicking one
           jumps to it on the canvas. -->
      <section v-if="refs.length" class="gx-rel-group">
        <div class="gx-rel-title"><Icon icon="tabler:link" />Filed under</div>
        <div class="kc-refs">
          <button v-for="r in refs" :key="r.id" class="kc-ref" @click="emit('select', r.id)">
            <span class="kc-ref-dot" :style="{ background: dotColor(r.id) }" />
            <span class="kc-ref-label">{{ r.label }}</span>
            <Icon class="kc-ref-go" icon="tabler:arrow-up-right" />
          </button>
        </div>
      </section>

      <!-- Relations sit above the (potentially long) rendered content so they're
           reachable without scrolling the whole document. -->
      <template v-if="!isDocument">
        <section v-if="outgoing.length" class="gx-rel-group">
          <div class="gx-rel-title"><Icon icon="tabler:arrow-up-right" />Relates to</div>
          <button v-for="r in outgoing" :key="r.id" class="gx-rel-item" @click="emit('select', r.otherId)">
            <span class="gx-rel-kind">{{ r.kind }}</span>
            <span class="gx-rel-label">{{ r.label }}</span>
            <Icon class="gx-rel-go" icon="tabler:chevron-right" />
          </button>
        </section>

        <section v-if="incoming.length" class="gx-rel-group">
          <div class="gx-rel-title"><Icon icon="tabler:arrow-down-left" />Referenced by</div>
          <button v-for="r in incoming" :key="r.id" class="gx-rel-item" @click="emit('select', r.otherId)">
            <span class="gx-rel-kind">{{ r.kind }}</span>
            <span class="gx-rel-label">{{ r.label }}</span>
            <Icon class="gx-rel-go" icon="tabler:chevron-right" />
          </button>
        </section>
      </template>

      <div v-if="loading" class="gx-ins-loading"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /><span>Loading content…</span></div>
      <section v-else-if="pages.length" class="gx-ins-content">
        <div class="gx-ins-clamp" :class="{ clamped: contentClamped }">
          <div ref="contentRef" class="gx-ins-clamp-inner">
            <div v-for="p in pages" :key="p.id" class="gx-ins-doc">
              <div v-if="pages.length > 1" class="gx-ins-doc-t">{{ p.title }}</div>
              <wc-resource-view class="gx-ins-rv" :content-type="p.contentType" :source="p.content" />
            </div>
          </div>
          <div v-if="contentClamped" class="gx-ins-clamp-fade" aria-hidden="true" />
        </div>
        <button
          v-if="overflows"
          type="button"
          class="gx-ins-more"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          <Icon :icon="expanded ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
          {{ expanded ? 'Show less' : 'Show more' }}
        </button>
      </section>

      <div v-if="!loading && !overview && !pages.length && !refs.length && !outgoing.length && !incoming.length" class="gx-ins-empty">
        <Icon icon="tabler:circle-dashed" />
        <span>An isolated concept with no extracted relations or content yet.</span>
      </div>
    </div>
  </aside>
</template>
