<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Foldable rail group: an uppercase header (chevron + title + count) over a
// slotted body. Controlled — the parent owns `open` so selection/deep-link can
// force a section open.
defineProps<{ title: string; count?: number; open: boolean; icon?: string }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()
</script>

<template>
  <div class="kx-railsec" :class="{ closed: !open }">
    <button class="kx-railsec-h" :aria-expanded="open" @click="emit('toggle')">
      <Icon class="kx-railsec-chev" icon="tabler:chevron-right" aria-hidden="true" />
      <Icon v-if="icon" class="kx-railsec-ic" :icon="icon" aria-hidden="true" />
      <span class="kx-railsec-t">{{ title }}</span>
      <span v-if="count !== undefined" class="count">{{ count }}</span>
    </button>
    <div v-show="open" class="kx-railsec-b"><slot /></div>
  </div>
</template>
