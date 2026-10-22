<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { loadByTagName } from '@wippy-fe/proxy'
import type { ComponentProps, MemoryEvents } from '../types.ts'
import Message from 'primevue/message'
import ToggleSwitch from 'primevue/toggleswitch'

// Memory capability on an agent: which memory it uses and whether it records
// conversations there. Models, budgets and cadence belong to the memory itself.
// Saving writes memory_id in place of the earlier kb_ids and write_kb_id and
// carries over the other keys that still take effect.
const CARRIED_KEYS = ['read_enabled', 'recall_limit']

const props = useProps<ComponentProps>()
const emit = useEvents<MemoryEvents>()

const memoryId = ref('')
const capture = ref(true)
const kept = ref<Record<string, unknown>>({})
const pickerReady = ref(!!customElements.get('wc-kb-picker'))
const pickerError = ref('')
const pickerConfig = computed(() => JSON.stringify({ kb_ids: memoryId.value ? [memoryId.value] : [] }))

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function apply(raw: ComponentProps['config']): void {
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw) } catch { return }
  }
  const outer = record(parsed)
  const context = { ...record(outer.context), ...outer }
  delete context.context
  delete context.agent_options
  const legacyIds = Array.isArray(context.kb_ids) ? context.kb_ids : []
  memoryId.value = String(context.memory_id || context.write_kb_id || legacyIds[0] || '')
  capture.value = context.write_enabled !== false
  kept.value = Object.fromEntries(Object.entries(context).filter(([key]) => CARRIED_KEYS.includes(key)))
}

function publish(): void {
  emit('config-changed', { context: { ...kept.value, memory_id: memoryId.value, write_enabled: capture.value } })
}

function onPicked(event: Event): void {
  const detail = record(event instanceof CustomEvent ? event.detail : undefined)
  const ids = Array.isArray(detail.kb_ids) ? detail.kb_ids : []
  memoryId.value = String(ids[ids.length - 1] || '')
  publish()
}

watch(() => props.value.config, apply, { immediate: true, deep: true })

onMounted(async () => {
  if (pickerReady.value) return
  try {
    await loadByTagName('wc-kb-picker', { timeoutMs: 8000 })
    pickerReady.value = true
  } catch (err) {
    pickerError.value = err instanceof Error ? err.message : String(err)
  }
})
</script>

<template>
  <div class="mm-stack">
    <div class="mm-field">
      <span class="mm-label">Memory</span>
      <wc-kb-picker v-if="pickerReady" :config="pickerConfig" @config-changed="onPicked"></wc-kb-picker>
      <Message v-else-if="pickerError" severity="error" size="small">The knowledge base picker could not load: {{ pickerError }}</Message>
      <span class="mm-hint">Pick a Memory knowledge base. Models, limits and cadence are set on the memory itself.</span>
    </div>
    <div class="mm-toggle">
      <span class="mm-label">Remember conversations</span>
      <ToggleSwitch v-model="capture" aria-label="Remember conversations" @update:model-value="publish" />
    </div>
  </div>
</template>
