<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Shared empty / zero-state block for the kb10 detail UIs: an icon medallion, a
// title, a supporting line, and an optional call-to-action button. `tone`
// switches the medallion between the primary accent and a neutral surface.
defineProps<{
  icon: string
  title: string
  hint?: string
  cta?: string
  ctaIcon?: string
  tone?: 'primary' | 'muted'
}>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <div class="es">
    <div class="es-ico" :class="tone === 'muted' ? 'muted' : 'primary'">
      <Icon :icon="icon" aria-hidden="true" />
    </div>
    <div class="es-t">{{ title }}</div>
    <div v-if="hint" class="es-s">{{ hint }}</div>
    <button v-if="cta" class="es-cta" @click="emit('cta')">
      <Icon v-if="ctaIcon" :icon="ctaIcon" aria-hidden="true" />
      {{ cta }}
    </button>
  </div>
</template>
