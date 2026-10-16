<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Centered boot/loading state with a spinning glyph and optional label.
withDefaults(defineProps<{ icon?: string; label?: string }>(), { icon: 'tabler:loader-2' })
</script>

<template>
  <div class="kc-loading">
    <div class="kc-loading-inner">
      <Icon :icon="icon" class="spin" aria-hidden="true" />
      <span v-if="label">{{ label }}</span>
    </div>
  </div>
</template>
