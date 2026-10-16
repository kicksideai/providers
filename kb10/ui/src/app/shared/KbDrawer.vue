<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'

// Right-docked slide-in drawer hosting secondary surfaces (add / settings). A
// scrim click or Escape closes it; the wrapper is not focusable, so Escape is
// caught at the window while open.
const props = defineProps<{ open: boolean; title: string; icon: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(() => props.open, (open) => {
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="kc-drawer">
    <div v-if="open" class="kc-drawer-mask" @click.self="emit('close')">
      <aside class="kc-drawer" role="dialog" :aria-label="title">
        <div class="kc-drawer-h">
          <span class="kc-drawer-title"><Icon :icon="icon" aria-hidden="true" />{{ title }}</span>
          <IconButton icon="tabler:x" label="Close" @click="emit('close')" />
        </div>
        <div class="kc-drawer-b"><slot /></div>
      </aside>
    </div>
  </Transition>
</template>
