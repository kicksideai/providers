<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Inline "View original" toggle shown in a reading view's header beside the
// document title. It carries no state of its own: the host view decides when to
// render it (the shown document has a renderable original) and passes the label
// for the current open/closed state; clicking raises `open` for the host to
// toggle its own OriginalOverlay.
defineProps<{ label?: string }>()
const emit = defineEmits<{ (e: 'open'): void }>()
</script>

<template>
  <button type="button" class="kc-btn kc-btn-ghost sm" @click="emit('open')">
    <Icon icon="tabler:file-search" aria-hidden="true" />
    <span>{{ label || 'View original' }}</span>
  </button>
</template>
