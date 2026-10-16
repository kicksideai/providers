<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import { type BrowseNode, nodeLabel, isRawRenderable, uploadIdOf } from './types'
import { docIcon, fullDate, relativeTime } from './docMeta'
import { KbTabs, type KbTab, KbSummary, OriginalOverlay, ViewOriginalButton } from './shared'

interface NodeResponse { success: boolean; node?: BrowseNode; error?: string }
interface ChildrenResponse { success: boolean; nodes: BrowseNode[]; total: number; error?: string }

// The reading surface for one document: its title + source facts, the extracted
// body rendered through the shared <wc-resource-view> (markdown / text / html /
// code), the ORIGINAL file previewed in a docked, resizable right pane when one
// exists (pdf, image, office), and a per-chunk inspector showing how it was indexed.
// The "View original" toggle sits inline in the header beside the title and is
// shown only when this document carries a renderable original.
const props = defineProps<{ kbId: string; node: BrowseNode }>()

const loading = ref(false)
const error = ref('')
const fullContent = ref('')
const fullType = ref('')
const chunks = ref<BrowseNode[]>([])
const chunkTotal = ref(0)
const summaryText = ref('')
const tab = ref<'read' | 'chunks'>('read')
const origOpen = ref(false)
const openChunk = ref<Record<string, boolean>>({})

// Per-chunk contextual prefix the enrichment model adds (contextual embedding).
function chunkPrefix(c: BrowseNode): string {
  return String((c.metadata || {}).contextual_prefix || '')
}

const meta = computed(() => props.node.metadata || {})
const sourceUrl = computed(() => meta.value.source_url as string | undefined)
const renderType = computed(() => fullType.value || props.node.content_type || 'text/markdown')

// The original ingested file (a pdf/image/office doc) is previewable through the
// node source endpoint; plain text/markdown is already the rendered body, so it
// gets no separate "Original". An original exists when the upload's source mime
// is something <wc-resource-view> renders as itself.
const originalMime = computed(() =>
  String(meta.value.original_mime_type || meta.value.source_mime || ''))
const hasOriginal = computed(() => {
  if (!uploadIdOf(meta.value)) return false
  return isRawRenderable(originalMime.value || props.node.content_type || '')
})
const originalUrl = computed(() => `/api/v1/kb10/${props.kbId}/nodes/${props.node.id}/source`)
const filename = computed(() => String(meta.value.filename || meta.value.original_filename || ''))

// The document body is the PRIMARY node's full content (the original markdown),
// not a join of retrieval chunks — chunks are an indexing detail shown on their
// own tab. Fall back to joined chunks only if the node carries no content.
const body = computed(() => {
  if (fullContent.value) return fullContent.value
  return chunks.value.map((c) => c.content).filter(Boolean).join('\n\n')
})
const wordCount = computed(() => {
  const t = body.value.trim()
  return t ? t.split(/\s+/).length : 0
})

// The original opens fullscreen through the shared OriginalOverlay, which resolves
// the node's /source URL to the file bytes and renders them. The inline header
// trigger only shows when an original exists.
function toggleOriginal() { if (hasOriginal.value) origOpen.value = !origOpen.value }

// ── Read-body "show more" clamp ─────────────────────────────────────────────
// Long rendered bodies are clamped to a max-height with a bottom fade; the
// toggle only appears when the content actually overflows the threshold.
const CLAMP_PX = 720
const bodyRef = ref<HTMLElement | null>(null)
const expanded = ref(false)
const overflows = ref(false)

function measureBody() {
  const el = bodyRef.value
  if (!el) { overflows.value = false; return }
  overflows.value = el.scrollHeight - CLAMP_PX > 24
}
let bodyObserver: ResizeObserver | null = null
function watchBody() {
  bodyObserver?.disconnect()
  const el = bodyRef.value
  if (!el) return
  bodyObserver = new ResizeObserver(() => measureBody())
  bodyObserver.observe(el)
  nextTick(measureBody)
}
const bodyClamped = computed(() => overflows.value && !expanded.value)

// Monotonic id: clicking through documents fires overlapping loads, so a slow
// earlier fetch must not overwrite the document the user is now viewing.
let loadRunId = 0
async function load() {
  if (!props.kbId || !props.node?.id) return
  const run = ++loadRunId
  loading.value = true
  error.value = ''
  fullContent.value = ''
  fullType.value = ''
  chunks.value = []
  chunkTotal.value = 0
  summaryText.value = ''
  tab.value = 'read'
  openChunk.value = {}
  expanded.value = false
  overflows.value = false
  try {
    // The primary node carries the full document content + its content type.
    const [{ data: primary }, { data: kids }, { data: summaries }] = await Promise.all([
      api.get<NodeResponse>(`/api/v1/kb10/${props.kbId}/browse?node_id=${props.node.id}`),
      api.get<ChildrenResponse>(`/api/v1/kb10/${props.kbId}/browse?parent_id=${props.node.id}&node_type=chunk&include_content=true&limit=200`),
      api.get<ChildrenResponse>(`/api/v1/kb10/${props.kbId}/browse?parent_id=${props.node.id}&node_type=summary&include_content=true&limit=1`),
    ])
    if (run !== loadRunId) return
    if (primary?.success && primary.node) {
      fullContent.value = String(primary.node.content || '')
      fullType.value = String(primary.node.content_type || '')
    }
    if (kids?.success) {
      if (!Number.isInteger(kids.total) || kids.total < 0) throw new Error('Invalid chunk total')
      chunkTotal.value = kids.total
      const children: BrowseNode[] = kids.nodes
      chunks.value = children
        .filter((c) => c.node_type === 'chunk')
        .sort((a, b) => Number((a.metadata || {}).index ?? (a.metadata || {}).chunk_index ?? 0) - Number((b.metadata || {}).index ?? (b.metadata || {}).chunk_index ?? 0))
      if (!summaries?.success) throw new Error(summaries?.error || 'could not load summary')
      summaryText.value = summaries.nodes[0]?.content || ''
      if (!fullContent.value) fullContent.value = summaryText.value || props.node.content || ''
    }
    if (!primary?.success && !kids?.success) error.value = primary?.error || kids?.error || 'could not load document'
  } catch (e: any) {
    if (run !== loadRunId) return
    error.value = e?.response?.data?.error || e?.message || 'could not load document'
    host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
  } finally {
    if (run === loadRunId) loading.value = false
  }
}

const tabs = computed<KbTab[]>(() => [
  { id: 'read', label: 'Read', icon: 'tabler:book-2' },
  { id: 'chunks', label: 'Chunks', icon: 'tabler:layout-grid', count: chunkTotal.value || undefined },
])

function toggleChunk(c: BrowseNode) {
  openChunk.value = { ...openChunk.value, [c.id]: !openChunk.value[c.id] }
}

// Re-measure the body whenever the rendered content or the Read tab changes.
watch([body, tab, loading], () => { if (tab.value === 'read' && !loading.value) nextTick(watchBody) })
// An original that no longer exists for the new document closes the pane.
watch(hasOriginal, (has) => { if (!has) origOpen.value = false })
watch(() => props.node?.id, () => load(), { immediate: true })
onBeforeUnmount(() => { bodyObserver?.disconnect() })
</script>

<template>
  <div class="dr">
    <header class="dr-head">
      <span class="dr-badge"><Icon :icon="docIcon(node)" aria-hidden="true" /></span>
      <div class="dr-head-body">
        <div class="dr-head-top">
          <h2 class="dr-title">{{ nodeLabel(node) }}</h2>
          <ViewOriginalButton
            v-if="hasOriginal"
            class="dr-orig-btn"
            :class="{ on: origOpen }"
            :label="origOpen ? 'Hide original' : 'View original'"
            @open="toggleOriginal"
          />
        </div>
        <div class="dr-facts">
          <span v-if="chunkTotal" class="dr-fact"><Icon icon="tabler:layout-grid" />{{ chunkTotal.toLocaleString() }} chunks</span>
          <span v-if="wordCount" class="dr-fact"><Icon icon="tabler:align-left" />{{ wordCount.toLocaleString() }} words</span>
          <span v-if="node.created_at" class="dr-fact" :title="fullDate(node.created_at)"><Icon icon="tabler:clock" />{{ relativeTime(node.created_at) }}</span>
          <a v-if="sourceUrl" class="dr-fact link" :href="sourceUrl" target="_blank" rel="noopener"><Icon icon="tabler:external-link" />Source</a>
        </div>
      </div>
    </header>

    <KbTabs :tabs="tabs" :active="tab" @select="tab = $event as typeof tab" />

    <div v-if="loading" class="dr-skel"><div v-for="i in 6" :key="i" class="dr-skel-line" /></div>
    <div v-else-if="error" class="dr-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /> {{ error }}</div>

    <template v-else>
      <div v-if="tab === 'read'" class="dr-doc">
        <div class="dr-doc-main">
          <KbSummary v-if="summaryText" :text="summaryText" />
          <div v-if="body" class="dr-clamp" :class="{ clamped: bodyClamped }">
            <div ref="bodyRef" class="dr-clamp-inner">
              <wc-resource-view class="dr-rv" :content-type="renderType" :source="body" :filename="filename" />
            </div>
            <div v-if="bodyClamped" class="dr-clamp-fade" aria-hidden="true" />
          </div>
          <button
            v-if="overflows"
            type="button"
            class="dr-more"
            :aria-expanded="expanded"
            @click="expanded = !expanded"
          >
            <Icon :icon="expanded ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
            {{ expanded ? 'Show less' : 'Show more' }}
          </button>
          <div v-if="!body" class="dr-state"><Icon icon="tabler:file-off" aria-hidden="true" /> No readable content was indexed for this document.</div>
        </div>

      </div>

      <div v-else class="dr-chunks">
        <!-- How the document was indexed: each chunk with the contextual prefix the
             enrichment model produced. The summary is surfaced on the Read tab. -->
        <div v-if="!chunks.length" class="dr-state"><Icon icon="tabler:layout-grid" aria-hidden="true" /> This document has no chunks.</div>
        <div
          v-for="(c, i) in chunks"
          :key="c.id"
          class="dr-chunk"
          :class="{ open: openChunk[c.id] }"
        >
          <button type="button" class="dr-chunk-h" :aria-expanded="!!openChunk[c.id]" @click="toggleChunk(c)">
            <span class="dr-chunk-n">{{ i + 1 }}</span>
            <span class="dr-chunk-label">Chunk {{ i + 1 }}</span>
            <Icon class="dr-chunk-chev" :icon="openChunk[c.id] ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
          </button>
          <p v-if="chunkPrefix(c)" class="dr-chunk-cx"><Icon icon="tabler:sparkles" aria-hidden="true" /><span>{{ chunkPrefix(c) }}</span></p>
          <p class="dr-chunk-body" :class="{ clamp: !openChunk[c.id] }">{{ c.content }}</p>
        </div>
      </div>
    </template>

    <OriginalOverlay
      contained
      :open="origOpen && hasOriginal"
      :title="filename || 'Original'"
      :content-type="originalMime || node.content_type || ''"
      :source-url="originalUrl"
      :filename="filename"
      @close="origOpen = false"
    />
  </div>
</template>
