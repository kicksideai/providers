<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { type BrowseNode, nodeLabel } from './types'
import { docIcon, docBadge, relativeTime } from './docMeta'
import { useKbBrowse, type DocumentScope } from './useKbBrowse'
import {
  KbShell, RailHeader, IconButton, SearchField, KbNotice, KbDrawer, KbConfirm, KbSearch, KbTabs,
} from './shared'
import EmptyState from './EmptyState.vue'
import DocReader from './DocReader.vue'
import AddPanel from './AddPanel.vue'

// Document KB detail (kx-kb-document): a two-pane library composed on the shared
// chrome — a compact document rail flush against an open reading area that
// renders the document through <wc-resource-view> (markdown / pdf / image /
// office), with the original file previewable alongside the extracted text.
// Mirrors the wiki's borderless rail + reader so both KB types read the same.
interface P { config?: { kb_id?: string; route?: string } | null }
interface E {
  navigate: string
}
const props = useProps<P>()
const emit = useEvents<E>()
const kbId = computed(() => props.value.config?.kb_id || '')
const routeParam = computed(() => props.value.config?.route || '')
let applyingRoute = false
const scope = ref<DocumentScope>('documents')
const tabs = [
  { id: 'documents', label: 'Documents' },
  { id: 'failures', label: 'Indexing failures' },
]
const listTitle = computed(() => scope.value === 'documents' ? 'Documents' : 'Indexing failures')

// Browse + delete + realtime reconciliation come from the shared composable.
// Pagination is server-side: documents holds only the current page, total is the
// real match count, and the pager walks pages.
const { loading, notice, indexingNotice, documents, deleting, reload, remove, findDoc,
  page, pageSize, total, hasPrev, hasNext, next, prev } =
  useKbBrowse(() => kbId.value, { includeIndexing: true, scope: () => scope.value })

// The filter is page-local: it narrows the documents already loaded for the
// current page, not the whole KB. Server-side search is out of scope, so this is
// deliberately not a global search — the count keeps showing the true total.
const q = ref('')
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? documents.value.filter((n) => nodeLabel(n).toLowerCase().includes(s)) : documents.value
})

// "A-B of TOTAL" for the current window. rangeEnd clamps to total so the last,
// possibly short, page reads correctly.
const rangeStart = computed(() => (total.value === 0 ? 0 : page.value * pageSize.value + 1))
const rangeEnd = computed(() => Math.min((page.value + 1) * pageSize.value, total.value))

const selectedId = ref('')
const linkedDocument = ref<BrowseNode | null>(null)
const selected = computed(() => {
  if (deleting.value[selectedId.value]) return null
  return findDoc(selectedId.value) || (linkedDocument.value?.id === selectedId.value ? linkedDocument.value : null)
})
let routeRequest = 0

const addOpen = ref(false)
const searchOpen = ref(false)
const confirmTarget = ref<BrowseNode | null>(null)
const confirmBusy = computed(() => !!confirmTarget.value && !!deleting.value[confirmTarget.value.id])

function select(n: BrowseNode) {
  if (deleting.value[n.id]) return
  const changed = selectedId.value !== n.id
  selectedId.value = n.id
  if (changed && !applyingRoute) emit('navigate', n.id)
}
function selectById(id: string) {
  const n = findDoc(id)
  if (n) { select(n); searchOpen.value = false }
}

function selectScope(id: string) {
  if (id === scope.value) return
  routeRequest++
  searchOpen.value = false
  selectedId.value = ''
  linkedDocument.value = null
  q.value = ''
  scope.value = id === 'failures' ? 'failures' : 'documents'
}

function askRemove(n: BrowseNode) { confirmTarget.value = n }
async function doRemove() {
  const n = confirmTarget.value
  if (!n) return
  const ok = await remove(n)
  if (ok) {
    if (selectedId.value === n.id) selectedId.value = ''
    confirmTarget.value = null
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (searchOpen.value) searchOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  loadByTagName('wc-resource-view', { timeoutMs: 10000 }).catch(() => {})
})
onBeforeUnmount(() => {
  routeRequest++
  window.removeEventListener('keydown', onKeydown)
})

// Honor a deep-linked doc id once the list lands; else keep the current one,
// else open the first.
watch(documents, (docs) => {
  if (linkedDocument.value && findDoc(linkedDocument.value.id)) linkedDocument.value = null
  if (selected.value) return
  const available = docs.filter((doc) => !deleting.value[doc.id])
  const wanted = routeParam.value ? available.find((doc) => doc.id === routeParam.value) : null
  const target = wanted || available[0]
  if (target) { applyingRoute = true; try { select(target) } finally { applyingRoute = false } }
  else if (!findDoc(selectedId.value)) selectedId.value = ''
})

watch(kbId, () => { selectedId.value = '' })

watch([kbId, routeParam], async ([id, route]) => {
  const request = ++routeRequest
  if (linkedDocument.value?.id !== route) linkedDocument.value = null
  if (!id || !route || route === selectedId.value) return
  let target = findDoc(route)
  if (!target) {
    try {
      const { data } = await api.get(`/api/v1/kb10/${id}/browse?node_id=${encodeURIComponent(route)}`)
      if (request !== routeRequest || data?.node?.node_type !== 'document' || data.node.parent_id) return
      target = data.node as BrowseNode
    } catch {
      return
    }
  }
  selectScope(target.metadata?.status === 'failed' ? 'failures' : 'documents')
  linkedDocument.value = findDoc(target.id) ? null : target
  applyingRoute = true
  try { select(target) } finally { applyingRoute = false }
}, { immediate: true })
</script>

<template>
  <div class="kb-page kd">
    <KbNotice v-if="notice" class="kd-notice">{{ notice }}</KbNotice>
    <KbNotice v-if="indexingNotice" class="kd-notice" role="status">{{ indexingNotice }}</KbNotice>

    <KbShell>
      <template #rail>
        <RailHeader :title="listTitle" :count="total">
          <template #actions>
            <IconButton v-if="scope === 'documents'" icon="tabler:search" label="Search" :active="searchOpen" @click="searchOpen = !searchOpen" />
            <IconButton icon="tabler:plus" label="Add document" :active="addOpen" @click="addOpen = true" />
          </template>
        </RailHeader>

        <KbTabs :tabs="tabs" :active="scope" @select="selectScope" />

        <div class="kd-filter">
          <SearchField v-model="q" :placeholder="scope === 'failures' ? 'Filter indexing failures…' : 'Filter documents…'" />
        </div>

        <nav class="kd-list" :aria-label="listTitle">
          <div v-if="loading && !documents.length" class="kd-list-skel"><div v-for="i in 6" :key="i" class="kd-skel-row" /></div>
          <div
            v-for="n in filtered"
            :key="n.id"
            class="kd-row"
            :class="{ on: selectedId === n.id }"
          >
            <button class="kd-row-select" type="button" :disabled="!!deleting[n.id]" @click="select(n)">
              <span class="kd-row-ic"><Icon :icon="docIcon(n)" aria-hidden="true" /></span>
              <span class="kd-row-main">
                <span class="kd-row-title">{{ nodeLabel(n) }}</span>
                <span class="kd-row-sub">{{ docBadge(n) }}<template v-if="n.created_at"> · {{ relativeTime(n.created_at) }}</template></span>
              </span>
            </button>
            <IconButton
              class="kd-row-del"
              icon="tabler:trash"
              :label="`Delete ${nodeLabel(n)}`"
              variant="danger"
              size="sm"
              :spin="!!deleting[n.id]"
              :disabled="!!deleting[n.id]"
              @click="askRemove(n)"
            />
          </div>
          <div v-if="!loading && !filtered.length" class="kd-list-empty">
            <template v-if="scope === 'failures'">{{ documents.length ? 'No indexing failures match.' : 'No indexing failures.' }}</template>
            <template v-else>{{ documents.length ? 'No documents match.' : 'No documents yet — add one with +.' }}</template>
          </div>
        </nav>

        <div v-if="total > pageSize" class="kd-pager">
          <IconButton icon="tabler:chevron-left" label="Previous page" size="sm" :disabled="!hasPrev" @click="prev" />
          <span class="kd-pager-label">{{ rangeStart }}–{{ rangeEnd }} of {{ total }}</span>
          <IconButton icon="tabler:chevron-right" label="Next page" size="sm" :disabled="!hasNext" @click="next" />
        </div>
      </template>

      <div class="kx-main-scroll kd-reader">
        <KbSearch v-if="searchOpen" :kb-id="kbId" layout="panel" ask @open="(h) => h.parent_id && selectById(h.parent_id)" @close="searchOpen = false" />
        <DocReader v-else-if="selected" :kb-id="kbId" :node="selected" />
        <EmptyState
          v-else
          class="kd-empty"
          icon="tabler:files"
          title="Select a document"
          hint="Pick a document from the list to read it here."
          tone="muted"
        />
      </div>
    </KbShell>

    <KbDrawer :open="addOpen" title="Add to library" icon="tabler:plus" @close="addOpen = false">
      <AddPanel :kb-id="kbId" noun="document" @changed="addOpen = false; reload()" />
    </KbDrawer>

    <KbConfirm
      :open="!!confirmTarget"
      danger
      icon="tabler:trash"
      title="Delete document"
      :subtitle="confirmTarget ? nodeLabel(confirmTarget) : ''"
      confirm-label="Delete"
      :busy="confirmBusy"
      @cancel="confirmTarget = null"
      @confirm="doRemove"
    >
      Remove <strong>{{ confirmTarget ? nodeLabel(confirmTarget) : '' }}</strong> from this library? It and its indexed chunks are deleted; the change applies once indexing catches up.
    </KbConfirm>
  </div>
</template>
