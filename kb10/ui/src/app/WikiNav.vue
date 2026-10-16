<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import {
  type GraphConcept,
  type NavEntry,
  type NavSearchResult,
  conceptColor,
  conceptIcon,
  treeIcon,
} from './types'

// The wiki navigation rail as a file manager: a header naming the current folder
// (with an up control) over a flat (un-indented) list of its direct children —
// folders (subtopics) drill in, leaves (documents) open in the reader. The full
// path lives in the reader's breadcrumb, so the rail names only where it is, not
// the whole trail. A search query replaces the level list with a flat result
// list, each result showing the path that locates it.
const props = defineProps<{
  // Ancestor crumbs from a root down to and including the current folder; only
  // the last (the current folder) is shown here, the rest drive the up control.
  crumbs: GraphConcept[]
  // Direct children of the current folder, pre-ordered (folders first).
  entries: NavEntry[]
  // The node currently open in the reader (lit in the list).
  selectedId: string
  // Active search query and its flat results (drives the search view).
  query: string
  results: NavSearchResult[]
}>()
const emit = defineEmits<{
  // Open a leaf (document / childless concept) in the reader.
  (e: 'open', concept: GraphConcept): void
  // Drill into a folder (also opens its page in the reader).
  (e: 'enter', concept: GraphConcept): void
  // Step up one level to the parent folder.
  (e: 'up'): void
  // Open the per-concept actions menu (kebab click or right-click), at viewport x/y.
  (e: 'context', payload: { concept: GraphConcept; x: number; y: number }): void
}>()

function onKebab(e: MouseEvent, concept: GraphConcept) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  emit('context', { concept, x: r.right, y: r.bottom })
}
function onCtx(e: MouseEvent, concept: GraphConcept) {
  emit('context', { concept, x: e.clientX, y: e.clientY })
}

const searching = computed(() => props.query.trim().length > 0)
const canGoUp = computed(() => props.crumbs.length > 1)
const currentFolder = computed(() => props.crumbs[props.crumbs.length - 1] || null)
// Documents may carry no label; show a readable fallback rather than a raw id.
function lbl(c: GraphConcept) {
  return c.label || (c.node_type === 'document' ? 'Untitled page' : c.id)
}

function pickEntry(entry: NavEntry) {
  if (entry.isFolder) emit('enter', entry.concept)
  else emit('open', entry.concept)
}
function pickResult(r: NavSearchResult) {
  if (r.isFolder) emit('enter', r.concept)
  else emit('open', r.concept)
}
const focusedId = ref('')
const visibleRows = computed(() => searching.value ? props.results : props.entries)
function optionTabindex(id: string) {
  const rows = visibleRows.value
  const active = rows.find(row => row.concept.id === focusedId.value)
    || rows.find(row => row.concept.id === props.selectedId)
    || rows[0]
  return active?.concept.id === id ? 0 : -1
}
function onOptionKey(event: KeyboardEvent, row: NavEntry | NavSearchResult) {
  if (event.target !== event.currentTarget) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (row.isFolder) emit('enter', row.concept)
    else emit('open', row.concept)
    return
  }
  const target = event.currentTarget as HTMLElement
  const options = Array.from(target.parentElement!.querySelectorAll<HTMLElement>('[role="option"]'))
  const index = options.indexOf(target)
  let next: number
  switch (event.key) {
    case 'ArrowDown': next = Math.min(index + 1, options.length - 1); break
    case 'ArrowUp': next = Math.max(index - 1, 0); break
    case 'Home': next = 0; break
    case 'End': next = options.length - 1; break
    default: return
  }
  event.preventDefault()
  options[next]?.focus()
}

</script>

<template>
  <div class="wn">
    <!-- Folder header: where the rail is, with an up control. The full path is
         carried by the reader's breadcrumb, so the rail names only this level. -->
    <div v-if="!searching && currentFolder" class="wn-folder">
      <button
        v-if="canGoUp"
        class="wn-up"
        aria-label="Up one level"
        @click="emit('up')"
      ><Icon icon="tabler:corner-left-up" aria-hidden="true" /></button>
      <span class="wn-folder-name" :title="lbl(currentFolder)">{{ lbl(currentFolder) }}</span>
    </div>

    <!-- Search results: a flat list across the whole tree, each with its path. -->
    <ul v-if="searching" class="wn-list" role="listbox" aria-label="Search results">
      <li
        v-for="r in results"
        :key="r.concept.id"
        class="wn-item"
        :class="{ active: r.concept.id === selectedId, folder: r.isFolder }"
        role="option"
        :tabindex="optionTabindex(r.concept.id)"
        @focus="focusedId = r.concept.id"
        @keydown="onOptionKey($event, r)"
        :aria-selected="r.concept.id === selectedId"
        @click="pickResult(r)"
        @contextmenu.prevent="onCtx($event, r.concept)"
      >
        <span class="wn-ico" :style="{ color: conceptColor(r.concept).fill }">
          <Icon :icon="r.isFolder ? conceptIcon(r.concept) : treeIcon(r.concept)" aria-hidden="true" />
        </span>
        <span class="wn-item-text">
          <span class="wn-label">{{ lbl(r.concept) }}</span>
          <span v-if="r.path.length" class="wn-path">
            <template v-for="(p, i) in r.path" :key="p.id">
              <span v-if="i" class="wn-path-sep">/</span>{{ p.label || p.id }}
            </template>
          </span>
        </span>
        <button
          class="wn-kebab"
          aria-label="Concept actions"
          @click.stop="onKebab($event, r.concept)"
        ><Icon icon="tabler:dots-vertical" aria-hidden="true" /></button>
        <Icon v-if="r.isFolder" class="wn-go" icon="tabler:chevron-right" aria-hidden="true" />
      </li>
      <li v-if="!results.length" class="wn-empty">No matches.</li>
    </ul>

    <!-- Current level: direct children only, flat (folders first, then docs). -->
    <ul v-else class="wn-list" role="listbox" aria-label="Folder contents">
      <li
        v-for="entry in entries"
        :key="entry.concept.id"
        class="wn-item"
        :class="{ active: entry.concept.id === selectedId, folder: entry.isFolder }"
        role="option"
        :tabindex="optionTabindex(entry.concept.id)"
        @focus="focusedId = entry.concept.id"
        @keydown="onOptionKey($event, entry)"
        :aria-selected="entry.concept.id === selectedId"
        @click="pickEntry(entry)"
        @contextmenu.prevent="onCtx($event, entry.concept)"
      >
        <span class="wn-ico" :style="{ color: conceptColor(entry.concept).fill }">
          <Icon :icon="entry.isFolder ? conceptIcon(entry.concept) : treeIcon(entry.concept)" aria-hidden="true" />
        </span>
        <span class="wn-label">{{ lbl(entry.concept) }}</span>
        <span v-if="entry.isFolder" class="wn-count">{{ entry.childCount }}</span>
        <button
          class="wn-kebab"
          aria-label="Concept actions"
          @click.stop="onKebab($event, entry.concept)"
        ><Icon icon="tabler:dots-vertical" aria-hidden="true" /></button>
        <Icon v-if="entry.isFolder" class="wn-go" icon="tabler:chevron-right" aria-hidden="true" />
      </li>
      <li v-if="!entries.length" class="wn-empty">This level is empty.</li>
    </ul>
  </div>
</template>
