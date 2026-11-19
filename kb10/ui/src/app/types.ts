// Shared data shapes + helpers for the kb10 detail UIs (document/graph/wiki).

export interface BrowseNode {
  id: string
  parent_id?: string | null
  node_type?: string
  content_type?: string
  content?: string
  metadata?: Record<string, any>
  external_source?: string
  external_id?: string
  created_at?: string
  updated_at?: string
}

export interface GraphConcept {
  id: string
  node_type?: string
  label?: string
  concept_type?: string
  description?: string
  is_root?: boolean
  parent_id?: string | null
  document_count?: number
  edge_count?: number
}

export interface GraphEdge {
  id: string
  from_node_id: string
  to_node_id: string
  from_label?: string
  to_label?: string
  edge_type?: string
  weight?: number
}

export interface SearchHit {
  id: string
  content?: string
  node_type?: string
  parent_id?: string | null
  score?: number
  similarity?: number
  llm_score?: number
  metadata?: Record<string, any>
}

// Best human label from a node/hit's metadata: an explicit label/title, else the
// source filename (filename / original_filename — what the upload pipeline records
// for an ingested document), else the source url, else the given fallback.
export function metaLabel(metadata: Record<string, any> | null | undefined, fallback = ''): string {
  const m = metadata || {}
  return m.label || m.title || m.source_ref?.title || m.filename || m.original_filename || m.source_url || fallback
}

export function nodeLabel(n: BrowseNode): string {
  return metaLabel(n.metadata, n.id)
}

// The source document a retrieval hit came from, for labelling search results.
export function hitDocTitle(h: SearchHit): string {
  return metaLabel(h.metadata, '')
}

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {}
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function contentDeletePayload(n: BrowseNode): Record<string, any> {
  const metadata = asObject(n.metadata)
  const sourceRef = { ...asObject(metadata.source_ref) }
  delete sourceRef.thread_id
  delete sourceRef.thread_event_id
  delete sourceRef.thread_event_seq
  delete sourceRef.external_version

  return {
    external_id: n.external_id || metadata.external_id || sourceRef.external_id || n.id,
    upload_id: str(sourceRef.upload_id) || str(metadata.upload_id) || undefined,
    source_url: str(sourceRef.source_url) || str(sourceRef.url) || str(metadata.source_url) || undefined,
    metadata: {
      title: metadata.title || metadata.filename || metadata.source_url,
      node_id: n.id,
    },
    source_ref: Object.keys(sourceRef).length ? sourceRef : undefined,
  }
}

export function truncate(text: string | undefined, max: number): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text
}

const ENGINE_MISSING = /engine .*not installed|no .*engine|unavailable/i
export function isEngineMissing(msg: string): boolean {
  return ENGINE_MISSING.test(msg || '')
}
export const ENGINE_NOTICE =
  "This knowledge base's engine is not installed; its contents are unavailable."

// Concept-type palette, mirrored from the source GraphTab. Each maps to a fill
// and a darker stroke; document nodes get the neutral slot.
export const NODE_COLORS: Record<string, { fill: string; stroke: string }> = {
  root: { fill: '#6366f1', stroke: '#4f46e5' },
  topic: { fill: '#8b5cf6', stroke: '#7c3aed' },
  technology: { fill: '#06b6d4', stroke: '#0891b2' },
  person: { fill: '#3b82f6', stroke: '#2563eb' },
  organization: { fill: '#f59e0b', stroke: '#d97706' },
  location: { fill: '#10b981', stroke: '#059669' },
  event: { fill: '#ef4444', stroke: '#dc2626' },
  process: { fill: '#14b8a6', stroke: '#0d9488' },
  product: { fill: '#f97316', stroke: '#ea580c' },
  document: { fill: '#94a3b8', stroke: '#64748b' },
}

export function conceptColor(c: GraphConcept): { fill: string; stroke: string } {
  if (c.node_type === 'document') return NODE_COLORS.document
  if (c.is_root) return NODE_COLORS.root
  const key = (c.concept_type || '').toLowerCase()
  return NODE_COLORS[key] || NODE_COLORS.topic
}

export const EDGE_LABELS: Record<string, string> = {
  subtopic_of: 'subtopic',
  categorized_as: 'in',
}

// ── Cluster/branch coloring ───────────────────────────────────────────────
// Color the graph by which top-level branch a node belongs to, so related
// concepts share a hue and clusters read at a glance. Within a branch the color
// FLOWS from the branch top down to its leaves: deep and saturated at the top,
// easing lighter and softer toward the deepest descendants. The shade is
// normalized by each branch's own depth, so a shallow branch and a deep one both
// get the full, gentle top-to-bottom gradient instead of the shading clamping out
// a few levels down. Documents take a desaturated tint of their branch a step
// lighter than their parent; roots get the fixed root color; orphans a neutral.
//
// Hues are spread around the wheel (curated anchors, then a golden-angle offset
// once the anchors are exhausted) so even many branches stay distinguishable.
const BRANCH_HUES = [262, 199, 24, 142, 348, 280, 48, 173, 217, 320, 96, 15]
function branchHue(index: number): number {
  if (index < BRANCH_HUES.length) return BRANCH_HUES[index]
  // Past the curated set, walk the wheel by the golden angle for max separation.
  return Math.round((BRANCH_HUES[0] + (index - BRANCH_HUES.length + 1) * 137.508) % 360)
}
function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`
}

// Lightness/saturation band the gradient flows across, from a branch's top (T)
// to its deepest leaf (B). A wide band so the top-to-bottom flow is clearly
// visible — deep, saturated roots reading distinctly lighter and softer at the
// leaves. The denominator is capped (see `span` below) so even a deep branch keeps
// a real per-level step instead of the shade flattening out across many levels.
const L_TOP = 34
const L_BOTTOM = 88
const S_TOP = 78
const S_BOTTOM = 38

export function buildClusterColors(
  concepts: GraphConcept[],
  edges: GraphEdge[],
): Map<string, { fill: string; stroke: string }> {
  const byId = new Map(concepts.map((c) => [c.id, c]))
  // Hierarchy parent: from = child/document, to = parent concept.
  const parentOf = new Map<string, string>()
  for (const e of edges) {
    if (e.edge_type !== 'subtopic_of' && e.edge_type !== 'categorized_as') continue
    if (byId.has(e.from_node_id) && byId.has(e.to_node_id)) parentOf.set(e.from_node_id, e.to_node_id)
  }
  const isRoot = (id: string) => !!byId.get(id)?.is_root

  // The branch (top-level topic) a node sits under, and its depth below it.
  function branchAndDepth(id: string): { branch: string; depth: number } {
    const guard = new Set<string>()
    let cur = id
    let depth = 0
    while (!guard.has(cur)) {
      guard.add(cur)
      const p = parentOf.get(cur)
      if (p === undefined || isRoot(p)) return { branch: cur, depth }
      cur = p
      depth++
    }
    return { branch: cur, depth }
  }

  // First pass: branch + depth per node, and the deepest level each branch reaches
  // (so the gradient can normalize to it).
  const info = new Map<string, { branch: string; depth: number }>()
  const branchDepth = new Map<string, number>()
  for (const c of concepts) {
    if (c.is_root) continue
    const bd = branchAndDepth(c.id)
    info.set(c.id, bd)
    branchDepth.set(bd.branch, Math.max(branchDepth.get(bd.branch) ?? 0, bd.depth))
  }

  // Stable hue per branch in label order, so colors never shuffle across reloads.
  const branches = [...new Set([...info.values()].map((v) => v.branch))]
    .sort((a, b) => (byId.get(a)?.label || '').localeCompare(byId.get(b)?.label || ''))
  const hueOf = new Map<string, number>()
  branches.forEach((b, i) => hueOf.set(b, branchHue(i)))

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  const out = new Map<string, { fill: string; stroke: string }>()
  for (const c of concepts) {
    if (c.is_root) { out.set(c.id, { ...NODE_COLORS.root }); continue }
    const bd = info.get(c.id)
    if (!bd) { out.set(c.id, { ...NODE_COLORS.topic }); continue }
    const h = hueOf.get(bd.branch) ?? 220
    // 0 at the branch top, 1 at its deepest leaf — the position the color flows to.
    // The depth the gradient spans is capped so the first few levels each get a
    // strong, distinct step; only a very deep branch flattens toward the leaf shade.
    const span = Math.min(Math.max(branchDepth.get(bd.branch) ?? 0, 1), 4)
    const t = Math.min(1, bd.depth / span)
    if (c.node_type === 'document') {
      const l = Math.min(84, lerp(L_TOP, L_BOTTOM, t) + 6)
      out.set(c.id, { fill: hsl(h, 32, l), stroke: hsl(h, 32, Math.max(50, l - 14)) })
    } else {
      const l = lerp(L_TOP, L_BOTTOM, t)
      const s = lerp(S_TOP, S_BOTTOM, t)
      out.set(c.id, { fill: hsl(h, s, l), stroke: hsl(h, s, Math.max(28, l - 17)) })
    }
  }
  return out
}

// One-word kind label for a concept/document node, used as the reader eyebrow.
export function conceptTypeLabel(c: GraphConcept): string {
  if (c.concept_type) return c.concept_type
  return c.node_type === 'document' ? 'page' : 'concept'
}

// ── Tree (wiki) ─────────────────────────────────────────────────────────────
// A concept hierarchy built from /graph data: subtopic_of / categorized_as edges
// define parent → child. Concepts are branches, documents are leaves.
export interface TreeNode {
  concept: GraphConcept
  children: TreeNode[]
  depth: number
}

// Inline taxonomy edit modes for the wiki meta rail.
export type TaxAction = 'add' | 'rename' | 'move' | 'delete'

const CHILD_EDGES = new Set(['subtopic_of', 'categorized_as'])

// Build a forest from concepts + edges. A `subtopic_of`/`categorized_as` edge
// points from child → parent (from_node_id is the child). Roots are concepts
// flagged is_root, or any node with no resolved parent. Cycles are broken by a
// visited set so a malformed graph can't loop the renderer.
export function buildTree(concepts: GraphConcept[], edges: GraphEdge[]): TreeNode[] {
  const byId = new Map<string, GraphConcept>()
  for (const c of concepts) byId.set(c.id, c)

  const childrenOf = new Map<string, string[]>()
  const hasParent = new Set<string>()
  for (const e of edges) {
    if (!CHILD_EDGES.has(e.edge_type || '')) continue
    if (!byId.has(e.from_node_id) || !byId.has(e.to_node_id)) continue
    const list = childrenOf.get(e.to_node_id) || []
    list.push(e.from_node_id)
    childrenOf.set(e.to_node_id, list)
    hasParent.add(e.from_node_id)
  }

  const sortByLabel = (a: string, b: string) =>
    (byId.get(a)?.label || '').localeCompare(byId.get(b)?.label || '')

  function build(id: string, depth: number, seen: Set<string>): TreeNode | null {
    const concept = byId.get(id)
    if (!concept || seen.has(id)) return null
    seen.add(id)
    const kids = (childrenOf.get(id) || []).slice().sort(sortByLabel)
    const children: TreeNode[] = []
    for (const kid of kids) {
      const node = build(kid, depth + 1, seen)
      if (node) children.push(node)
    }
    return { concept, children, depth }
  }

  const rootIds = concepts
    .filter((c) => c.is_root || !hasParent.has(c.id))
    .map((c) => c.id)
    .sort(sortByLabel)

  const seen = new Set<string>()
  const roots: TreeNode[] = []
  for (const id of rootIds) {
    const node = build(id, 0, seen)
    if (node) roots.push(node)
  }
  // Surface any concept stranded by a cycle so nothing is silently dropped.
  for (const c of concepts) {
    if (!seen.has(c.id)) {
      const node = build(c.id, 0, seen)
      if (node) roots.push(node)
    }
  }
  return roots
}

// ── File-manager navigation (wiki rail) ──────────────────────────────────────
// The rail browses the hierarchy one level at a time, like a file manager: a
// breadcrumb of ancestors and a flat list of the current folder's direct
// children. A folder is a concept with children (drill into it); a leaf is a
// document or a childless concept (open it in the reader).
export interface NavEntry {
  concept: GraphConcept
  isFolder: boolean
  childCount: number
}

// A flat index of every concept's TreeNode, so the rail can resolve a folder's
// children and its ancestor path without re-walking the forest each render.
export function indexTree(roots: TreeNode[]): {
  byId: Map<string, TreeNode>
  parentOf: Map<string, string>
} {
  const byId = new Map<string, TreeNode>()
  const parentOf = new Map<string, string>()
  const walk = (node: TreeNode, parent: string | null) => {
    byId.set(node.concept.id, node)
    if (parent) parentOf.set(node.concept.id, parent)
    for (const c of node.children) walk(c, node.concept.id)
  }
  for (const r of roots) walk(r, null)
  return { byId, parentOf }
}

// The direct children of a folder as ordered nav entries: folders (concepts with
// their own children) first by label, then leaves (documents / childless
// concepts) by label. Deterministic, never DB order.
export function levelEntries(node: TreeNode | undefined): NavEntry[] {
  if (!node) return []
  const entries = node.children.map((c) => ({
    concept: c.concept,
    isFolder: c.children.length > 0,
    childCount: c.children.length,
  }))
  return entries.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    return (a.concept.label || a.concept.id).localeCompare(b.concept.label || b.concept.id)
  })
}

// The ancestor path from a root down to (and including) a node id, for the
// breadcrumb. Walks the indexed parent map; cycle-guarded.
export function navPath(
  id: string,
  byId: Map<string, TreeNode>,
  parentOf: Map<string, string>,
): GraphConcept[] {
  const out: GraphConcept[] = []
  const guard = new Set<string>()
  let cur: string | undefined = id
  while (cur && !guard.has(cur)) {
    guard.add(cur)
    const node = byId.get(cur)
    if (!node) break
    out.unshift(node.concept)
    cur = parentOf.get(cur)
  }
  return out
}

// A flat, ranked result list for the rail search: every concept/document whose
// label contains the query, each carrying the ancestor path that locates it.
// Folders sort before leaves, then by label, so results read deterministically.
export interface NavSearchResult {
  concept: GraphConcept
  isFolder: boolean
  path: GraphConcept[]
}
export function searchTree(
  query: string,
  byId: Map<string, TreeNode>,
  parentOf: Map<string, string>,
): NavSearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: NavSearchResult[] = []
  for (const node of byId.values()) {
    const label = (node.concept.label || node.concept.id).toLowerCase()
    if (!label.includes(q)) continue
    const path = navPath(node.concept.id, byId, parentOf)
    out.push({ concept: node.concept, isFolder: node.children.length > 0, path: path.slice(0, -1) })
  }
  return out.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    return (a.concept.label || a.concept.id).localeCompare(b.concept.label || b.concept.id)
  }).slice(0, 200)
}

export function treeIcon(c: GraphConcept): string {
  if (c.node_type === 'document') return 'tabler:file-text'
  if (c.is_root) return 'tabler:hierarchy-2'
  return 'tabler:point-filled'
}

// A richer icon for a concept by its semantic type, used where a card or header
// wants more than the generic tree glyph (document/root still defer to treeIcon).
const CONCEPT_ICONS: Record<string, string> = {
  technology: 'tabler:cpu',
  person: 'tabler:user',
  organization: 'tabler:building',
  location: 'tabler:map-pin',
  event: 'tabler:calendar-event',
  process: 'tabler:route',
  product: 'tabler:package',
  topic: 'tabler:bookmark',
}
export function conceptIcon(c: GraphConcept): string {
  if (c.node_type === 'document') return 'tabler:file-text'
  if (c.is_root) return 'tabler:hierarchy-2'
  return CONCEPT_ICONS[(c.concept_type || '').toLowerCase()] || 'tabler:folder'
}

// ── Edge-derived relations (shared by the reader and the meta rail) ───────────
// Document nodes attached to a concept via categorized_as (document → concept).
// A document concept renders its own node as the page.
export function attachedDocIdsOf(concept: GraphConcept | null, edges: GraphEdge[]): string[] {
  if (!concept) return []
  if (concept.node_type === 'document') return [concept.id]
  const ids: string[] = []
  const seen = new Set<string>()
  for (const e of edges) {
    if (e.edge_type === 'categorized_as' && e.to_node_id === concept.id && !seen.has(e.from_node_id)) {
      seen.add(e.from_node_id)
      ids.push(e.from_node_id)
    }
  }
  return ids
}

// Concepts a document is categorized under (document → concept, the inverse of
// attachedDocIdsOf). These are the document's reference links into the graph.
export function conceptIdsForDoc(docId: string, edges: GraphEdge[]): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = []
  const seen = new Set<string>()
  for (const e of edges) {
    if (e.edge_type === 'categorized_as' && e.from_node_id === docId && !seen.has(e.to_node_id)) {
      seen.add(e.to_node_id)
      out.push({ id: e.to_node_id, label: e.to_label || '' })
    }
  }
  return out
}

// Concepts nested directly under one (subtopic_of, child → parent), label-sorted.
export function subPagesOf(
  concept: GraphConcept | null,
  edges: GraphEdge[],
  conceptsById: Map<string, GraphConcept>,
): GraphConcept[] {
  if (!concept) return []
  const out: GraphConcept[] = []
  const seen = new Set<string>()
  for (const e of edges) {
    if (e.edge_type !== 'subtopic_of' || e.to_node_id !== concept.id || seen.has(e.from_node_id)) continue
    const child = conceptsById.get(e.from_node_id)
    if (!child) continue
    seen.add(e.from_node_id)
    out.push(child)
  }
  return out.sort((a, b) => (a.label || '').localeCompare(b.label || ''))
}

// Related links from the concept graph, excluding hierarchy edges (already in the
// tree) and the documents rendered as the page body.
export function relatedOf(
  concept: GraphConcept | null,
  edges: GraphEdge[],
  conceptsById: Map<string, GraphConcept>,
): { concept: GraphConcept; label: string }[] {
  if (!concept) return []
  const out: { concept: GraphConcept; label: string }[] = []
  const seen = new Set<string>()
  const docs = new Set(attachedDocIdsOf(concept, edges))
  for (const e of edges) {
    if (e.edge_type === 'subtopic_of' || e.edge_type === 'categorized_as') continue
    let otherId = ''
    if (e.from_node_id === concept.id) otherId = e.to_node_id
    else if (e.to_node_id === concept.id) otherId = e.from_node_id
    else continue
    if (!otherId || seen.has(otherId) || docs.has(otherId)) continue
    const other = conceptsById.get(otherId)
    if (!other) continue
    seen.add(otherId)
    out.push({ concept: other, label: EDGE_LABELS[e.edge_type || ''] || (e.edge_type || 'related') })
  }
  return out
}

// Direct subtopic children count for a concept, for card/meta lines.
export function childCountOf(conceptId: string, edges: GraphEdge[]): number {
  let n = 0
  for (const e of edges) {
    if (e.edge_type === 'subtopic_of' && e.to_node_id === conceptId) n++
  }
  return n
}

// ── Original-file rendering ───────────────────────────────────────────────
// When a node's source is an upload, its original bytes can be rendered with the
// shared <wc-resource-view> — the same renderer the Uploads surface uses — so an
// image / pdf / office doc shows as itself rather than only its extracted text.
// text/* is deliberately excluded: the uploads text processor never transforms
// a text/markdown/html/csv/etc file, so its extracted node content is already
// byte-identical to the original — a separate "Original" pane would just be
// the same body again, and its /source lookup has nothing distinct to resolve.
const RAW_RENDERABLE_PREFIXES = ['image/', 'audio/', 'video/']
const RAW_RENDERABLE_EXACT = new Set([
  'application/pdf',
  'application/json', 'application/xml', 'application/javascript', 'application/x-yaml', 'application/sql',
  'application/xhtml+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument.presentation',
])
export function isRawRenderable(mime: string): boolean {
  const m = (mime || '').toLowerCase()
  return RAW_RENDERABLE_PREFIXES.some((p) => m.startsWith(p)) || RAW_RENDERABLE_EXACT.has(m)
}

// Resolve the upload id a node's content came from, if any — checking the stored
// source_ref, flat metadata, and an `upload:<id>` external id.
export function uploadIdOf(metadata: Record<string, any> | undefined): string {
  const m = metadata || {}
  const ref = (m.source_ref && typeof m.source_ref === 'object') ? m.source_ref : {}
  const direct = ref.upload_id || m.upload_id
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const ext = (typeof ref.external_id === 'string' && ref.external_id) || (typeof m.external_id === 'string' && m.external_id) || ''
  if (ext.startsWith('upload:')) return ext.slice('upload:'.length)
  return ''
}
