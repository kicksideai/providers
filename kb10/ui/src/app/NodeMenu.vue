<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'

// A small action popover for a concept/document node, opened by the row kebab or
// by right-clicking a row or a canvas node. Positioned at viewport coordinates so
// it works from both the rail and the canvas; a transparent backdrop catches the
// outside click that dismisses it.
export interface KbMenuItem {
  id: string
  label?: string
  icon?: string
  danger?: boolean
  disabled?: boolean
  divider?: boolean
}
const props = defineProps<{ open: boolean; x: number; y: number; title?: string; items: KbMenuItem[] }>()
const emit = defineEmits<{ (e: 'pick', id: string): void; (e: 'close'): void }>()

// Clamp into the viewport so a right-click near an edge stays fully on-screen.
const style = computed(() => {
  const w = 224
  const rows = props.items.filter((i) => !i.divider).length
  const seps = props.items.filter((i) => i.divider).length
  const h = (props.title ? 30 : 0) + 10 + rows * 34 + seps * 9
  const left = Math.max(8, Math.min(props.x, window.innerWidth - w - 8))
  const top = Math.max(8, Math.min(props.y, window.innerHeight - h - 8))
  return { left: `${left}px`, top: `${top}px`, width: `${w}px` }
})

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function pick(it: KbMenuItem) {
  if (it.disabled || it.divider) return
  emit('pick', it.id)
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="kb-menu-backdrop"
    @mousedown="emit('close')"
    @contextmenu.prevent="emit('close')"
    @wheel.prevent="emit('close')"
  >
    <div class="kb-menu" :style="style" role="menu" @mousedown.stop @contextmenu.prevent.stop>
      <div v-if="title" class="kb-menu-title">{{ title }}</div>
      <template v-for="(it, i) in items" :key="it.id + ':' + i">
        <div v-if="it.divider" class="kb-menu-sep" role="separator" />
        <button
          v-else
          class="kb-menu-item"
          :class="{ danger: it.danger, disabled: it.disabled }"
          :disabled="it.disabled"
          role="menuitem"
          @click="pick(it)"
        >
          <Icon v-if="it.icon" :icon="it.icon" class="kb-menu-ic" aria-hidden="true" />
          <span>{{ it.label }}</span>
        </button>
      </template>
    </div>
  </div>
</template>
