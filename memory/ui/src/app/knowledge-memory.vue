<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { loadByTagName } from '@wippy-fe/proxy'
import type { ComponentProps, MemoryConfig, MemoryEvents } from '../documentTypes.ts'
import { isRecord, isStringArray, stringValue, numberValue } from '../decodeConfig'

// The Knowledge Base Memory trait config surface. The host passes the activation
// context + checkpoint policy as `config` and folds edits back through the
// `config-changed` event whose byte-shape is { context, agent_options.checkpoint }.
// The KB and model choices are delegated to the shared wc-kb-picker / wc-model-picker
// registry elements, with a plain-input fallback when a picker cannot load.

const DEFAULTS = {
  read_enabled: true,
  write_enabled: true,
  token_threshold: 64000,
  checkpoint_model: 'class:fast',
  checkpoint_prompt: '',
  recall_prompt: '',
  recall_limit: 5,
  recall_max_chars: 4000,
} as const

const props = useProps<ComponentProps>()
const emit = useEvents<MemoryEvents>()

// Number inputs keep the raw string so a partially-typed value is not clobbered;
// the emitted payload clamps to a positive finite number, else the default.
const keptContext = ref<Record<string, unknown>>({})
const keptCheckpoint = ref<Record<string, unknown>>({})
const kbIds = ref<string[]>([])
const memoryId = ref('')
const readEnabled = ref<boolean>(DEFAULTS.read_enabled)
const writeEnabled = ref<boolean>(DEFAULTS.write_enabled)
const tokenThreshold = ref<string>(String(DEFAULTS.token_threshold))
const checkpointModel = ref<string>(DEFAULTS.checkpoint_model)
const checkpointPrompt = ref<string>(DEFAULTS.checkpoint_prompt)
const recallPrompt = ref<string>(DEFAULTS.recall_prompt)
const recallLimit = ref<string>(String(DEFAULTS.recall_limit))
const recallMaxChars = ref<string>(String(DEFAULTS.recall_max_chars))

const kbPickerFailed = ref(false)
const modelPickerFailed = ref(false)

const kbConfigJson = computed(() => JSON.stringify({ kb_ids: kbIds.value }))
const modelValue = computed(() => checkpointModel.value || DEFAULTS.checkpoint_model)
const hint = computed(() =>
  kbIds.value.length
    ? `${kbIds.value.length} selected; the first selected base is the write target.`
    : 'Select a knowledge base to enable recall and optional writes.',
)

function num(raw: string, fallback: number): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// Normalize the incoming config into the local fields, matching the original
// element: nested `context` is merged under the top-level payload, and the
// checkpoint policy is read from agent_options.checkpoint with sane fallbacks.
function applyConfig(cfg: ComponentProps['config']): void {
  if (cfg == null || cfg === '') return
  let parsed: unknown
  if (typeof cfg === 'string') {
    try {
      parsed = JSON.parse(cfg)
    } catch {
      resetToDefaults()
      return
    }
  } else if (typeof cfg === 'object') {
    parsed = cfg
  } else {
    return
  }
  if (!isRecord(parsed)) return

  const context = isRecord(parsed.context) ? parsed.context : {}
  const merged = { ...context, ...parsed }
  const agentOptions = isRecord(parsed.agent_options) ? parsed.agent_options : {}
  const options = isRecord(agentOptions.checkpoint) ? agentOptions.checkpoint : {}
  const { context: _context, agent_options: _agentOptions, ...flat } = parsed
  keptContext.value = { ...context, ...flat }
  keptCheckpoint.value = { ...options }

  memoryId.value = stringValue(merged.memory_id) || ''
  kbIds.value = isStringArray(merged.kb_ids)
    ? merged.kb_ids
    : typeof merged.kb_id === 'string' && merged.kb_id ? [merged.kb_id] : []
  readEnabled.value = merged.read_enabled !== false
  writeEnabled.value = merged.write_enabled !== false
  checkpointModel.value = stringValue(merged.checkpoint_model) || stringValue(options.model) || DEFAULTS.checkpoint_model
  checkpointPrompt.value = stringValue(merged.checkpoint_prompt) || ''
  recallPrompt.value = stringValue(merged.recall_prompt) || ''
  tokenThreshold.value = String(numberValue(options.token_threshold) ?? numberValue(merged.token_threshold) ?? DEFAULTS.token_threshold)
  recallLimit.value = String(numberValue(merged.recall_limit) || DEFAULTS.recall_limit)
  recallMaxChars.value = String(numberValue(merged.recall_max_chars) || DEFAULTS.recall_max_chars)
}

function resetToDefaults(): void {
  keptContext.value = {}
  keptCheckpoint.value = {}
  memoryId.value = ''
  kbIds.value = []
  readEnabled.value = DEFAULTS.read_enabled
  writeEnabled.value = DEFAULTS.write_enabled
  tokenThreshold.value = String(DEFAULTS.token_threshold)
  checkpointModel.value = DEFAULTS.checkpoint_model
  checkpointPrompt.value = DEFAULTS.checkpoint_prompt
  recallPrompt.value = DEFAULTS.recall_prompt
  recallLimit.value = String(DEFAULTS.recall_limit)
  recallMaxChars.value = String(DEFAULTS.recall_max_chars)
}

function buildConfig(): MemoryConfig {
  const checkpointModelValue = checkpointModel.value || DEFAULTS.checkpoint_model
  const context = {
    ...keptContext.value,
    ...(memoryId.value || "memory_id" in keptContext.value ? { memory_id: memoryId.value } : {}),
    kb_ids: [...kbIds.value],
    read_enabled: readEnabled.value,
    write_enabled: writeEnabled.value,
    checkpoint_model: checkpointModelValue,
    checkpoint_prompt: checkpointPrompt.value,
    recall_prompt: recallPrompt.value,
    recall_limit: num(recallLimit.value, DEFAULTS.recall_limit),
    recall_max_chars: num(recallMaxChars.value, DEFAULTS.recall_max_chars),
  }
  return {
    context,
    agent_options: {
      checkpoint: {
        ...keptCheckpoint.value,
        token_threshold: num(tokenThreshold.value, DEFAULTS.token_threshold),
        model: context.checkpoint_model,
        max_tokens: numberValue(keptCheckpoint.value.max_tokens) ?? 1000,
      },
    },
  }
}

function emitConfig(): void {
  emit('config-changed', buildConfig())
}

function onMemoryChanged(event: Event): void {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  const ids = isRecord(detail) && isStringArray(detail.kb_ids) ? detail.kb_ids : []
  memoryId.value = ids.at(-1) || ''
  emitConfig()
}

function onKbChanged(event: Event): void {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  kbIds.value = isRecord(detail) && isStringArray(detail.kb_ids) ? detail.kb_ids : []
  emitConfig()
}

function onKbFallback(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = event.target.value
  kbIds.value = value ? [value] : []
  emitConfig()
}

function onModelSelect(event: Event): void {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  checkpointModel.value = (typeof detail === 'string' && detail) || DEFAULTS.checkpoint_model
  emitConfig()
}

function onModelFallback(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const value = event.target.value
  checkpointModel.value = value || DEFAULTS.checkpoint_model
  emitConfig()
}

watch(() => props.value.config, applyConfig, { immediate: true, deep: true })

onMounted(async () => {
  try {
    if (!customElements.get('wc-kb-picker')) await loadByTagName('wc-kb-picker', { timeoutMs: 8000 })
  } catch {
    kbPickerFailed.value = true
  }
  try {
    if (!customElements.get('wc-model-picker')) await loadByTagName('wc-model-picker', { timeoutMs: 8000 })
  } catch {
    modelPickerFailed.value = true
  }
})
</script>

<template>
  <div class="km">
    <div class="field">
      <span id="typed_memory">Typed memory</span>
      <wc-kb-picker v-if="!kbPickerFailed" aria-labelledby="typed_memory" :config="JSON.stringify({ kb_ids: memoryId ? [memoryId] : [] })" @config-changed="onMemoryChanged"></wc-kb-picker>
      <span v-else role="alert">The knowledge base picker cannot load.</span>
      <span class="hint">Select a Memory knowledge base for typed capture and recall. Leave empty to use document knowledge bases.</span>
    </div>
    <div class="field">
      <span id="legacy_memory_kbs">Document knowledge bases</span>
      <div data-kb-picker>
        <wc-kb-picker aria-labelledby="legacy_memory_kbs" v-if="!kbPickerFailed" :config="kbConfigJson" @config-changed="onKbChanged"></wc-kb-picker>
        <input v-else aria-label="Memory knowledge base ID" name="kb_id_fallback" placeholder="Knowledge base id" :value="kbIds[0] || ''" @input="onKbFallback" />
      </div>
      <span class="hint">{{ hint }}</span>
    </div>

    <div class="switches">
      <label class="check">
        <input name="read_enabled" type="checkbox" v-model="readEnabled" @change="emitConfig" />
        Inject memory on activation
      </label>
      <label class="check">
        <input name="write_enabled" type="checkbox" v-model="writeEnabled" @change="emitConfig" />
        Persist checkpoints to memory
      </label>
    </div>

    <div class="row">
      <label class="field">Checkpoint after tokens
        <input
          name="token_threshold"
          type="number"
          min="200"
          max="200000"
          step="100"
          v-model="tokenThreshold"
          @input="emitConfig"
        />
      </label>
      <div class="field">
        <span id="legacy_checkpoint_model">Checkpoint model</span>
        <div data-model-picker>
          <wc-model-picker aria-labelledby="legacy_checkpoint_model" v-if="!modelPickerFailed" :value="modelValue" @select="onModelSelect"></wc-model-picker>
          <input v-else aria-label="Checkpoint model" name="model_fallback" placeholder="class:fast" :value="modelValue" @input="onModelFallback" />
        </div>
      </div>
    </div>

    <details>
      <summary>Advanced</summary>
      <div style="display: grid; gap: 10px; margin-top: 10px;">
        <label class="field">Memory write instructions
          <textarea
            name="checkpoint_prompt"
            placeholder="Store relevant details for future conversations. Do not store literal assistant answers."
            v-model="checkpointPrompt"
            @input="emitConfig"
          ></textarea>
        </label>
        <label class="field">Recall guidance
          <textarea
            name="recall_prompt"
            placeholder="Long-term memory may be incomplete or inaccurate; use it as advisory context."
            v-model="recallPrompt"
            @input="emitConfig"
          ></textarea>
        </label>
      </div>
      <div class="row" style="margin-top: 10px;">
        <label class="field">Recall results
          <input name="recall_limit" type="number" min="1" max="20" v-model="recallLimit" @input="emitConfig" />
        </label>
        <label class="field">Recall budget
          <input name="recall_max_chars" type="number" min="500" max="20000" step="500" v-model="recallMaxChars" @input="emitConfig" />
        </label>
      </div>
    </details>
  </div>
</template>
