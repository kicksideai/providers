<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { loadByTagName } from '@wippy-fe/proxy'
import type { ComponentProps, MemoryConfig, MemoryEvents } from '../types.ts'
import { isRecord, isStringArray, stringValue, numberValue } from '../decodeConfig'
import MmSwitch from './shared/MmSwitch.vue'
import ModelPicker from './shared/ModelPicker.vue'

// Settings of the Memory trait on an agent: which memories it uses (the first
// is written to), whether conversations are captured, whether SearchMemory is
// available, and the checkpoint policy. Edits fold back through
// `config-changed` as { context, agent_options.checkpoint }.

const DEFAULTS = {
  write_enabled: true,
  read_enabled: true,
  token_threshold: 64000,
  checkpoint_model: 'class:fast',
  recall_limit: 5,
} as const

const props = useProps<ComponentProps>()
const emit = useEvents<MemoryEvents>()

const memoryIds = ref<string[]>([])
const writeEnabled = ref<boolean>(DEFAULTS.write_enabled)
const readEnabled = ref<boolean>(DEFAULTS.read_enabled)
const tokenThreshold = ref<string>(String(DEFAULTS.token_threshold))
const checkpointModel = ref<string>(DEFAULTS.checkpoint_model)
const recallLimit = ref<string>(String(DEFAULTS.recall_limit))
const pickerReady = ref(!!customElements.get('wc-kb-picker'))
const pickerError = ref('')

const pickerConfig = computed(() => JSON.stringify({ kb_ids: memoryIds.value }))
const hint = computed(() => memoryIds.value.length
  ? 'The first memory receives captured conversations; all of them are searched.'
  : 'Choose Memory knowledge bases. Create one with + Knowledge Base, type Memory.')

function num(raw: string, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function applyConfig(cfg: ComponentProps['config']): void {
  if (cfg == null || cfg === '') return
  let parsed: unknown = cfg
  if (typeof cfg === 'string') {
    try { parsed = JSON.parse(cfg) } catch { return }
  }
  if (!isRecord(parsed)) return
  const context = isRecord(parsed.context) ? parsed.context : {}
  const merged: Record<string, unknown> = { ...context, ...parsed }
  const agentOptions = isRecord(parsed.agent_options) ? parsed.agent_options : {}
  const options = isRecord(agentOptions.checkpoint) ? agentOptions.checkpoint : {}
  memoryIds.value = isStringArray(merged.memory_ids) && merged.memory_ids.length
    ? merged.memory_ids
    : isStringArray(merged.kb_ids) ? merged.kb_ids : []
  writeEnabled.value = merged.write_enabled !== false
  readEnabled.value = merged.read_enabled !== false
  checkpointModel.value = stringValue(merged.checkpoint_model) || stringValue(options.model) || DEFAULTS.checkpoint_model
  tokenThreshold.value = String(numberValue(options.token_threshold) ?? DEFAULTS.token_threshold)
  recallLimit.value = String(numberValue(merged.recall_limit) || DEFAULTS.recall_limit)
}

function buildConfig(): MemoryConfig {
  return {
    context: {
      memory_ids: [...memoryIds.value],
      write_enabled: writeEnabled.value,
      read_enabled: readEnabled.value,
      recall_limit: num(recallLimit.value, DEFAULTS.recall_limit),
      checkpoint_model: checkpointModel.value || DEFAULTS.checkpoint_model,
    },
    agent_options: {
      checkpoint: {
        token_threshold: num(tokenThreshold.value, DEFAULTS.token_threshold),
        model: checkpointModel.value || DEFAULTS.checkpoint_model,
        max_tokens: 1000,
      },
    },
  }
}

function emitConfig(): void {
  emit('config-changed', buildConfig())
}

function onPicked(event: Event): void {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  memoryIds.value = isRecord(detail) && isStringArray(detail.kb_ids) ? detail.kb_ids : []
  emitConfig()
}

function onModel(model: string): void {
  checkpointModel.value = model
  emitConfig()
}

watch(() => props.value.config, applyConfig, { immediate: true, deep: true })

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
  <div class="km">
    <div class="field">
      <span>Memories</span>
      <wc-kb-picker v-if="pickerReady" :config="pickerConfig" @config-changed="onPicked"></wc-kb-picker>
      <span v-else-if="pickerError" class="error">The knowledge base picker could not load: {{ pickerError }}</span>
      <span class="hint">{{ hint }}</span>
    </div>

    <div class="toggle">
      <span>Capture conversations into memory</span>
      <MmSwitch label="Capture conversations into memory" v-model="writeEnabled" @update:model-value="emitConfig" />
    </div>
    <div class="toggle">
      <span>SearchMemory tool</span>
      <MmSwitch label="SearchMemory tool" v-model="readEnabled" @update:model-value="emitConfig" />
    </div>

    <div class="row">
      <label class="field">Checkpoint after tokens
        <input name="token_threshold" type="number" min="200" max="200000" step="100" v-model="tokenThreshold" @input="emitConfig" />
      </label>
      <label class="field">Search results
        <input name="recall_limit" type="number" min="1" max="50" v-model="recallLimit" @input="emitConfig" />
      </label>
    </div>
    <div class="field">
      <span>Checkpoint model</span>
      <ModelPicker :value="checkpointModel" capability="generate" @select="onModel" />
      <span class="hint">Summarizes the conversation when the context is compacted.</span>
    </div>
  </div>
</template>
