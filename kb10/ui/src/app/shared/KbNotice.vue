<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Inline banner. tone picks the colour treatment; icon defaults per tone.
const props = withDefaults(defineProps<{
  tone?: 'info' | 'warn' | 'error' | 'help'
  icon?: string
}>(), { tone: 'info' })

const resolvedIcon = props.icon || {
  info: 'tabler:info-circle',
  warn: 'tabler:alert-triangle',
  error: 'tabler:alert-circle',
  help: 'tabler:bulb',
}[props.tone]
</script>

<template>
  <div class="kx-notice" :class="tone">
    <Icon :icon="resolvedIcon" aria-hidden="true" />
    <span><slot /></span>
  </div>
</template>
