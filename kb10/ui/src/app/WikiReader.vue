<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import {
  type GraphConcept,
  type GraphEdge,
  conceptColor,
  conceptIcon,
  attachedDocIdsOf,
  subPagesOf,
  relatedOf,
  childCountOf,
  isRawRenderable,
  uploadIdOf,
} from './types'
import { KbTabs, type KbTab, OriginalOverlay, KbSummary, ViewOriginalButton } from './shared'

// The wiki reading column. For the selected concept it resolves the DOCUMENT
// nodes attached to it, fetches each one's original ingested source, and renders
// it as one clean prose column through the shared <wc-resource-view> (markdown /
// pdf / image renderers live in their own kickside bundles, never here). A pure
// category with no documents renders its sub-pages as a browse grid. Sub-pages
// and related links live in the meta rail, so the measure stays uncluttered.
const props = defineProps<{
  kbId: string
  concept: GraphConcept | null
  edges: GraphEdge[]
  conceptsById: Map<string, GraphConcept>
}>()
const emit = defineEmits<{
  (e: 'navigate', concept: GraphConcept): void
}>()

interface DocPage {
  id: string
  title: string
  content: string
  contentType: string
  metadata: Record<string, any>
}

function sourceUrl(nodeId: string): string {
  return `/api/v1/kb10/${props.kbId}/nodes/${encodeURIComponent(nodeId)}/source`
}

interface ChunkNode { id: string; content: string; prefix: string }
interface DocChunks { id: string; title: string; summary: string; chunks: ChunkNode[] }

const loading = ref(false)
const error = ref('')
const pages = ref<DocPage[]>([])
const chunkDocs = ref<DocChunks[]>([])
const openChunk = ref<Record<string, boolean>>({})
const docTab = ref<'rendered' | 'chunks'>('rendered')
// The selected original, rendered in the contained full-surface overlay, or null
// when it is closed. Keyed by its source page id so the per-page toggle can show
// the open/closed label for the page it belongs to.
const origPage = ref<{ id: string; contentType: string; sourceUrl: string; title: string } | null>(null)

const chunkCount = computed(() => chunkDocs.value.reduce((n, d) => n + d.chunks.length, 0))
// Per-document summary keyed by node id, for the card at the top of each page.
const summaryById = computed(() => {
  const m = new Map<string, string>()
  for (const d of chunkDocs.value) if (d.summary) m.set(d.id, d.summary)
  return m
})
const hasChunks = computed(() => chunkCount.value > 0 || chunkDocs.value.some((d) => d.summary))
function toggleChunk(id: string) { openChunk.value = { ...openChunk.value, [id]: !openChunk.value[id] } }

// A topic with many docs must not mount every full markdown view at once (it stalls
// the page). With more than one doc each renders collapsed — title + summary — and
// the heavy <wc-resource-view> mounts only when the reader expands that doc. A lone
// doc always renders inline.
const expandedPages = ref<Record<string, boolean>>({})
const multiDoc = computed(() => pages.value.length > 1)
function pageOpen(id: string): boolean { return !multiDoc.value || !!expandedPages.value[id] }
function togglePage(id: string) { expandedPages.value = { ...expandedPages.value, [id]: !expandedPages.value[id] } }
watch(pages, () => { expandedPages.value = {} })

const attachedDocIds = computed(() => attachedDocIdsOf(props.concept, props.edges))
const subPages = computed(() => subPagesOf(props.concept, props.edges, props.conceptsById))
const related = computed(() => relatedOf(props.concept, props.edges, props.conceptsById))

const hasArticle = computed(() => pages.value.length > 0)

type DocTab = 'rendered' | 'chunks'
const docTabs = computed<KbTab[]>(() => {
  const tabs: KbTab[] = [{ id: 'rendered', label: 'Rendered', icon: 'tabler:article' }]
  if (hasChunks.value) tabs.push({ id: 'chunks', label: 'Chunks', icon: 'tabler:layout-grid', count: chunkCount.value || undefined })
  return tabs
})

// The original file behind a page, rendered with the shared <wc-resource-view>
// (same renderer as Uploads). Upload-sourced pages render their raw bytes by
// type (image / pdf / office); a non-upload pdf falls back to the node source.
function originalMime(p: DocPage): string {
  return p.metadata?.original_mime_type || p.metadata?.source_mime || ''
}
function originalOf(p: DocPage): { contentType: string; sourceUrl: string } | null {
  const mime = originalMime(p)
  const uid = uploadIdOf(p.metadata)
  // The node source endpoint streams the original bytes for any ingested file.
  if (uid && isRawRenderable(mime)) return { contentType: mime, sourceUrl: sourceUrl(p.id) }
  if (mime === 'application/pdf') return { contentType: 'application/pdf', sourceUrl: sourceUrl(p.id) }
  return null
}
function toggleOriginal(p: DocPage) {
  if (origPage.value?.id === p.id) { origPage.value = null; return }
  const o = originalOf(p)
  if (o) origPage.value = { id: p.id, contentType: o.contentType, sourceUrl: o.sourceUrl, title: p.title }
}

// The page whose original the inline header trigger controls: the first page on
// the measure that carries a renderable original.
const primaryOriginal = computed<DocPage | null>(() => pages.value.find((p) => originalOf(p)) || null)
const hasOriginal = computed(() => !!primaryOriginal.value)
// The header trigger is open when its primary page's overlay is the one showing.
const primaryOriginalOpen = computed(() => !!primaryOriginal.value && origPage.value?.id === primaryOriginal.value.id)

function provenanceItems(p: DocPage) {
  const m = p.metadata || {}
  const filename = m.filename || m.original_filename
  const url = m.source_url
  const page = m.page ?? m.page_number
  const hasPage = page !== undefined && page !== null && page !== ''
  // Only surface provenance for ingested files/URLs — not plain pasted text,
  // where a bare "MIME: text/plain" row is just noise.
  if (!filename && !url && !hasPage) return []
  const out: { key: string; label: string; value: string; href?: string }[] = []
  const mime = m.original_mime_type || m.source_mime
  if (filename) out.push({ key: 'filename', label: 'File', value: String(filename) })
  if (mime) out.push({ key: 'mime', label: 'Type', value: String(mime) })
  if (url) out.push({ key: 'source', label: 'Source', value: String(url), href: String(url) })
  if (hasPage) out.push({ key: 'page', label: 'Page', value: String(page) })
  return out
}

async function fetchDoc(id: string): Promise<DocPage | null> {
  const { data } = await api.get(`/api/v1/kb10/${props.kbId}/browse?node_id=${encodeURIComponent(id)}`)
  if (!data?.success || !data.node) return null
  const node = data.node
  const content = (node.content || '') as string
  if (!content.trim()) return null
  const metadata = node.metadata || {}
  const title = metadata.title || metadata.filename || metadata.source_url || props.conceptsById.get(id)?.label || 'Document'
  return { id, title, content, contentType: node.content_type || 'text/markdown', metadata }
}

onMounted(() => { loadByTagName('wc-resource-view', { timeoutMs: 10000 }).catch(() => {}) })

// The indexing detail behind a page: the document summary + its chunks (each
// with the contextual prefix the enrichment model added), same as the document KB.
async function fetchChunks(id: string, title: string): Promise<DocChunks | null> {
  try {
    const { data } = await api.get(`/api/v1/kb10/${props.kbId}/browse?parent_id=${encodeURIComponent(id)}&include_content=true&limit=200`)
    if (!data?.success) return null
    const kids = (data.nodes || []) as any[]
    const chunks: ChunkNode[] = kids
      .filter((k) => k.node_type === 'chunk')
      .sort((a, b) => Number((a.metadata || {}).index ?? (a.metadata || {}).chunk_index ?? 0) - Number((b.metadata || {}).index ?? (b.metadata || {}).chunk_index ?? 0))
      .map((k) => ({ id: k.id, content: String(k.content || ''), prefix: String((k.metadata || {}).contextual_prefix || '') }))
    const summary = String((kids.find((k) => k.node_type === 'summary') || {}).content || '')
    if (!chunks.length && !summary) return null
    return { id, title, summary, chunks }
  } catch { return null }
}

// Monotonic id: clicking through concepts fires overlapping loads, so a slow
// earlier fetch must not overwrite the page the user is now on.
let loadRunId = 0
async function load() {
  const c = props.concept
  const run = ++loadRunId
  pages.value = []
  chunkDocs.value = []
  openChunk.value = {}
  error.value = ''
  docTab.value = 'rendered'
  if (!c || !props.kbId) return
  const ids = attachedDocIds.value
  if (!ids.length) return
  loading.value = true
  try {
    const results = await Promise.all(ids.map((id) => fetchDoc(id).catch(() => null)))
    if (run !== loadRunId) return
    pages.value = results.filter((p): p is DocPage => p != null)
    if (!pages.value.length && ids.length) error.value = 'The source for this page could not be loaded.'
    const cs = await Promise.all(pages.value.map((p) => fetchChunks(p.id, p.title)))
    if (run !== loadRunId) return
    chunkDocs.value = cs.filter((d): d is DocChunks => d != null)
  } catch (e: any) {
    if (run !== loadRunId) return
    error.value = e?.response?.data?.error || e?.message || 'could not load this page'
  } finally {
    if (run === loadRunId) loading.value = false
  }
}

watch(() => [props.concept?.id, props.kbId], () => load(), { immediate: true })
watch(() => props.concept?.id, () => { origPage.value = null })
</script>

<template>
  <article v-if="concept" class="wr">
    <!-- The KB header already names the wiki, so the root page skips its own
         title and opens straight into its description + section grid. -->
    <header v-if="!concept.is_root || concept.description" class="wr-head">
      <template v-if="!concept.is_root">
        <div class="wr-title-row">
          <h1 class="wr-title">{{ concept.label || concept.id }}</h1>
          <ViewOriginalButton
            v-if="primaryOriginal"
            class="wr-orig-btn"
            :class="{ on: primaryOriginalOpen }"
            :label="primaryOriginalOpen ? 'Hide original' : 'View original'"
            @open="toggleOriginal(primaryOriginal)"
          />
        </div>
      </template>
      <p v-if="concept.description" class="wr-lede">{{ concept.description }}</p>
    </header>

    <div v-if="loading" class="wr-state">
      <Icon icon="tabler:loader-2" class="spin big" aria-hidden="true" />
      <span>Loading page…</span>
    </div>

    <div v-else-if="error" class="wr-state err">
      <Icon icon="tabler:alert-circle" aria-hidden="true" />
      <span>{{ error }}</span>
    </div>

    <template v-else>
      <KbTabs
        v-if="hasArticle && (hasOriginal || hasChunks)"
        :tabs="docTabs"
        :active="docTab"
        @select="docTab = $event as DocTab"
      />

      <!-- Rendered: the extracted content is markdown, so it always renders
           through the markdown viewer rather than as plain text. -->
      <div v-if="hasArticle && docTab === 'rendered'" class="wr-doc">
        <section v-for="(p, idx) in pages" :key="p.id" class="wr-doc-page">
          <!-- Page separator: the page title, only when several pages stack. The
               original-file trigger sits inline in the reading header. -->
          <div v-if="pages.length > 1" class="wr-doc-head">
            <span class="wr-doc-sep">{{ p.title }}</span>
            <button type="button" class="wr-doc-toggle" :aria-expanded="pageOpen(p.id)" @click="togglePage(p.id)">
              <Icon :icon="pageOpen(p.id) ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
              {{ pageOpen(p.id) ? 'Collapse' : 'Read' }}
            </button>
          </div>
          <KbSummary v-if="summaryById.get(p.id)" :text="summaryById.get(p.id) as string" />
          <wc-resource-view v-if="pageOpen(p.id)" class="wr-rv" content-type="text/markdown" :source="p.content" />
          <div v-if="pageOpen(p.id) && provenanceItems(p).length" class="wr-prov">
            <div v-for="item in provenanceItems(p)" :key="item.key" class="wr-prov-row">
              <span class="wr-prov-k">{{ item.label }}</span>
              <a v-if="item.href" class="wr-prov-v" :href="item.href" target="_blank" rel="noopener noreferrer">{{ item.value }}</a>
              <span v-else class="wr-prov-v">{{ item.value }}</span>
            </div>
          </div>
          <hr v-if="idx < pages.length - 1" class="wr-doc-rule" />
        </section>
      </div>

      <!-- Chunks: how the page was indexed — each chunk with the contextual prefix
           the enrichment model added. The summary is surfaced on the Rendered tab. -->
      <div v-else-if="hasArticle && docTab === 'chunks'" class="wr-chunks">
        <section v-for="d in chunkDocs" :key="d.id" class="wr-chunks-doc">
          <div v-if="chunkDocs.length > 1" class="wr-doc-sep">{{ d.title }}</div>
          <div
            v-for="(c, i) in d.chunks"
            :key="c.id"
            class="wr-chunk"
            :class="{ open: openChunk[c.id] }"
          >
            <button type="button" class="wr-chunk-h" :aria-expanded="!!openChunk[c.id]" @click="toggleChunk(c.id)">
              <span class="wr-chunk-n">{{ i + 1 }}</span>
              <span class="wr-chunk-label">Chunk {{ i + 1 }}</span>
              <Icon class="wr-chunk-chev" :icon="openChunk[c.id] ? 'tabler:chevron-up' : 'tabler:chevron-down'" aria-hidden="true" />
            </button>
            <p v-if="c.prefix" class="wr-chunk-cx"><Icon icon="tabler:sparkles" aria-hidden="true" /><span>{{ c.prefix }}</span></p>
            <p class="wr-chunk-body" :class="{ clamp: !openChunk[c.id] }">{{ c.content }}</p>
          </div>
        </section>
      </div>

      <!-- Pure category: sub-pages as a browse grid that fills the measure. -->
      <div v-else-if="subPages.length" class="wr-grid">
        <button
          v-for="s in subPages"
          :key="s.id"
          class="wr-card"
          :style="{ '--c': conceptColor(s).fill }"
          @click="emit('navigate', s)"
        >
          <span class="wr-card-top">
            <span class="wr-card-ic"><Icon :icon="conceptIcon(s)" aria-hidden="true" /></span>
            <Icon class="wr-card-go" icon="tabler:arrow-up-right" aria-hidden="true" />
          </span>
          <span class="wr-card-name">{{ s.label || s.id }}</span>
          <span v-if="s.description" class="wr-card-desc">{{ s.description }}</span>
          <span class="wr-card-meta">
            <span v-if="s.document_count">{{ s.document_count }} {{ s.document_count === 1 ? 'page' : 'pages' }}</span>
            <span v-if="childCountOf(s.id, edges)">{{ childCountOf(s.id, edges) }} subtopics</span>
            <span v-if="!s.document_count && !childCountOf(s.id, edges)">empty</span>
          </span>
        </button>
      </div>

      <div v-else class="wr-state muted">
        <Icon icon="tabler:notebook-off" aria-hidden="true" />
        <span>This page has no content yet.</span>
      </div>

      <!-- Cross-links: sub-pages (only when an article fills the page; for an
           index the grid already lists them) and related concepts. -->
      <footer v-if="related.length || (hasArticle && subPages.length)" class="wr-foot">
        <div v-if="hasArticle && subPages.length" class="wr-foot-group">
          <span class="wr-foot-h">Sub-pages</span>
          <div class="wr-foot-links">
            <button v-for="s in subPages" :key="s.id" class="wr-foot-link" @click="emit('navigate', s)">
              <span class="wr-foot-dot" :style="{ background: conceptColor(s).fill }" />{{ s.label || s.id }}
            </button>
          </div>
        </div>
        <div v-if="related.length" class="wr-foot-group">
          <span class="wr-foot-h">Related</span>
          <div class="wr-foot-links">
            <button v-for="r in related" :key="r.concept.id" class="wr-foot-link" @click="emit('navigate', r.concept)">
              <span class="wr-foot-dot" :style="{ background: conceptColor(r.concept).fill }" />{{ r.concept.label || r.concept.id }}
              <span class="wr-foot-kind">{{ r.label }}</span>
            </button>
          </div>
        </div>
      </footer>
    </template>

    <!-- Original-file viewer as the contained full-surface modal (position:fixed
         scrim, centered card), no OS fullscreen. -->
    <OriginalOverlay
      contained
      :open="!!origPage"
      :title="origPage?.title || concept?.label || ''"
      :content-type="origPage?.contentType || ''"
      :source-url="origPage?.sourceUrl || ''"
      @close="origPage = null"
    />
  </article>
</template>
