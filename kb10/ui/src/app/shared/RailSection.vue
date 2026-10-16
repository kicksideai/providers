<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Foldable rail group: an uppercase header (chevron + title + count) over a
// slotted body. Controlled — the parent owns `open` so selection/deep-link can
// force a section open.
defineProps<{ title: string; count?: number; open: boolean; icon?: string }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()
</script>

<template>
  <div class="kc-railsec" :class="{ closed: !open }">
    <button class="kc-railsec-h" :aria-expanded="open" @click="emit('toggle')">
      <Icon class="kc-railsec-chev" icon="tabler:chevron-right" aria-hidden="true" />
      <Icon v-if="icon" class="kc-railsec-ic" :icon="icon" aria-hidden="true" />
      <span class="kc-railsec-t">{{ title }}</span>
      <span v-if="count !== undefined" class="count">{{ count }}</span>
    </button>
    <div v-show="open" class="kc-railsec-b"><slot /></div>
  </div>
</template>
