<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import Message from 'primevue/message'
import { useWidget } from './useWidget'

// The shared model picker (wc-model-picker).
defineProps<{ value: string; capability: 'embed' | 'generate'; labelledBy?: string }>()
const emit = defineEmits<{ (e: 'select', v: string): void }>()
const picker = useWidget('wc-model-picker')

function onSelect(event: Event) {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  if (typeof detail === 'string' && detail) emit('select', detail)
}
</script>

<template>
  <wc-model-picker v-if="picker.ready.value" :aria-labelledby="labelledBy" :value="value" :capability="capability" @select="onSelect"></wc-model-picker>
  <Message v-else-if="picker.failed.value" severity="error" size="small">The model picker could not load: {{ picker.failed.value }}</Message>
</template>
