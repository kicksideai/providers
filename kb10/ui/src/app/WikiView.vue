<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import {
  type GraphConcept,
  type GraphEdge,
  type SearchHit,
  type TaxAction,
} from './types'
import { KbShell, IconButton, KbDrawer, KbSearch } from './shared'
import WikiReader from './WikiReader.vue'
import AddPanel from './AddPanel.vue'
import EmptyState from './EmptyState.vue'
import TaxonomyForm from './TaxonomyForm.vue'
import ConceptNavRail from './ConceptNavRail.vue'
import NodeMenu, { type KbMenuItem } from './NodeMenu.vue'
import { useRailResizer } from './useRailResizer'

// The wiki reading surface: the shared folder nav rail beside an open reading area.
// Concept structure edits run through the shared TaxonomyForm, reached from a row's
// kebab / right-click menu or the page bar. Selection and data are owned by the root.
const props = defineProps<{
  kbId: string
  concepts: GraphConcept[]
  edges: GraphEdge[]
  selectedId: string
  canAnswer: boolean
  loading: boolean
}>()
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'changed'): void
  (e: 'reload'): void
}>()

const { navWidth, railRef, navDragging, onStart } = useRailResizer()

const conceptsById = computed(() => {
  const m = new Map<string, GraphConcept>()
  for (const c of props.concepts) m.set(c.id, c)
  return m
})
const selected = computed(() => (props.selectedId ? conceptsById.value.get(props.selectedId) || null : null))
const editable = computed(() => !!selected.value && selected.value.node_type !== 'document')

// child → parent over the hierarchy edges, for the reader breadcrumb.
const parentOf = computed(() => {
  const m = new Map<string, string>()
  for (const e of props.edges) {
    if (e.edge_type === 'subtopic_of' || e.edge_type === 'categorized_as') {
      if (conceptsById.value.has(e.from_node_id) && conceptsById.value.has(e.to_node_id)) {
        m.set(e.from_node_id, e.to_node_id)
      }
    }
  }
  return m
})
const crumbTrail = computed<GraphConcept[]>(() => {
  const out: GraphConcept[] = []
  let id: string | undefined = props.selectedId
  const guard = new Set<string>()
  while (id && !guard.has(id)) {
    guard.add(id)
    const c = conceptsById.value.get(id)
    if (!c) break
    out.unshift(c)
    id = parentOf.value.get(id)
  }
  return out.slice(0, -1).filter((c) => !c.is_root)
})

// ── Concept actions menu (kebab / right-click) + taxonomy ─────────────────────
const menu = ref<{ open: boolean; x: number; y: number; concept: GraphConcept | null }>({
  open: false, x: 0, y: 0, concept: null,
})
const menuItems = computed<KbMenuItem[]>(() => {
  const c = menu.value.concept
  if (!c) return []
  if (c.node_type === 'document') return [{ id: 'open', label: 'Open', icon: 'tabler:arrow-right' }]
  return [
    { id: 'open', label: 'Open', icon: 'tabler:arrow-right' },
    { id: 'sep', divider: true },
    { id: 'add', label: 'Add child', icon: 'tabler:plus' },
    { id: 'rename', label: 'Rename', icon: 'tabler:pencil' },
    { id: 'move', label: 'Move to…', icon: 'tabler:arrow-up-right', disabled: !!c.is_root },
    { id: 'delete', label: 'Delete', icon: 'tabler:trash', danger: true, disabled: !!c.is_root },
  ]
})
function openMenu(p: { concept: GraphConcept; x: number; y: number }) {
  menu.value = { open: true, x: p.x, y: p.y, concept: p.concept }
}
const structBtnRef = ref<any>(null)
function openStructMenu() {
  if (!selected.value) return
  const el = structBtnRef.value?.$el as HTMLElement | undefined
  const r = el?.getBoundingClientRect()
  menu.value = { open: true, x: r ? r.right : 0, y: r ? r.bottom : 0, concept: selected.value }
}
const taxMode = ref<TaxAction | ''>('')
const taxTarget = ref<GraphConcept | null>(null)
function onMenuPick(id: string) {
  const c = menu.value.concept
  if (!c) return
  if (id === 'open') { emit('select', c.id); return }
  taxTarget.value = c
  taxMode.value = id as TaxAction
}
function onTaxSaved(nextId: string) {
  taxMode.value = ''
  if (nextId) emit('select', nextId)
  emit('changed')
}

// ── Search ────────────────────────────────────────────────────────────────────
const searchOpen = ref(false)
function openHit(hit: SearchHit) {
  const target = conceptsById.value.get(hit.id) || (hit.parent_id ? conceptsById.value.get(hit.parent_id) : null)
  if (target) emit('select', target.id)
  searchOpen.value = false
}

// ── Add page drawer ───────────────────────────────────────────────────────────
const sheet = ref<'' | 'add'>('')
function onAdded() { sheet.value = ''; emit('changed') }
</script>

<template>
  <div
    ref="railRef"
    class="wk"
    :class="{ 'wk-dragging': navDragging }"
    :style="{ '--kb-nav-w': navWidth + 'px' }"
  >
    <KbShell v-if="concepts.length">
      <template #rail>
        <div class="kb-railtop">
          <div class="kb-railtop-acts">
            <IconButton icon="tabler:search" label="Search" :active="searchOpen" @click="searchOpen = !searchOpen" />
            <IconButton icon="tabler:plus" label="Add page" @click="sheet = 'add'" />
            <IconButton icon="tabler:refresh" label="Refresh" :disabled="loading" :spin="loading" @click="emit('reload')" />
          </div>
        </div>

        <ConceptNavRail
          :concepts="concepts"
          :edges="edges"
          :selected-id="selectedId"
          @select="(id: string) => emit('select', id)"
          @context="openMenu"
        />

        <div
          class="wn-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize navigation"
          @pointerdown="onStart"
        ><span class="wn-resizer-grip" /></div>
      </template>

      <div v-if="searchOpen" class="kc-main-scroll">
        <KbSearch
          :kb-id="kbId"
          layout="panel"
          :ask="canAnswer"
          placeholder="Search this wiki…"
          @open="openHit"
          @close="searchOpen = false"
        />
      </div>

      <div v-else class="kc-main-scroll wk-doc-inner">
        <div v-if="crumbTrail.length || editable" class="wk-pagebar">
          <nav v-if="crumbTrail.length" class="wk-crumbs" aria-label="Wiki path">
            <template v-for="(c, i) in crumbTrail" :key="c.id">
              <Icon v-if="i" class="wk-crumb-sep" icon="tabler:chevron-right" aria-hidden="true" />
              <button class="wk-crumb" @click="emit('select', c.id)">{{ c.label || c.id }}</button>
            </template>
          </nav>
          <div v-if="editable" class="wk-tools">
            <IconButton
              ref="structBtnRef"
              icon="tabler:dots"
              label="Edit structure"
              size="sm"
              :active="!!taxMode"
              @click="openStructMenu"
            />
          </div>
        </div>

        <TaxonomyForm
          v-if="taxMode"
          :kb-id="kbId"
          :mode="taxMode"
          :target="taxTarget"
          :concepts="concepts"
          :edges="edges"
          @saved="onTaxSaved"
          @close="taxMode = ''"
        />

        <WikiReader
          :kb-id="kbId"
          :concept="selected"
          :edges="edges"
          :concepts-by-id="conceptsById"
          @navigate="(c: GraphConcept) => emit('select', c.id)"
        />
      </div>
    </KbShell>

    <EmptyState
      v-else
      icon="tabler:book-2"
      title="This wiki is empty"
      hint="Add pages to grow it — concepts, their subtopics, and the links between them appear here as a navigable documentation tree."
      cta="Add the first page"
      cta-icon="tabler:plus"
      @cta="sheet = 'add'"
    />

    <KbDrawer :open="sheet === 'add'" title="Add a page" icon="tabler:plus" @close="sheet = ''">
      <AddPanel :kb-id="kbId" noun="page" @changed="onAdded" />
    </KbDrawer>

    <NodeMenu
      :open="menu.open"
      :x="menu.x"
      :y="menu.y"
      :items="menuItems"
      @pick="onMenuPick"
      @close="menu.open = false"
    />
  </div>
</template>
