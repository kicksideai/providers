<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ open: boolean; kind: 'dialog' | 'drawer'; dismissible?: boolean }>(), { dismissible: true })
const emit = defineEmits<{ (e: 'close'): void }>()
const overlay = ref<HTMLElement | null>(null)
let invoker: HTMLElement | null = null
const background = new Map<HTMLElement, boolean>()

function activeElement(node: HTMLElement): HTMLElement | null {
  const root = node.getRootNode()
  const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement
  return active instanceof HTMLElement ? active : null
}

function inertBackground(node: HTMLElement): void {
  let current: HTMLElement | null = node
  while (current) {
    const parent: ParentNode | null = current.parentNode
    if (!(parent instanceof HTMLElement || parent instanceof ShadowRoot)) break
    for (const sibling of Array.from(parent.children)) {
      if (sibling instanceof HTMLElement && sibling !== current && !background.has(sibling)) {
        background.set(sibling, sibling.inert)
        sibling.inert = true
      }
    }
    current = parent instanceof ShadowRoot ? parent.host as HTMLElement : parent
  }
}

function restoreBackground(): void {
  for (const [element, inert] of background) element.inert = inert
  background.clear()
}

function focusable(): HTMLElement[] {
  if (!overlay.value) return []
  return Array.from(overlay.value.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hasAttribute('disabled'))
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.dismissible) { event.preventDefault(); emit('close'); return }
  if (event.key !== 'Tab') return
  const controls = focusable()
  if (!controls.length) { event.preventDefault(); return }
  const first = controls[0]!
  const active = overlay.value ? activeElement(overlay.value) : null
  const index = controls.indexOf(active || first)
  const target = controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]!
  event.preventDefault()
  target.focus()
}

async function activate(open: boolean): Promise<void> {
  if (open) {
    await nextTick()
    if (!overlay.value) return
    invoker = activeElement(overlay.value)
    inertBackground(overlay.value)
    const initial = overlay.value.querySelector<HTMLElement>('[data-overlay-initial]') || focusable()[0]
    initial?.focus()
    return
  }
  restoreBackground()
  const target = invoker
  invoker = null
  await nextTick()
  target?.focus()
}

watch(() => props.open, (open) => { void activate(open) }, { immediate: true })
onBeforeUnmount(() => { restoreBackground(); invoker?.focus(); invoker = null })
</script>

<template>
  <Transition :name="kind === 'drawer' ? 'kx-drawer' : 'kx-modal'">
    <div v-if="open" ref="overlay" :class="kind === 'drawer' ? 'kx-drawer-mask' : 'kx-modal-mask'" @keydown="onKeydown" @click.self="dismissible && emit('close')">
      <slot />
    </div>
  </Transition>
</template>
