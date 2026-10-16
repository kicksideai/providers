<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Underline tab strip shared by the reading surfaces. Each tab carries an id,
// label, optional icon, and optional count pill.
export interface KbTab { id: string; label: string; icon?: string; count?: number }
defineProps<{ tabs: KbTab[]; active: string }>()
const emit = defineEmits<{ (e: 'select', id: string): void }>()
</script>

<template>
  <div class="tb" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.id"
      class="tb-tab"
      :class="{ on: active === t.id }"
      role="tab"
      :aria-selected="active === t.id"
      @click="emit('select', t.id)"
    >
      <Icon v-if="t.icon" :icon="t.icon" aria-hidden="true" />
      {{ t.label }}
      <span v-if="t.count !== undefined" class="kc-count">{{ t.count }}</span>
    </button>
  </div>
</template>
