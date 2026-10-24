import { onBeforeUnmount, ref } from 'vue'

// The resizable rail: a pointer-driven handle on the rail's right edge drives a
// persisted, clamped width that feeds `--kx-rail-width` (the shell's rail column). Both
// the wiki and graph views share it so the rail behaves identically in each.
const NAV_WIDTH_KEY = 'kb10:wiki:navWidth'
const NAV_WIDTH_MIN = 220
const NAV_WIDTH_MAX = 560

function clamp(px: number) { return Math.max(NAV_WIDTH_MIN, Math.min(NAV_WIDTH_MAX, px)) }
function readStored(): number {
  const raw = Number(localStorage.getItem(NAV_WIDTH_KEY))
  return Number.isFinite(raw) && raw > 0 ? clamp(raw) : 300
}

export function useRailResizer() {
  const navWidth = ref(readStored())
  const railRef = ref<HTMLElement | null>(null)
  const navDragging = ref(false)

  function onMove(e: PointerEvent) {
    const el = railRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    navWidth.value = clamp(e.clientX - rect.left)
  }
  function onEnd() {
    navDragging.value = false
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onEnd)
    localStorage.setItem(NAV_WIDTH_KEY, String(Math.round(navWidth.value)))
  }
  function onStart(e: PointerEvent) {
    e.preventDefault()
    navDragging.value = true
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
  }

  onBeforeUnmount(onEnd)
  return { navWidth, railRef, navDragging, onStart }
}
