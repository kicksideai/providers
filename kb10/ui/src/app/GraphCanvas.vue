<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { ForceSim, type SimNode, type SimLink } from './force'
import {
  type GraphConcept,
  type GraphEdge,
  conceptColor,
  truncate,
} from './types'

// The interactive SVG concept canvas: full-bleed, pan/zoom/drag, hover-highlight,
// click-select, search focus. Layout is Pivot MDS (organic, spread, distance-based)
// seeded into a short force relaxation that separates overlaps — fast (a few dozen
// ticks, not the hundreds a cold force start needs) and natural, not a ring. The
// full graph is laid out once and positions stay stable; filtering only changes
// which nodes are visible (see visibleIds), so it never moves a node or the view.
// The host owns data + chrome; this component owns geometry and direct manipulation,
// exposing fit/zoom/focus/relayout via a ref.
const props = defineProps<{
  concepts: GraphConcept[]
  edges: GraphEdge[]
  selectedId: string | null
  highlightIds: ReadonlySet<string>
  // Optional visibility filter: the full graph is laid out once and kept stable;
  // hiding via this set (isolate / depth / concepts-only / hidden) never moves a
  // node, so toggling a filter can't jump the view. null/undefined = all visible.
  visibleIds?: ReadonlySet<string> | null
  colors?: Map<string, { fill: string; stroke: string }>
}>()
function isVisible(id: string): boolean {
  return !props.visibleIds || props.visibleIds.has(id)
}

// Cluster/branch fill for a node, falling back to the concept-type palette.
function nodeFill(c: GraphConcept): { fill: string; stroke: string } {
  return props.colors?.get(c.id) || conceptColor(c)
}
const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'scale', value: number): void
  (e: 'node-context', payload: { id: string; x: number; y: number }): void
  (e: 'node-dblclick', id: string): void
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const tx = ref(0)
const ty = ref(0)
const scale = ref(1)
const ready = ref(false)
watch(scale, (v) => emit('scale', v))

interface RNode { id: string; x: number; y: number; radius: number; concept: GraphConcept; isDoc: boolean }
interface RLink { id: string; edge_type: string; from: string; to: string; path: string }
const rNodes = ref<RNode[]>([])
const rLinks = ref<RLink[]>([])

let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let layoutTries = 0
let lastKey = ''
// Current node positions by id (radial layout output, plus any user drags). The
// source of truth the paint/fit/focus passes read from.
const positions = new Map<string, { x: number; y: number }>()

const hoverId = ref<string | null>(null)
// Labels are cheap in small graphs but SVG text is the dominant render cost in big
// ones, so past a threshold only anchor labels (root / selected / hovered) draw.
const denseLabels = computed(() => props.concepts.length > 220)

// A node is "dimmed" when a search highlight or hover focus is active and it is
// not part of that focus set — the lattice/beacon dimming behaviour.
const focusSet = computed<Set<string> | null>(() => {
  if (props.highlightIds.size) return new Set(props.highlightIds)
  if (hoverId.value) {
    const s = new Set<string>([hoverId.value])
    for (const l of rLinks.value) {
      if (l.from === hoverId.value) s.add(l.to)
      if (l.to === hoverId.value) s.add(l.from)
    }
    return s
  }
  return null
})

function radiusFor(c: GraphConcept): number {
  if (c.node_type === 'document') return 8
  if (c.is_root) return 22
  const degree = (c.edge_count || 0) + (c.document_count || 0)
  return Math.max(11, Math.min(24, 11 + degree * 2))
}

function size(): { w: number; h: number } {
  const r = containerRef.value?.getBoundingClientRect()
  return { w: r?.width || 900, h: r?.height || 640 }
}

function nodeKey(): string {
  return props.concepts.map((c) => c.id).join('|')
}

// A connectivity-aware spread seed: the concept hierarchy laid out radially (root
// center, depth on rings, children fanned under their parent, weighted by subtree
// size). Parent-child are already adjacent and nothing overlaps, so the force pass
// only has to relax it into an organic shape — not expand a clump — which is why it
// converges in a few dozen ticks. A small golden-angle jitter breaks exact ties so
// the Barnes-Hut quadtree never sees two identical points.
function radialSeed(cx: number, cy: number): Map<string, { x: number; y: number }> {
  const concepts = props.concepts
  const byId = new Map(concepts.map((c) => [c.id, c]))
  const childrenOf = new Map<string, string[]>()
  const hasParent = new Set<string>()
  for (const e of props.edges) {
    if (e.edge_type !== 'subtopic_of' && e.edge_type !== 'categorized_as') continue
    if (!byId.has(e.from_node_id) || !byId.has(e.to_node_id)) continue
    const arr = childrenOf.get(e.to_node_id) || []
    arr.push(e.from_node_id)
    childrenOf.set(e.to_node_id, arr)
    hasParent.add(e.from_node_id)
  }
  const roots = concepts.filter((c) => c.is_root || !hasParent.has(c.id)).map((c) => c.id)
  const leaf = new Map<string, number>()
  const computing = new Set<string>()
  const leaves = (id: string): number => {
    const c = leaf.get(id)
    if (c !== undefined) return c
    if (computing.has(id)) return 1
    computing.add(id)
    const kids = childrenOf.get(id) || []
    let nn = kids.length ? 0 : 1
    for (const k of kids) nn += leaves(k)
    nn = Math.max(1, nn)
    leaf.set(id, nn)
    return nn
  }
  for (const r of roots) leaves(r)

  const RING = 150
  const pos = new Map<string, { x: number; y: number }>()
  const placed = new Set<string>()
  const guard = new Set<string>()
  let seq = 0
  const place = (id: string, depth: number, a0: number, a1: number) => {
    if (guard.has(id)) return
    guard.add(id)
    placed.add(id)
    const mid = (a0 + a1) / 2
    const r = depth * RING
    const j = (seq++) * 2.399963
    pos.set(id, { x: cx + r * Math.cos(mid) + Math.cos(j) * 4, y: cy + r * Math.sin(mid) + Math.sin(j) * 4 })
    const kids = childrenOf.get(id) || []
    if (!kids.length) return
    const total = kids.reduce((s, k) => s + leaves(k), 0) || 1
    let a = a0
    for (const k of kids) {
      const span = (a1 - a0) * (leaves(k) / total)
      place(k, depth + 1, a, a + span)
      a += span
    }
  }
  if (roots.length === 1) {
    place(roots[0], 0, -Math.PI / 2, Math.PI * 1.5)
  } else {
    const total = roots.reduce((s, r) => s + leaves(r), 0) || 1
    let a = -Math.PI / 2
    for (const r of roots) { const span = Math.PI * 2 * (leaves(r) / total); place(r, 1, a, a + span); a += span }
  }
  const leftover = concepts.filter((c) => !placed.has(c.id))
  if (leftover.length) {
    let maxR = RING
    for (const p of pos.values()) { const r = Math.hypot(p.x - cx, p.y - cy); if (r > maxR) maxR = r }
    leftover.forEach((c, i) => {
      const a = (i / leftover.length) * Math.PI * 2
      pos.set(c.id, { x: cx + (maxR + RING) * Math.cos(a), y: cy + (maxR + RING) * Math.sin(a) })
    })
  }
  return pos
}

// Layout = radial spread seed → short force relaxation (organic, spread, not a ring).
function computeLayout(): Map<string, { x: number; y: number }> {
  const { w, h } = size()
  const cx = w / 2
  const cy = h / 2
  const concepts = props.concepts
  const n = concepts.length
  const seed = radialSeed(cx, cy)
  if (n < 3) return seed

  const idx = new Map<string, number>()
  concepts.forEach((c, i) => idx.set(c.id, i))
  const simNodes: SimNode[] = concepts.map((c) => {
    const p = seed.get(c.id) || { x: cx, y: cy }
    return { id: c.id, x: p.x, y: p.y, vx: 0, vy: 0, fx: null, fy: null, radius: radiusFor(c) }
  })
  const linkDistance = n > 250 ? 150 : 120
  const charge = n > 250 ? -1100 : -700
  const simLinks: SimLink[] = props.edges
    .filter((e) => idx.has(e.from_node_id) && idx.has(e.to_node_id))
    .map((e) => ({
      source: idx.get(e.from_node_id)!,
      target: idx.get(e.to_node_id)!,
      distance: e.edge_type === 'subtopic_of' ? linkDistance * 0.8 : linkDistance,
      strength: e.edge_type === 'subtopic_of' ? 0.7 : 0.3,
    }))
  const sim = new ForceSim(simNodes, simLinks, w, h, charge)
  // The seed is already spread + connectivity-aware, so a few dozen ticks relax it
  // into an organic shape rather than the hundreds a cold (clumped) start needs.
  const ticks = n > 600 ? 70 : n > 250 ? 110 : 150
  for (let i = 0; i < ticks; i++) sim.tick()
  // Then a spring-free separation pass so no nodes are left overlapping (the force
  // cool can leave dense clusters touching; this cleanly spaces them).
  sim.resolveOverlaps(n > 600 ? 50 : 80)

  const next = new Map<string, { x: number; y: number }>()
  for (const sn of simNodes) next.set(sn.id, { x: sn.x, y: sn.y })
  return next
}

// Recompute the layout and repaint. refit centers the viewport (first load and
// explicit relayouts); later data refreshes keep the user's pan/zoom.
function applyLayout(refit: boolean) {
  const { w, h } = size()
  // The flex container can be unmeasured (0×0) the frame the canvas mounts; wait
  // for a real size so the fit centers correctly (bounded so it can't spin forever).
  if ((w < 2 || h < 2) && layoutTries < 60) {
    layoutTries++
    requestAnimationFrame(() => applyLayout(refit))
    return
  }
  layoutTries = 0
  const next = computeLayout()
  positions.clear()
  for (const [k, v] of next) positions.set(k, v)
  paint()
  if (refit) {
    fit()
    requestAnimationFrame(() => fit())
  }
  ready.value = true
}

// Re-lay out the current node set (e.g. after the depth slider / concepts-only /
// isolation changes which nodes are shown) and re-fit.
function relayout() {
  lastKey = nodeKey()
  applyLayout(true)
}

function syncData() {
  if (!props.concepts.length) {
    rNodes.value = []
    rLinks.value = []
    ready.value = false
    lastKey = ''
    positions.clear()
    return
  }
  const key = nodeKey()
  if (key === lastKey) { paint(); return }
  const first = !lastKey
  lastKey = key
  nextTick(() => applyLayout(first))
}

function paint() {
  rNodes.value = props.concepts
    .filter((c) => isVisible(c.id))
    .map((c) => {
      const p = positions.get(c.id) || { x: 0, y: 0 }
      return { id: c.id, x: p.x, y: p.y, radius: radiusFor(c), concept: c, isDoc: c.node_type === 'document' }
    })

  rLinks.value = props.edges
    .filter((e) => positions.has(e.from_node_id) && positions.has(e.to_node_id)
      && isVisible(e.from_node_id) && isVisible(e.to_node_id))
    .map((e) => {
      const s = positions.get(e.from_node_id)!
      const t = positions.get(e.to_node_id)!
      // Gentle quadratic curve perpendicular to the chord so parallel edges
      // separate and the lattice reads organically, not as a star burst.
      const mx = (s.x + t.x) / 2
      const my = (s.y + t.y) / 2
      const dx = t.x - s.x
      const dy = t.y - s.y
      const len = Math.hypot(dx, dy) || 1
      const bow = Math.min(28, len * 0.12)
      const cx = mx - (dy / len) * bow
      const cy = my + (dx / len) * bow
      return {
        id: e.id,
        path: `M${s.x},${s.y} Q${cx},${cy} ${t.x},${t.y}`,
        edge_type: e.edge_type || '',
        from: e.from_node_id,
        to: e.to_node_id,
      }
    })
}

// Center the whole graph in the viewport with comfortable padding.
function fit() {
  if (!positions.size) return
  const { w, h } = size()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const c of props.concepts) {
    if (!isVisible(c.id)) continue
    const p = positions.get(c.id)
    if (!p) continue
    const r = radiusFor(c)
    minX = Math.min(minX, p.x - r)
    minY = Math.min(minY, p.y - r)
    maxX = Math.max(maxX, p.x + r)
    maxY = Math.max(maxY, p.y + r)
  }
  if (!Number.isFinite(minX)) return
  const pad = Math.max(64, Math.min(w, h) * 0.12)
  minX -= pad; minY -= pad; maxX += pad; maxY += pad
  const bw = Math.max(maxX - minX, 1)
  const bh = Math.max(maxY - minY, 1)
  const s = Math.max(0.25, Math.min(w / bw, h / bh, 1.25))
  scale.value = s
  tx.value = (w - bw * s) / 2 - minX * s
  ty.value = (h - bh * s) / 2 - minY * s
}

// Center the viewport on a node at a comfortable zoom; used by rail/search focus.
function focus(id: string) {
  const p = positions.get(id)
  if (!p) return
  const { w, h } = size()
  const s = Math.max(scale.value, 1.1)
  scale.value = s
  tx.value = w / 2 - p.x * s
  ty.value = h / 2 - p.y * s
}

// ── Pan / zoom ──────────────────────────────────────────────────────────────
let panning = false
let moved = false
let panStart = { x: 0, y: 0, tx: 0, ty: 0 }

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const rect = svgRef.value!.getBoundingClientRect()
  const px = e.clientX - rect.left
  const py = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
  const next = Math.max(0.1, Math.min(6, scale.value * factor))
  tx.value = px - (px - tx.value) * (next / scale.value)
  ty.value = py - (py - ty.value) * (next / scale.value)
  scale.value = next
}

function onBgDown(e: MouseEvent) {
  if (e.button !== 0) return
  panning = true
  moved = false
  panStart = { x: e.clientX, y: e.clientY, tx: tx.value, ty: ty.value }
  window.addEventListener('mousemove', onPanMove)
  window.addEventListener('mouseup', onPanUp)
}
function onPanMove(e: MouseEvent) {
  if (!panning) return
  if (Math.abs(e.clientX - panStart.x) + Math.abs(e.clientY - panStart.y) > 3) moved = true
  tx.value = panStart.tx + (e.clientX - panStart.x)
  ty.value = panStart.ty + (e.clientY - panStart.y)
}
function onPanUp() {
  if (panning && !moved) emit('select', null)
  panning = false
  window.removeEventListener('mousemove', onPanMove)
  window.removeEventListener('mouseup', onPanUp)
}

// ── Node drag (direct reposition; no simulation) ──────────────────────────────
let dragId: string | null = null
let dragMoved = false
let dragStartX = 0
let dragStartY = 0
function onNodeDown(e: MouseEvent, id: string) {
  // Left button only — a right-click is the context menu (handled by @contextmenu).
  if (e.button !== 0) return
  e.stopPropagation()
  if (!positions.has(id)) return
  dragId = id
  dragMoved = false
  dragStartX = e.clientX
  dragStartY = e.clientY
  window.addEventListener('mousemove', onNodeMove)
  window.addEventListener('mouseup', onNodeUp)
}
function onNodeMove(e: MouseEvent) {
  if (!dragId || !svgRef.value) return
  if (!dragMoved) {
    // Sub-threshold movement stays a click, not a drag.
    const ddx = e.clientX - dragStartX
    const ddy = e.clientY - dragStartY
    if (ddx * ddx + ddy * ddy < 9) return
    dragMoved = true
  }
  const rect = svgRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left - tx.value) / scale.value
  const y = (e.clientY - rect.top - ty.value) / scale.value
  if (Number.isFinite(x) && Number.isFinite(y)) {
    positions.set(dragId, { x, y })
    paint()
  }
}
// The second mouseup of a double-click must not fire a second selection toggle —
// otherwise the URL bounces in (select) then straight back out (deselect) before
// @dblclick drills. A tap within the double-click window is left for @dblclick.
let lastNodeUpAt = 0
function onNodeUp() {
  const id = dragId
  const wasDragged = dragMoved
  dragId = null
  window.removeEventListener('mousemove', onNodeMove)
  window.removeEventListener('mouseup', onNodeUp)
  if (wasDragged || !id) return
  const now = Date.now()
  if (now - lastNodeUpAt < 350) { lastNodeUpAt = 0; return }
  lastNodeUpAt = now
  emit('select', props.selectedId === id ? null : id)
}

function zoomBy(factor: number) {
  const { w, h } = size()
  const next = Math.max(0.1, Math.min(6, scale.value * factor))
  tx.value = w / 2 - (w / 2 - tx.value) * (next / scale.value)
  ty.value = h / 2 - (h / 2 - ty.value) * (next / scale.value)
  scale.value = next
}

function dimmed(id: string): boolean {
  return !!focusSet.value && !focusSet.value.has(id)
}

function linkClass(l: RLink): string[] {
  const cls = ['gx-link']
  if (l.edge_type === 'subtopic_of') cls.push('subtopic')
  else cls.push('categorized')
  const fs = focusSet.value
  if (fs) {
    if (fs.has(l.from) && fs.has(l.to)) cls.push('lit')
    else cls.push('faded')
  }
  return cls
}

function showLabel(n: RNode): boolean {
  return !denseLabels.value || n.concept.is_root || n.id === props.selectedId || n.id === hoverId.value
}

watch(
  () => [props.concepts, props.edges] as const,
  () => syncData(),
  { immediate: true, deep: false },
)

// A visibility change repaints over the stable layout — no re-layout, no re-fit, so
// isolating / hiding / depth-sliding never moves a node or the viewport.
watch(() => props.visibleIds, () => { if (lastKey) paint() })

watch(containerRef, (el) => {
  if (el && !resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (!props.concepts.length) return
      if (resizeTimer) clearTimeout(resizeTimer)
      // Resize only re-fits the existing layout — it never re-lays-out.
      resizeTimer = setTimeout(() => { if (lastKey) fit() }, 120)
    })
    resizeObserver.observe(el)
  }
  if (el && props.concepts.length && !lastKey) syncData()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (resizeTimer) clearTimeout(resizeTimer)
  onPanUp()
  window.removeEventListener('mousemove', onNodeMove)
  window.removeEventListener('mouseup', onNodeUp)
})

defineExpose({ fit, focus, zoomBy, relayout })
</script>

<template>
  <div ref="containerRef" class="gx-canvas">
    <svg ref="svgRef" class="gx-svg" @wheel="onWheel" @mousedown="onBgDown" @contextmenu.prevent>
      <defs>
        <pattern id="gx-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" class="gx-grid-dot" />
        </pattern>
      </defs>
      <rect class="gx-grid-bg" x="-50%" y="-50%" width="200%" height="200%" fill="url(#gx-grid)" />

      <g
        :transform="`translate(${tx},${ty}) scale(${scale})`"
        :style="{ opacity: ready ? 1 : 0, transition: 'opacity .35s ease' }"
      >
        <g class="gx-links">
          <path v-for="l in rLinks" :key="l.id" :d="l.path" :class="linkClass(l)" />
        </g>

        <g class="gx-nodes">
          <g
            v-for="n in rNodes"
            :key="n.id"
            :transform="`translate(${n.x},${n.y})`"
            class="gx-node"
            :class="{ dim: dimmed(n.id), sel: n.id === selectedId, hov: n.id === hoverId }"
            @mousedown="onNodeDown($event, n.id)"
            @mouseenter="hoverId = n.id"
            @mouseleave="hoverId = null"
            @contextmenu.prevent.stop="emit('node-context', { id: n.id, x: $event.clientX, y: $event.clientY })"
            @dblclick.stop="emit('node-dblclick', n.id)"
          >
            <circle
              v-if="n.id === selectedId"
              :r="n.radius + 7"
              class="gx-halo"
              :style="{ stroke: nodeFill(n.concept).fill }"
            />
            <rect
              v-if="n.isDoc"
              :x="-8" :y="-6" width="16" height="12" rx="3"
              :fill="nodeFill(n.concept).fill"
              :stroke="nodeFill(n.concept).stroke"
              stroke-width="1.5"
              class="gx-shape"
            />
            <circle
              v-else
              :r="n.radius"
              :fill="nodeFill(n.concept).fill"
              :stroke="nodeFill(n.concept).stroke"
              :stroke-width="n.concept.is_root ? 3 : 2"
              class="gx-shape"
            />
            <template v-if="!n.isDoc && (n.concept.document_count || 0) > 0">
              <circle :cx="n.radius * 0.72" :cy="-n.radius * 0.72" r="7.5" class="gx-badge-bg" />
              <text
                :x="n.radius * 0.72" :y="-n.radius * 0.72"
                text-anchor="middle" dominant-baseline="central"
                class="gx-badge-txt"
              >{{ n.concept.document_count }}</text>
            </template>
            <text
              v-if="showLabel(n)"
              :y="n.isDoc ? 20 : n.radius + 15"
              text-anchor="middle"
              class="gx-label"
              :class="{ root: n.concept.is_root }"
            >{{ truncate(n.concept.label, n.isDoc ? 26 : 24) }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>
