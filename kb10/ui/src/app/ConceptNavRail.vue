<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import {
  type GraphConcept,
  type GraphEdge,
  buildTree,
  indexTree,
  levelEntries,
  navPath,
  searchTree,
} from './types'
import WikiNav from './WikiNav.vue'

// The shared concept navigation rail, identical in the wiki and graph views: a
// filter over a file-manager nav — a breadcrumb of the current folder over a flat
// list of its direct children. Folders (concepts with subtopics) drill in; leaves
// (documents / childless concepts) just select. Browsing one level at a time keeps
// the rail narrow instead of an indented tree that grows horizontally. Selection is
// owned by the host; this emits the picks and the per-row actions menu request.
const props = defineProps<{ concepts: GraphConcept[]; edges: GraphEdge[]; selectedId: string }>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'context', payload: { concept: GraphConcept; x: number; y: number }): void
}>()

const tree = computed(() => buildTree(props.concepts, props.edges))
const treeIndex = computed(() => indexTree(tree.value))
const navFolderId = ref('')
const navQuery = ref('')
const navFolderNode = computed(() => treeIndex.value.byId.get(navFolderId.value))
const navCrumbs = computed<GraphConcept[]>(() =>
  navFolderId.value ? navPath(navFolderId.value, treeIndex.value.byId, treeIndex.value.parentOf) : [])
const navEntries = computed(() => levelEntries(navFolderNode.value))
const navResults = computed(() =>
  searchTree(navQuery.value, treeIndex.value.byId, treeIndex.value.parentOf))

function folderForNode(id: string): string {
  const node = treeIndex.value.byId.get(id)
  if (node && node.children.length) return id
  const parent = treeIndex.value.parentOf.get(id)
  if (parent) return parent
  return tree.value[0]?.concept.id || id
}
function rootFolder(): string {
  return tree.value[0]?.concept.id || ''
}
function reconcileFolder(id: string) {
  const folder = id ? folderForNode(id) : (navFolderId.value || rootFolder())
  if (folder && folder !== navFolderId.value) navFolderId.value = folder
}
function enterFolder(c: GraphConcept) { navFolderId.value = c.id; navQuery.value = ''; emit('select', c.id) }
function openLeaf(c: GraphConcept) { emit('select', c.id) }
function goUp() {
  const parent = treeIndex.value.parentOf.get(navFolderId.value)
  if (parent) { navFolderId.value = parent; emit('select', parent) }
}

// Keep the rail browsing the folder that holds the open node (deep link / jump).
// Graph view can intentionally have no selected node while the canvas shows the
// whole graph; in that state the rail still needs to open at the root.
watch(() => props.selectedId, (id) => reconcileFolder(id), { immediate: true })
// Recover when a refresh / delete strands navFolderId on a vanished node.
watch([() => treeIndex.value, navFolderId], () => {
  if (navFolderId.value && treeIndex.value.byId.has(navFolderId.value)) return
  const fallback = props.selectedId ? folderForNode(props.selectedId) : rootFolder()
  if (fallback) navFolderId.value = fallback
}, { immediate: true })
</script>

<template>
  <div class="cn">
    <div class="wn-filter">
      <Icon class="wn-filter-ic" icon="tabler:filter-search" aria-hidden="true" />
      <input
        v-model="navQuery"
        class="wn-filter-input"
        type="text"
        placeholder="Filter topics & pages…"
        aria-label="Filter the contents"
      />
      <button v-if="navQuery" class="wn-filter-x" aria-label="Clear filter" @click="navQuery = ''">
        <Icon icon="tabler:x" aria-hidden="true" />
      </button>
    </div>
    <nav class="kx-rail-body" aria-label="Contents">
      <WikiNav
        :crumbs="navCrumbs"
        :entries="navEntries"
        :selected-id="selectedId"
        :query="navQuery"
        :results="navResults"
        @open="openLeaf"
        @enter="enterFolder"
        @up="goUp"
        @context="(p) => emit('context', p)"
      />
    </nav>
  </div>
</template>
