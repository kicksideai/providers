<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Floating zoom / fit cluster with a live zoom readout, mirroring the beacon
// canvas controls.
defineProps<{ scale: number }>()
const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'fit'): void
}>()
</script>

<template>
  <div class="gx-controls">
    <button class="gx-ctrl" type="button" title="Zoom in" aria-label="Zoom in" @click="emit('zoom-in')"><Icon icon="tabler:plus" /></button>
    <div class="gx-ctrl-read">{{ Math.round(scale * 100) }}%</div>
    <button class="gx-ctrl" type="button" title="Zoom out" aria-label="Zoom out" @click="emit('zoom-out')"><Icon icon="tabler:minus" /></button>
    <button class="gx-ctrl fit" type="button" title="Fit to view" aria-label="Fit to view" @click="emit('fit')"><Icon icon="tabler:focus-centered" /></button>
  </div>
</template>
