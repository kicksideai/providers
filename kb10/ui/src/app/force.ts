// Compact dependency-free force-directed layout, porting the behaviour of the
// d3-force simulation: link springs, many-body repulsion, centering and collision,
// with velocity-Verlet integration and alpha cooling.
//
// Many-body repulsion uses a Barnes-Hut quadtree (O(n log n)) and collision a
// uniform spatial grid (O(n)).

export interface SimNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
  radius: number
}

export interface SimLink {
  source: number
  target: number
  distance: number
  strength: number
}

// Quadtree cell. Leaves hold a single node; internals aggregate child mass +
// centre of mass for the Barnes-Hut approximation.
interface Quad {
  x0: number; y0: number; x1: number; y1: number
  mass: number; cx: number; cy: number
  node: SimNode | null
  kids: (Quad | null)[] | null
}

const THETA2 = 0.81 // (theta=0.9)^2 — cell treated as a point when width^2/d2 < THETA2
const DIST_FLOOR2 = 144 // soften repulsion at very short range so nodes don't fling apart

export class ForceSim {
  nodes: SimNode[]
  links: SimLink[]
  width: number
  height: number

  alpha = 1
  alphaMin = 0.001
  // Cool over ~360 ticks; the full cool runs so the layout reaches a relaxed state.
  alphaDecay = 1 - Math.pow(0.001, 1 / 360)
  alphaTarget = 0
  velocityDecay = 0.6

  charge: number
  // Gentle gravity: just enough to keep the graph cohesive. Higher values crush
  // nodes into a dense blob and fight the repulsion that gives the graph room.
  centerStrength = 0.015
  // Hard cap on per-tick displacement. Without it, a node deep in a dense cluster
  // can absorb a large repulsion impulse and teleport off-screen on a single tick
  // (the "jumping behind the screen" during a drag) — clamping keeps motion bounded
  // and the layout legible while still letting nodes ease into place.
  maxVelocity = 35

  constructor(nodes: SimNode[], links: SimLink[], width: number, height: number, charge: number) {
    this.nodes = nodes
    this.links = links
    this.width = width
    this.height = height
    this.charge = charge
  }

  // One integration step. Returns true while still cooling.
  tick(): boolean {
    this.alpha += (this.alphaTarget - this.alpha) * this.alphaDecay
    const a = this.alpha

    this.applyCharge(a)
    this.applyLinks(a)
    this.applyCenter(a)
    this.applyCollide()
    this.integrate()

    return this.alpha >= this.alphaMin || this.alphaTarget > 0
  }

  // ── Barnes-Hut many-body repulsion (O(n log n)) ──────────────────────────
  private applyCharge(a: number): void {
    const nodes = this.nodes
    const n = nodes.length
    if (n < 2) return

    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (let i = 0; i < n; i++) {
      const p = nodes[i]
      if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x
      if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y
    }
    // Square, padded root cell.
    const span = Math.max(x1 - x0, y1 - y0, 1) + 1
    const root: Quad = { x0, y0, x1: x0 + span, y1: y0 + span, mass: 0, cx: 0, cy: 0, node: null, kids: null }
    for (let i = 0; i < n; i++) this.insert(root, nodes[i])
    this.computeMass(root)

    const k = this.charge * a
    for (let i = 0; i < n; i++) this.repel(nodes[i], root, k)
  }

  // Insert p into the subtree rooted at q, subdividing leaves as needed.
  private insert(q: Quad, p: SimNode): void {
    // descend to a leaf
    while (q.kids) q = this.kid(q, p)
    if (q.node === null) { q.node = p; return }
    if (q.node === p) return
    // Identical coords would subdivide forever — jitter the newcomer.
    if (q.node.x === p.x && q.node.y === p.y) { p.x += (Math.random() - 0.5) * 0.5; p.y += (Math.random() - 0.5) * 0.5 }
    const existing = q.node
    q.node = null
    q.kids = [null, null, null, null]
    this.insert(this.kid(q, existing), existing)
    this.insert(this.kid(q, p), p)
  }

  // Return the child quad of q containing point p, creating it on demand.
  private kid(q: Quad, p: SimNode): Quad {
    const mx = (q.x0 + q.x1) / 2, my = (q.y0 + q.y1) / 2
    const east = p.x >= mx, south = p.y >= my
    const i = (south ? 2 : 0) + (east ? 1 : 0)
    let c = q.kids![i]
    if (!c) {
      c = {
        x0: east ? mx : q.x0, x1: east ? q.x1 : mx,
        y0: south ? my : q.y0, y1: south ? q.y1 : my,
        mass: 0, cx: 0, cy: 0, node: null, kids: null,
      }
      q.kids![i] = c
    }
    return c
  }

  private computeMass(q: Quad): void {
    if (!q.kids) { if (q.node) { q.mass = 1; q.cx = q.node.x; q.cy = q.node.y } return }
    let m = 0, cx = 0, cy = 0
    for (const c of q.kids) {
      if (!c) continue
      this.computeMass(c)
      if (c.mass === 0) continue
      m += c.mass; cx += c.cx * c.mass; cy += c.cy * c.mass
    }
    q.mass = m
    if (m > 0) { q.cx = cx / m; q.cy = cy / m }
  }

  private repel(p: SimNode, q: Quad, k: number): void {
    if (q.mass === 0 || q.node === p) return
    let dx = q.cx - p.x
    let dy = q.cy - p.y
    let d2 = dx * dx + dy * dy
    if (d2 === 0) { dx = (Math.random() - 0.5) * 0.01; dy = (Math.random() - 0.5) * 0.01; d2 = dx * dx + dy * dy }
    const w = q.x1 - q.x0
    // Far enough (or a leaf): treat the whole cell as a point at its COM.
    if (!q.kids || (w * w) / d2 < THETA2) {
      const eff = d2 < DIST_FLOOR2 ? DIST_FLOOR2 : d2
      const dist = Math.sqrt(d2)
      const force = (k * q.mass) / eff
      p.vx -= (dx / dist) * force
      p.vy -= (dy / dist) * force
      return
    }
    for (const c of q.kids) if (c) this.repel(p, c, k)
  }

  private applyLinks(a: number): void {
    for (const l of this.links) {
      const s = this.nodes[l.source]
      const t = this.nodes[l.target]
      if (!s || !t) continue
      const dx = t.x - s.x
      const dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6
      const diff = (dist - l.distance) / dist * a * l.strength
      const fx = dx * diff
      const fy = dy * diff
      s.vx += fx * 0.5
      s.vy += fy * 0.5
      t.vx -= fx * 0.5
      t.vy -= fy * 0.5
    }
  }

  private applyCenter(a: number): void {
    const cx = this.width / 2
    const cy = this.height / 2
    for (const node of this.nodes) {
      node.vx += (cx - node.x) * this.centerStrength * a
      node.vy += (cy - node.y) * this.centerStrength * a
    }
  }

  // ── Collision via uniform spatial grid (O(n) average) ────────────────────
  private applyCollide(): void {
    const n = this.nodes
    const len = n.length
    if (len < 2) return
    let maxR = 0
    for (let i = 0; i < len; i++) if (n[i].radius > maxR) maxR = n[i].radius
    const cell = maxR * 2 + 52 // a node only collides with neighbours within this reach
    const grid = new Map<number, number[]>()
    const key = (cx: number, cy: number) => (cx * 73856093) ^ (cy * 19349663)
    for (let i = 0; i < len; i++) {
      const gx = Math.floor(n[i].x / cell), gy = Math.floor(n[i].y / cell)
      const kk = key(gx, gy)
      const b = grid.get(kk); if (b) b.push(i); else grid.set(kk, [i])
    }
    for (let i = 0; i < len; i++) {
      const ni = n[i]
      const gx = Math.floor(ni.x / cell), gy = Math.floor(ni.y / cell)
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const b = grid.get(key(gx + ox, gy + oy))
        if (!b) continue
        for (const j of b) {
          if (j <= i) continue
          const nj = n[j]
          const dx = nj.x - ni.x
          const dy = nj.y - ni.y
          const min = ni.radius + nj.radius + 44
          const d2 = dx * dx + dy * dy
          if (d2 < min * min && d2 > 0) {
            const dist = Math.sqrt(d2)
            const overlap = (min - dist) / dist * 0.5
            const oxv = dx * overlap, oyv = dy * overlap
            ni.x -= oxv; ni.y -= oyv
            nj.x += oxv; nj.y += oyv
          }
        }
      }
    }
  }

  private integrate(): void {
    const cx = this.width / 2
    const cy = this.height / 2
    const bound = Math.max(this.width, this.height) * 2 + 1500
    // Scale the cap with alpha: during the hot initial settle nodes need to travel
    // far to spread out (effectively uncapped), but once the layout is warm/at rest
    // — i.e. during a drag — the cap is tight so nothing can fling across the view.
    const vmax = this.maxVelocity * (1 + this.alpha * 8)
    for (const node of this.nodes) {
      if (node.fx != null) { node.x = node.fx; node.vx = 0 }
      else {
        node.vx *= this.velocityDecay
        if (node.vx > vmax) node.vx = vmax; else if (node.vx < -vmax) node.vx = -vmax
        node.x += node.vx
      }
      if (node.fy != null) { node.y = node.fy; node.vy = 0 }
      else {
        node.vy *= this.velocityDecay
        if (node.vy > vmax) node.vy = vmax; else if (node.vy < -vmax) node.vy = -vmax
        node.y += node.vy
      }
      if (!Number.isFinite(node.x)) { node.x = cx; node.vx = 0 }
      if (!Number.isFinite(node.y)) { node.y = cy; node.vy = 0 }
      node.x = Math.max(cx - bound, Math.min(cx + bound, node.x))
      node.y = Math.max(cy - bound, Math.min(cy + bound, node.y))
    }
  }

  // A final, spring-free separation pass: run the collision grid repeatedly to push
  // apart any residual node overlap the cooled simulation left behind. Independent of
  // alpha and with nothing pulling nodes back together, so even a dense seed/cluster
  // ends up cleanly spaced. Cheap (O(n) per iteration).
  resolveOverlaps(iterations = 60): void {
    for (let i = 0; i < iterations; i++) this.applyCollide()
  }

  // Re-energize the layout to a one-off alpha that then cools to alphaTarget.
  reheat(target = 0.3): void {
    if (this.alpha < target) this.alpha = target
    this.alphaTarget = 0
  }

  // Hold the layout gently "warm" at a low alpha — used during a drag so only a
  // light, continuous relaxation follows the cursor instead of a full reheat that
  // shakes the whole graph. Pair with settle() on release to cool back down.
  warm(target = 0.1): void {
    this.alphaTarget = target
    if (this.alpha < target) this.alpha = target
  }

  // Stop holding warm and let the layout cool to rest.
  settle(): void {
    this.alphaTarget = 0
  }
}
