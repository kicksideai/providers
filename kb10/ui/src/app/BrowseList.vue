<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { type BrowseNode, nodeLabel, truncate } from './types'
import { useKbBrowse } from './useKbBrowse'
import { KbNotice, KbLoading } from './shared'
import EmptyState from './EmptyState.vue'

// Rich content browse for the kb10 detail UIs: a document/page list with
// metadata, a lazy content preview, and delete. Browse, delete, and realtime
// reconciliation come from useKbBrowse; the per-row preview is loaded on expand
// and is specific to this list. Emits `changed` after a matched delete
// materializes so the host can refresh KB header stats; `add` routes the
// empty-state CTA to the Add tab.
const props = defineProps<{ kbId: string; itemNoun?: string; itemIcon?: string; openId?: string | null }>()
const emit = defineEmits<{ (e: 'changed'): void; (e: 'add'): void }>()

const rootRef = ref<HTMLElement | null>(null)

const { loading, notice, documents, deleting, reload, remove } = useKbBrowse(
  () => props.kbId,
  { onChanged: () => emit('changed') },
)

const expanded = ref<Record<string, boolean>>({})
// Per-node preview, loaded lazily on expand: the document summary (or joined
// chunk content) plus a resolved chunk count when the row metadata lacks one.
const preview = ref<Record<string, { content: string; chunks: number; loading: boolean }>>({})

const noun = computed(() => props.itemNoun || 'Documents')
const icon = computed(() => props.itemIcon || 'tabler:file-text')

function fmtDate(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function meta(n: BrowseNode) {
  return n.metadata || {}
}

async function loadContent(n: BrowseNode) {
  if (preview.value[n.id]) return
  preview.value = { ...preview.value, [n.id]: { content: '', chunks: 0, loading: true } }
  try {
    const { data } = await api.get(
      `/api/v1/kb10/${props.kbId}/browse?parent_id=${n.id}&include_content=true&limit=50`,
    )
    let content = ''
    let chunks = 0
    if (data?.success) {
      const children = (data.nodes || []) as BrowseNode[]
      chunks = children.filter((c) => c.node_type === 'chunk').length
      const summary = children.find((c) => c.node_type === 'summary')
      content = summary?.content
        || children
          .filter((c) => c.node_type === 'chunk' || c.node_type === 'summary')
          .map((c) => c.content)
          .filter(Boolean)
          .join('\n\n')
    }
    preview.value = { ...preview.value, [n.id]: { content, chunks, loading: false } }
  } catch {
    // preview is best-effort; the row stays usable without it.
    preview.value = { ...preview.value, [n.id]: { content: '', chunks: 0, loading: false } }
  }
}

function chunkCount(n: BrowseNode): number {
  const m = meta(n)
  if (typeof m.chunk_count === 'number') return m.chunk_count
  return preview.value[n.id]?.chunks || 0
}

async function toggle(n: BrowseNode) {
  const next = !expanded.value[n.id]
  expanded.value = { ...expanded.value, [n.id]: next }
  if (next) await loadContent(n)
}

// Open a specific document on request (e.g. a search result picked in the graph):
// expand it, load its preview, and scroll it into view once the list has it.
watch(
  () => [props.openId, documents.value] as const,
  async () => {
    const id = props.openId
    if (!id || !documents.value.some((n) => n.id === id)) return
    if (!expanded.value[id]) {
      expanded.value = { ...expanded.value, [id]: true }
      await loadContent(documents.value.find((n) => n.id === id)!)
    }
    await nextTick()
    rootRef.value?.querySelector(`[data-node="${id}"]`)?.scrollIntoView({ block: 'center' })
  },
  { immediate: true },
)

defineExpose({ reload })
</script>

<template>
  <div ref="rootRef" class="bl">
    <KbNotice v-if="notice" tone="info">{{ notice }}</KbNotice>

    <KbLoading v-if="loading" />

    <div v-else-if="documents.length" class="bl-list">
      <div v-for="n in documents" :key="n.id" :data-node="n.id" class="bl-row" :class="{ open: expanded[n.id] }">
        <button class="bl-main" @click="toggle(n)">
          <span class="bl-ico"><Icon :icon="icon" aria-hidden="true" /></span>
          <span class="bl-body">
            <span class="bl-title">{{ nodeLabel(n) }}</span>
            <span class="bl-meta">
              <span v-if="chunkCount(n)" class="bl-m"><Icon icon="tabler:puzzle" />{{ chunkCount(n) }} chunks</span>
              <span v-if="n.content_type" class="bl-m mono">{{ n.content_type }}</span>
              <span v-if="meta(n).source_url" class="bl-m mono">{{ truncate(meta(n).source_url, 48) }}</span>
              <span v-if="fmtDate(n.created_at)" class="bl-m"><Icon icon="tabler:calendar" />{{ fmtDate(n.created_at) }}</span>
              <span v-if="n.node_type && n.node_type !== 'document'" class="bl-kind">{{ n.node_type }}</span>
            </span>
          </span>
          <Icon class="bl-chev" :icon="expanded[n.id] ? 'tabler:chevron-down' : 'tabler:chevron-right'" aria-hidden="true" />
        </button>
        <button class="bl-del" :disabled="deleting[n.id]" :title="`Delete ${nodeLabel(n)}`" @click.stop="remove(n)">
          <Icon :icon="deleting[n.id] ? 'tabler:loader-2' : 'tabler:trash'" :class="deleting[n.id] && 'spin'" aria-hidden="true" />
        </button>
        <div v-if="expanded[n.id]" class="bl-preview">
          <div v-if="preview[n.id]?.loading" class="bl-noprev"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading preview…</div>
          <p v-else-if="preview[n.id]?.content" class="bl-prose">{{ truncate(preview[n.id].content, 1200) }}</p>
          <div v-else class="bl-noprev"><Icon icon="tabler:file-off" aria-hidden="true" /> No preview available.</div>
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="!notice"
      :icon="icon"
      :title="`No ${noun.toLowerCase()} yet`"
      hint="Add content to populate this knowledge base — paste or write it on the Add tab."
      cta="Add content"
      cta-icon="tabler:plus"
      @cta="emit('add')"
    />
  </div>
</template>
