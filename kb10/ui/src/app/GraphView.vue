<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host, loadByTagName } from '@wippy-fe/proxy'
import {
  type GraphConcept,
  type GraphEdge,
  type SearchHit,
  type TaxAction,
  conceptColor,
  buildClusterColors,
} from './types'
import { KbShell, IconButton, KbButton, KbDrawer, KbSearch, OriginalOverlay } from './shared'
import GraphCanvas from './GraphCanvas.vue'
import GraphInspector from './GraphInspector.vue'
import GraphLegend from './GraphLegend.vue'
import GraphControls from './GraphControls.vue'
import GraphDisplayControls from './GraphDisplayControls.vue'
import AddPanel from './AddPanel.vue'
import EmptyState from './EmptyState.vue'
import TaxonomyForm from './TaxonomyForm.vue'
import ConceptNavRail from './ConceptNavRail.vue'
import NodeMenu, { type KbMenuItem } from './NodeMenu.vue'
import { useRailResizer } from './useRailResizer'
import { isRecord, reportHostError } from './hostError'

// The graph reading surface: the same folder nav rail as the wiki view, beside the
// force canvas. Node/branch operations — isolate, hide node, hide branch, taxonomy —
// come from a row's kebab / right-click or a canvas node's right-click. A depth
// slider by the legend peels the graph open level by level. Data and selection are
// owned by the root, so isolating a branch here lands the wiki reader on it too.
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
const canvasRef = ref<InstanceType<typeof GraphCanvas> | null>(null)
const scale = ref(1)
const noHighlight = new Set<string>()

// ── Derived maps ──────────────────────────────────────────────────────────────
const conceptsById = computed(() => {
  const m = new Map<string, GraphConcept>()
  for (const c of props.concepts) m.set(c.id, c)
  return m
})
const selected = computed(() => (props.selectedId ? conceptsById.value.get(props.selectedId) || null : null))
const labelById = computed(() => {
  const m = new Map<string, string>()
  for (const c of props.concepts) m.set(c.id, c.label || c.id.slice(0, 8))
  return m
})
function labelOf(id: string): string { return labelById.value.get(id) || id.slice(0, 8) }
const clusterColors = computed(() => buildClusterColors(props.concepts, props.edges))
function colorOf(id: string): string {
  return clusterColors.value.get(id)?.fill || conceptColor({ id } as GraphConcept).fill
}

// child → parent over ALL hierarchy edges (concepts + documents), for descendants
// (hide/isolate a branch) and depth (the level slider).
const hierParentOf = computed(() => {
  const m = new Map<string, string>()
  for (const e of props.edges) {
    if ((e.edge_type === 'subtopic_of' || e.edge_type === 'categorized_as')
      && conceptsById.value.has(e.from_node_id) && conceptsById.value.has(e.to_node_id)) {
      m.set(e.from_node_id, e.to_node_id)
    }
  }
  return m
})
const childMapAll = computed(() => {
  const m = new Map<string, string[]>()
  for (const e of props.edges) {
    if (e.from_node_id === e.to_node_id) continue
    const arr = m.get(e.to_node_id) || []; arr.push(e.from_node_id); m.set(e.to_node_id, arr)
  }
  return m
})
function descendantsOf(id: string): Set<string> {
  const out = new Set<string>([id])
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop() as string
    for (const ch of childMapAll.value.get(cur) || []) {
      if (!out.has(ch)) { out.add(ch); stack.push(ch) }
    }
  }
  return out
}
// Depth below the root: 0 for a root/parentless node, +1 per hierarchy hop.
const depthOf = computed(() => {
  const m = new Map<string, number>()
  const pm = hierParentOf.value
  const calc = (id: string, seen: Set<string>): number => {
    const cached = m.get(id)
    if (cached !== undefined) return cached
    const p = pm.get(id)
    if (p === undefined || seen.has(id)) { m.set(id, 0); return 0 }
    seen.add(id)
    const d = calc(p, seen) + 1
    m.set(id, d)
    return d
  }
  for (const c of props.concepts) calc(c.id, new Set())
  return m
})
// Depth is measured from the isolation root: when a branch is isolated, the level
// slider counts levels from THAT node (base = its global depth), not the global
// root. With nothing isolated, base = 0 so it counts from the top as before.
const baseDepth = computed(() => (focusId.value ? (depthOf.value.get(focusId.value) ?? 0) : 0))
function relDepth(id: string): number { return (depthOf.value.get(id) ?? 0) - baseDepth.value }
const maxLevel = computed(() => {
  let mx = 1
  const fset = focusSet.value
  for (const c of props.concepts) {
    if (fset && !fset.has(c.id)) continue
    const d = relDepth(c.id)
    if (d > mx) mx = d
  }
  return mx
})

// ── Exploration: depth slider / isolate / hide ────────────────────────────────
const levelCap = ref(99)
const effectiveLevel = computed(() => Math.min(levelCap.value, maxLevel.value))
const hidden = ref<Set<string>>(new Set())
const focusId = ref<string | null>(null)
// Concepts-only: drop document nodes. Orthogonal to the depth slider — they filter
// on different axes (node kind vs. hierarchy level) and combine.
const conceptsOnly = ref(false)
// All filters below only change which nodes are visible (via visibleIds). Layout
// stays put, so none of them reposition nodes or move the viewport.
function setLevel(v: number) { levelCap.value = v }
function hideNode(id: string) {
  const s = new Set(hidden.value); s.add(id); hidden.value = s
  if (props.selectedId && s.has(props.selectedId)) emit('select', '')
}
function hideBranch(id: string) {
  const s = new Set(hidden.value)
  for (const d of descendantsOf(id)) s.add(d)
  hidden.value = s
  if (props.selectedId && s.has(props.selectedId)) emit('select', '')
}
const focusConceptNode = computed(() =>
  focusId.value ? props.concepts.find((c) => c.id === focusId.value) || null : null)
const focusSet = computed<Set<string> | null>(() => (focusId.value ? descendantsOf(focusId.value) : null))
function isolateBranch(id: string) {
  focusId.value = focusId.value === id ? null : id
  // Carry the branch into the shared selection so switching to the wiki opens it.
  if (focusId.value) emit('select', id)
}
// Double-click a node: isolate from there. Always sets (never toggles) so you can
// keep double-clicking down into sub-branches, going a layer deeper each time.
function drillIsolate(id: string) {
  focusId.value = id
  emit('select', id)
}
// Step the isolation up one level to the parent branch (or out to the whole graph
// once the parent is a root) — the "back to parent" control.
function focusUp() {
  if (!focusId.value) return
  const p = hierParentOf.value.get(focusId.value)
  if (p && conceptsById.value.has(p) && !conceptsById.value.get(p)?.is_root) {
    focusId.value = p
    emit('select', p)
  } else {
    focusId.value = null
  }
}
const focusParentLabel = computed(() => {
  if (!focusId.value) return ''
  const p = hierParentOf.value.get(focusId.value)
  const pc = p ? conceptsById.value.get(p) : null
  return pc && !pc.is_root ? (pc.label || 'parent') : 'all'
})
function clearFocus() {
  focusId.value = null
}
function resetView() {
  hidden.value = new Set()
  focusId.value = null
  levelCap.value = 99
  conceptsOnly.value = false
}
// Isolating / drilling / stepping up changes the depth origin, so reset the slider
// to show the whole (new) subtree — the levels then count from the isolated node.
watch(focusId, () => { levelCap.value = 99 })

// Which nodes are visible. The canvas lays out the FULL graph once and keeps those
// positions stable; the filters (isolate / depth / concepts-only / hidden) only
// change this set, so toggling them never repositions nodes or moves the viewport
// (no jump). null = everything visible (fast path).
const visibleIds = computed<Set<string> | null>(() => {
  const fset = focusSet.value
  if (!fset && !conceptsOnly.value && !hidden.value.size && effectiveLevel.value >= maxLevel.value) return null
  const out = new Set<string>()
  for (const c of props.concepts) {
    if (fset && !fset.has(c.id)) continue
    if (relDepth(c.id) > effectiveLevel.value) continue
    if (conceptsOnly.value && c.node_type === 'document') continue
    if (hidden.value.has(c.id)) continue
    out.add(c.id)
  }
  return out
})

function selectConcept(id: string) {
  emit('select', id)
  canvasRef.value?.focus(id)
}

// ── Actions menu (kebab / right-click on rows and canvas nodes) ───────────────
const menu = ref<{ open: boolean; x: number; y: number; concept: GraphConcept | null }>({
  open: false, x: 0, y: 0, concept: null,
})
const menuItems = computed<KbMenuItem[]>(() => {
  const c = menu.value.concept
  if (!c) return []
  const items: KbMenuItem[] = [
    { id: 'open', label: 'Open', icon: 'tabler:arrow-right' },
    { id: 'isolate', label: focusId.value === c.id ? 'Clear isolation' : 'Isolate branch', icon: 'tabler:focus-2' },
    { id: 'hide', label: 'Hide node', icon: 'tabler:eye-off' },
    { id: 'hide-branch', label: 'Hide branch', icon: 'tabler:binary-tree' },
  ]
  if (c.node_type !== 'document') {
    items.push(
      { id: 'sep', divider: true },
      { id: 'add', label: 'Add child', icon: 'tabler:plus' },
      { id: 'rename', label: 'Rename', icon: 'tabler:pencil' },
      { id: 'move', label: 'Move to…', icon: 'tabler:arrow-up-right', disabled: !!c.is_root },
      { id: 'delete', label: 'Delete', icon: 'tabler:trash', danger: true, disabled: !!c.is_root },
    )
  }
  return items
})
function openMenuAt(concept: GraphConcept, x: number, y: number) { menu.value = { open: true, x, y, concept } }
function onNodeContext(p: { id: string; x: number; y: number }) {
  const c = conceptsById.value.get(p.id)
  if (c) openMenuAt(c, p.x, p.y)
}
function onMenuPick(id: string) {
  const c = menu.value.concept
  if (!c) return
  switch (id) {
    case 'open': selectConcept(c.id); break
    case 'isolate': isolateBranch(c.id); break
    case 'hide': hideNode(c.id); break
    case 'hide-branch': hideBranch(c.id); break
    default: taxTarget.value = c; taxMode.value = id as TaxAction; break
  }
}

// ── Taxonomy (shared form, in a drawer) ───────────────────────────────────────
const taxMode = ref<TaxAction | ''>('')
const taxTarget = ref<GraphConcept | null>(null)
const taxTitle = computed(() => (
  { add: 'Add child concept', rename: 'Rename concept', move: 'Move concept', delete: 'Delete concept' } as Record<TaxAction, string>
)[taxMode.value as TaxAction] || '')
function onTaxSaved(nextId: string) {
  taxMode.value = ''
  if (nextId) emit('select', nextId)
  emit('changed')
}

// ── Search → focus / open source ──────────────────────────────────────────────
const searchOpen = ref(false)
function openHit(h: SearchHit) {
  searchOpen.value = false
  const id = h.parent_id || h.id
  if (id && props.concepts.some((c) => c.id === id)) selectConcept(id)
}

// ── Inspector + original-file overlay ─────────────────────────────────────────
const selectedEdges = computed(() =>
  props.selectedId
    ? props.edges.filter((e) => e.from_node_id === props.selectedId || e.to_node_id === props.selectedId)
    : [])
const origPage = ref<{ contentType: string; sourceUrl: string; title: string } | null>(null)
// The selected node's primary original, resolved by the inspector. It drives the
// inline "View original" trigger and is the payload the trigger opens.
const availOriginal = ref<{ contentType: string; sourceUrl: string; title: string } | null>(null)
watch(() => props.selectedId, () => { origPage.value = null; availOriginal.value = null })
// The inline trigger toggles the selected node's original overlay.
function toggleOriginal() {
  if (origPage.value) { origPage.value = null; return }
  if (availOriginal.value) origPage.value = availOriginal.value
}
const sparse = computed(() => props.concepts.length > 0 && props.concepts.length < 2)

// ── Drawers (add content / treatment) ─────────────────────────────────────────
type Panel = 'add' | 'treatment' | null
const panel = ref<Panel>(null)
function onChanged() { emit('changed') }

// ── Treatment (concept dedup) settings + manual run ───────────────────────────
const treatmentEnabled = ref(false)
const treatmentModel = ref('class:fast')
const treatmentPrompt = ref('')
const treatmentBusy = ref(false)
async function loadTreatment() {
  if (!props.kbId) return
  try {
    const { data } = await api.get<unknown>(`/api/v1/knowledge/${props.kbId}`)
    if (!isRecord(data)) return
    const config = (isRecord(data.knowledge_base) && data.knowledge_base.config) || data.config
    const c = isRecord(config) ? config : {}
    treatmentEnabled.value = c.treatment_enabled === true
    if (typeof c.treatment_model === 'string' && c.treatment_model) treatmentModel.value = c.treatment_model
    if (typeof c.treatment_prompt === 'string') treatmentPrompt.value = c.treatment_prompt
  } catch (_) { /* keep defaults */ }
}
async function saveTreatment() {
  if (!props.kbId || treatmentBusy.value) return
  treatmentBusy.value = true
  try {
    await api.put(`/api/v1/knowledge/${props.kbId}`, { config: {
      treatment_enabled: treatmentEnabled.value,
      treatment_model: treatmentModel.value,
      treatment_prompt: treatmentPrompt.value,
    } })
    try { host?.toast?.('Treatment settings saved') } catch (_) {}
  } catch (e) { try { reportHostError(e) } catch (_) {} } finally { treatmentBusy.value = false }
}
async function runTreatment() {
  if (!props.kbId || treatmentBusy.value) return
  treatmentBusy.value = true
  try {
    await api.post(`/api/v1/knowledge/${props.kbId}/treatment`, {})
    try { host?.toast?.('Treatment started — duplicate concepts will be merged.') } catch (_) {}
  } catch (e) { try { reportHostError(e) } catch (_) {} } finally { treatmentBusy.value = false }
}
function onTreatModel(e: any) {
  const v = e && (e.detail ?? (e.target && e.target.value))
  if (typeof v === 'string' && v) treatmentModel.value = v
}

onMounted(() => {
  loadByTagName('wc-resource-view', { timeoutMs: 10000 }).catch(() => {})
  loadByTagName('wc-model-picker', { timeoutMs: 10000 }).catch(() => {})
  loadTreatment()
})
watch(() => props.kbId, () => { hidden.value = new Set(); focusId.value = null; levelCap.value = 99; conceptsOnly.value = false; loadTreatment() })
</script>

<template>
  <div
    ref="railRef"
    class="gx"
    :class="{ 'wk-dragging': navDragging }"
    :style="{ '--kb-nav-w': navWidth + 'px' }"
  >
    <KbShell v-if="concepts.length">
      <template #rail>
        <div class="kb-railtop">
          <div class="kb-railtop-acts">
            <IconButton icon="tabler:search" label="Search" :active="searchOpen" @click="searchOpen = !searchOpen" />
            <IconButton icon="tabler:plus" label="Add content" :active="panel === 'add'" @click="panel = 'add'" />
            <IconButton icon="tabler:wand" label="Treatment" :active="panel === 'treatment'" @click="panel = 'treatment'" />
            <IconButton icon="tabler:refresh" label="Refresh" :disabled="loading" :spin="loading" @click="emit('reload')" />
          </div>
        </div>

        <ConceptNavRail
          :concepts="concepts"
          :edges="edges"
          :selected-id="selectedId"
          @select="selectConcept"
          @context="(p: { concept: GraphConcept; x: number; y: number }) => openMenuAt(p.concept, p.x, p.y)"
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
          @open="openHit"
          @close="searchOpen = false"
        />
      </div>

      <div v-else class="gx-canvas-wrap">
        <GraphCanvas
          ref="canvasRef"
          :concepts="concepts"
          :edges="edges"
          :visible-ids="visibleIds"
          :colors="clusterColors"
          :selected-id="selectedId || null"
          :highlight-ids="noHighlight"
          @select="emit('select', $event || '')"
          @scale="scale = $event"
          @node-context="onNodeContext"
          @node-dblclick="drillIsolate"
        />

        <div class="gx-botleft">
          <GraphLegend />
          <GraphDisplayControls
            :level="effectiveLevel"
            :max-level="maxLevel"
            :concepts-only="conceptsOnly"
            :hidden-count="hidden.size"
            :focused="!!focusId"
            @update:level="setLevel"
            @toggle-concepts="conceptsOnly = !conceptsOnly"
            @reset="resetView"
          />
        </div>

        <GraphControls
          :scale="scale"
          @zoom-in="canvasRef?.zoomBy(1.25)"
          @zoom-out="canvasRef?.zoomBy(0.8)"
          @fit="canvasRef?.fit()"
        />

        <Transition name="gx-ins-fade">
          <div v-if="focusConceptNode" class="gx-focusbar">
            <button class="gx-focusbar-up" :title="`Back to ${focusParentLabel}`" @click="focusUp">
              <Icon icon="tabler:arrow-up" aria-hidden="true" />
            </button>
            <Icon class="gx-focusbar-ic" icon="tabler:focus-2" aria-hidden="true" />
            <span class="gx-focusbar-name">{{ focusConceptNode.label || 'concept' }}</span>
            <button class="gx-focusbar-x" title="Show the whole graph" @click="clearFocus">
              <Icon icon="tabler:x" aria-hidden="true" />
            </button>
          </div>
        </Transition>

        <Transition name="gx-ins-fade">
          <GraphInspector
            v-if="selected"
            :kb-id="kbId"
            :concept="selected"
            :edges="selectedEdges"
            :label-of="labelOf"
            :color-of="colorOf"
            :original-open="!!origPage"
            @select="selectConcept($event)"
            @close="emit('select', '')"
            @original-available="availOriginal = $event"
            @toggle-original="toggleOriginal"
          />
        </Transition>

        <Transition name="gx-ins-fade">
          <div v-if="sparse" class="gx-sparse">
            <Icon icon="tabler:plant-2" aria-hidden="true" />
            <span>Add more content to grow the graph.</span>
            <button class="gx-sparse-cta" @click="panel = 'add'">
              <Icon icon="tabler:plus" aria-hidden="true" /> Add content
            </button>
          </div>
        </Transition>
      </div>
    </KbShell>

    <EmptyState
      v-else
      icon="tabler:topology-star-3"
      title="No concepts yet"
      hint="Add documents to start building the concept graph — relationships are extracted automatically."
      cta="Add content"
      cta-icon="tabler:plus"
      @cta="panel = 'add'"
    />

    <KbDrawer :open="panel === 'add'" title="Add content" icon="tabler:plus" @close="panel = null">
      <AddPanel :kb-id="kbId" noun="document" @changed="onChanged" />
    </KbDrawer>

    <KbDrawer :open="panel === 'treatment'" title="Concept treatment" icon="tabler:wand" @close="panel = null">
      <div class="gx-treat">
        <label class="gx-treat-check">
          <input type="checkbox" v-model="treatmentEnabled">
          <span>Auto-merge duplicate concepts after each ingest</span>
        </label>
        <div class="ap-field">
          <span class="ap-label">Model</span>
          <wc-model-picker :value="treatmentModel" capability="generate" @select="onTreatModel"></wc-model-picker>
        </div>
        <div class="ap-field">
          <span class="ap-label">Prompt <span class="ap-opt">optional</span></span>
          <textarea v-model="treatmentPrompt" rows="3" class="ap-textarea"
            placeholder="Extra rules for the treatment agent…"></textarea>
        </div>
        <div class="gx-treat-actions">
          <KbButton variant="soft" :disabled="treatmentBusy" @click="saveTreatment">Save</KbButton>
          <KbButton variant="primary" :disabled="treatmentBusy" @click="runTreatment">Run now</KbButton>
        </div>
        <p class="gx-treat-hint">Merges duplicate / near-duplicate concept nodes. Runs automatically after ingest when enabled, or on demand here.</p>
      </div>
    </KbDrawer>

    <KbDrawer :open="!!taxMode" :title="taxTitle" icon="tabler:sitemap" @close="taxMode = ''">
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
    </KbDrawer>

    <OriginalOverlay
      contained
      :open="!!origPage"
      :title="origPage?.title || selected?.label || ''"
      :content-type="origPage?.contentType || ''"
      :source-url="origPage?.sourceUrl || ''"
      @close="origPage = null"
    />

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
