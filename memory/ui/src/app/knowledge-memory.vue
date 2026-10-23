<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import Message from 'primevue/message'
import ToggleSwitch from 'primevue/toggleswitch'
import { eventDetail, parseConfig, type MemoryEvents } from './types'
import { useWidget } from './useWidget'

// Memory capability on an agent: which memory it uses and whether it records
// conversations there. Models, budgets and cadence belong to the memory itself.
// The editor mounts the trait context as `config`. Saving writes memory_id in
// the explicit typed Memory trait; existing document-backed agents use their
// original settings component and retain their configuration.
const CARRIED_KEYS = ['read_enabled', 'recall_limit']

const props = useProps<{ config?: unknown }>()
const emit = useEvents<MemoryEvents>()

const memoryId = ref('')
const capture = ref(true)
const kept = ref<Record<string, unknown>>({})
const picker = useWidget('wc-kb-picker')
const pickerConfig = computed(() => JSON.stringify({ kb_ids: memoryId.value ? [memoryId.value] : [] }))

watch(() => props.value.config, (raw) => {
  const context = parseConfig(raw)
  memoryId.value = String(context.memory_id || '')
  capture.value = context.write_enabled !== false
  kept.value = Object.fromEntries(Object.entries(context).filter(([key]) => CARRIED_KEYS.includes(key)))
}, { immediate: true, deep: true })

function publish(): void {
  emit('config-changed', { context: { ...kept.value, memory_id: memoryId.value, write_enabled: capture.value } })
}

// wc-kb-picker selects several; the newest pick is the memory.
function onPicked(event: Event): void {
  const picked = eventDetail(event).kb_ids
  const ids = Array.isArray(picked) ? picked : []
  memoryId.value = String(ids[ids.length - 1] || '')
  publish()
}
</script>

<template>
  <div class="mm-stack">
    <div class="mm-field">
      <span id="trait_memory" class="mm-label">Memory</span>
      <wc-kb-picker v-if="picker.ready.value" aria-labelledby="trait_memory" :config="pickerConfig" @config-changed="onPicked"></wc-kb-picker>
      <Message v-else-if="picker.failed.value" severity="error" size="small">The knowledge base picker could not load: {{ picker.failed.value }}</Message>
      <span class="mm-hint">Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.</span>
    </div>
    <div class="mm-toggle">
      <span class="mm-label">Remember conversations</span>
      <ToggleSwitch v-model="capture" aria-label="Remember conversations" @update:model-value="publish" />
    </div>
  </div>
</template>
