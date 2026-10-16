<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import { fetchSdkReference, generateCode } from '../codeExecutionApi.ts'
import type { CodeBodyProps, CodeBodyEvents, AssistResult, SdkReference, SdkTool } from '../codeExecutionTypes.ts'

// The code body's authoring view (kickside-code-body): the rich editor the Workflow
// builder mounts for a code node. It owns the Generate assist
// (describe it -> validated Lua), the raw code editor, and the SDK reference — the
// "what can I call" surface. It edits canonical Block config
// { code, tool_ids?, method? } and reports only user changes via `config-changed`.

const props = useProps<CodeBodyProps>()
const emit = useEvents<CodeBodyEvents>()

function readCode(cfg: CodeBodyProps['config']): string {
  return cfg && typeof cfg === 'object' && typeof cfg.code === 'string' ? cfg.code : ''
}
function readMethod(cfg: CodeBodyProps['config']): string {
  return cfg && typeof cfg === 'object' && typeof cfg.method === 'string' ? cfg.method : ''
}
function readToolIds(cfg: CodeBodyProps['config']): string[] {
  if (!cfg || typeof cfg !== 'object' || !Array.isArray(cfg.tool_ids)) return []
  return [...new Set(cfg.tool_ids.map(String).map(id => id.trim()).filter(Boolean))]
}
const code = ref(readCode(props.value.config))
const method = ref(readMethod(props.value.config))
const toolIds = ref(readToolIds(props.value.config))
const selectedTools = computed(() => JSON.stringify(toolIds.value))

// Reseed from the host only when it pushes a code that differs from ours, so an echo
// of our own emit does not clobber an in-flight edit.
let lastEmittedCode = code.value
let lastEmittedMethod = method.value
let lastEmittedToolIds = JSON.stringify(toolIds.value)
watch(() => props.value.config, (cfg) => {
  const nextCode = readCode(cfg)
  const nextMethod = readMethod(cfg)
  const nextToolIds = readToolIds(cfg)
  if (nextCode !== code.value) code.value = nextCode
  if (nextMethod !== method.value) method.value = nextMethod
  if (JSON.stringify(nextToolIds) !== JSON.stringify(toolIds.value)) toolIds.value = nextToolIds
  lastEmittedCode = nextCode
  lastEmittedMethod = nextMethod
  lastEmittedToolIds = JSON.stringify(nextToolIds)
})

function currentConfig(): CodeBodyEvents['config-changed'] {
  return {
    code: code.value,
    ...(toolIds.value.length ? { tool_ids: [...toolIds.value] } : {}),
    ...(method.value !== '' ? { method: method.value } : {}),
  }
}

function emitConfig() {
  const ids = JSON.stringify(toolIds.value)
  if (code.value === lastEmittedCode && method.value === lastEmittedMethod && ids === lastEmittedToolIds) return
  lastEmittedCode = code.value
  lastEmittedMethod = method.value
  lastEmittedToolIds = ids
  emit('config-changed', currentConfig())
}
function onCodeInput(e: Event) { code.value = (e.target as HTMLTextAreaElement).value; emitConfig() }
function onMethodInput(e: Event) { method.value = (e.target as HTMLInputElement).value.trim(); emitConfig() }
function onToolsChanged(e: Event) {
  const detail = (e as CustomEvent<{ selected?: unknown }>).detail
  const selected = detail && Array.isArray(detail.selected) ? detail.selected : []
  toolIds.value = [...new Set(selected.map(String).map(id => id.trim()).filter(Boolean))]
  emitConfig()
}

// ─── Generate (AI assist) ──────────────────────────────────────────────────────
const intent = ref('')
const generating = ref(false)
const assistError = ref('')
const assistResult = ref<AssistResult | null>(null)
const canGenerate = computed(() => intent.value.trim().length > 0 && !generating.value)
const assistErrors = computed(() => assistResult.value?.errors || [])

async function generate() {
  if (!canGenerate.value) return
  generating.value = true
  assistError.value = ''
  assistResult.value = null
  try {
    const res = await generateCode({ intent: intent.value.trim(), tool_ids: toolIds.value })
    assistResult.value = res
    if (res.validated && typeof res.code === 'string') {
      code.value = res.code
      emitConfig()
    }
  } catch (e) {
    assistError.value = e instanceof Error ? e.message : 'could not generate code'
    emit('error', { message: assistError.value, error: e })
  } finally {
    generating.value = false
  }
}

// ─── SDK reference ─────────────────────────────────────────────────────────────
const sdk = ref<SdkReference | null>(null)
const sdkLoading = ref(false)
const sdkError = ref('')
const sdkOpen = ref(false)
const sdkEmpty = computed(() => !!sdk.value && sdk.value.tools.length === 0)

async function loadSdk() {
  sdkLoading.value = true
  sdkError.value = ''
  try {
    sdk.value = await fetchSdkReference(toolIds.value)
  } catch (e) {
    sdkError.value = e instanceof Error ? e.message : 'could not load SDK reference'
    emit('error', { message: sdkError.value, error: e })
  } finally {
    sdkLoading.value = false
  }
}
function onSdkToggle(e: Event) {
  sdkOpen.value = (e.target as HTMLDetailsElement).open
  if (sdkOpen.value && !sdk.value && !sdkLoading.value) loadSdk()
}
function retrySdk() { loadSdk() }
// Keep an open reference in sync with the whitelist.
watch(toolIds, () => { if (sdkOpen.value) loadSdk() })

function schemaText(schema: Record<string, unknown> | undefined, direction: 'input' | 'output'): string {
  if (!schema || Object.keys(schema).length === 0) {
    return direction === 'input' ? 'No input schema — takes no arguments.' : 'No output schema declared.'
  }
  return JSON.stringify(schema, null, 2)
}
function toolCall(tool: SdkTool): string {
  return tool.call || `sdk.tools["${tool.id}"](args)`
}

const toolPickerError = ref('')
onMounted(async () => {
  try {
    await loadByTagName('wc-multiselect', { timeoutMs: 8000 })
  } catch (e) {
    toolPickerError.value = 'The tool picker could not be loaded.'
    emit('error', { message: toolPickerError.value, error: e })
  }
})
</script>

<template>
  <div class="ce ce-body">
    <!-- Generate -->
    <div class="kx-field">
      <span class="ce-label">
        <Icon icon="tabler:sparkles" aria-hidden="true" /> What should this code do?
      </span>
      <textarea
        class="kx-input kx-textarea ce-intent"
        :value="intent"
        rows="3"
        aria-label="Describe what the code should do"
        placeholder="Describe it in plain language — e.g. send a message to my inbox saying hi."
        @input="(e) => { intent = (e.target as HTMLTextAreaElement).value }"
      ></textarea>
      <div class="ce-assist-row">
        <button type="button" class="kx-btn kx-btn-primary" :disabled="!canGenerate" @click="generate">
          <Icon v-if="!generating" icon="tabler:wand" aria-hidden="true" />
          <Icon v-else icon="tabler:loader-2" class="spin" aria-hidden="true" />
          {{ generating ? 'Generating…' : 'Generate' }}
        </button>
        <span class="ce-hint">Drafts Lua against the allowed tools and validates it in a sandbox dry-run.</span>
      </div>

      <div v-if="assistError" class="ce-error" role="alert">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>{{ assistError }}</span>
        <button type="button" class="ce-retry" @click="generate">Retry</button>
      </div>
      <div v-else-if="assistResult" class="ce-assist-result" aria-live="polite">
        <span class="ce-status" :class="assistResult.validated ? 'ok' : 'bad'">
          <Icon :icon="assistResult.validated ? 'tabler:circle-check' : 'tabler:alert-triangle'" aria-hidden="true" />
          {{ assistResult.validated ? 'Validated — the code is ready below.' : 'Not validated — nothing was filled in.' }}
        </span>
        <ul v-if="!assistResult.validated" class="ce-errors">
          <li v-for="(err, i) in assistErrors" :key="i">{{ err }}</li>
          <li v-if="!assistErrors.length">The generator could not produce validated code.</li>
        </ul>
      </div>
    </div>

    <!-- Code -->
    <label class="kx-field">
      <span class="ce-sublabel">Code</span>
      <textarea
        class="ce-code"
        :value="code"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        wrap="off"
        rows="12"
        aria-label="Lua code to run"
        placeholder="-- Lua run by this Block&#10;local res, err = sdk.tools[&quot;namespace:tool_id&quot;]({ query = '...' })&#10;if err then error(err) end&#10;return res"
        @input="onCodeInput"
      ></textarea>
      <span class="ce-hint">The Lua this Block runs, as the current user. It reaches tools through the <code>sdk</code> import — see the SDK reference below.</span>
    </label>

    <label class="kx-field">
      <span class="ce-sublabel">Exported method <span class="ce-optional">optional</span></span>
      <input
        class="kx-input ce-method"
        :value="method"
        autocomplete="off"
        spellcheck="false"
        placeholder="Leave empty to use the chunk result"
        @input="onMethodInput"
      />
      <span class="ce-hint">Invoke this exported function after loading the Lua chunk.</span>
    </label>

    <div class="kx-field">
      <span class="ce-sublabel">Allowed tools</span>
      <div v-if="toolPickerError" class="ce-error" role="alert">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>{{ toolPickerError }}</span>
      </div>
      <wc-multiselect
        v-else
        class="ce-tool-picker"
        source="/api/v1/code-execution/sdk-reference"
        response-key="tools"
        id-key="id"
        label-key="label"
        desc-key="description"
        :selected="selectedTools"
        :multi="true"
        placeholder="Search tools…"
        @change="onToolsChanged"
      ></wc-multiselect>
      <span class="ce-hint">Select a restricted tool surface, or leave this empty to allow every tool the current user can reach.</span>
    </div>

    <!-- SDK reference -->
    <details class="ce-disclosure ce-sdk" @toggle="onSdkToggle">
      <summary>
        <Icon class="ce-caret" icon="tabler:chevron-right" aria-hidden="true" />
        <Icon class="ce-tool-icon" icon="tabler:code" aria-hidden="true" />
        <span class="ce-tool-title">SDK reference</span>
        <span class="ce-schema-badge">what you can call</span>
      </summary>
      <div class="ce-disclosure-body">
        <div v-if="sdkError" class="ce-error" role="alert">
          <Icon icon="tabler:alert-triangle" aria-hidden="true" />
          <span>{{ sdkError }}</span>
          <button type="button" class="ce-retry" @click="retrySdk">Retry</button>
        </div>
        <div v-else-if="sdkLoading" class="ce-note" aria-live="polite">
          <Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />
          <span>Loading SDK reference…</span>
        </div>
        <p v-else-if="sdkEmpty" class="ce-empty">Nothing reachable for the current selection.</p>
        <template v-else-if="sdk">
          <div v-if="sdk.tools.length" class="ce-sdk-group">
            <span class="ce-sublabel">Tools</span>
            <ul class="ce-list" aria-label="Callable tools">
              <li v-for="t in sdk.tools" :key="t.id">
                <details class="ce-disclosure">
                  <summary>
                    <Icon class="ce-caret" icon="tabler:chevron-right" aria-hidden="true" />
                    <code class="ce-sig">{{ toolCall(t) }}</code>
                  </summary>
                  <div class="ce-disclosure-body">
                    <p v-if="t.description" class="ce-tool-desc">{{ t.description }}</p>
                    <div class="ce-schema-grid">
                      <section class="ce-schema-section">
                        <span class="ce-schema-label">Input schema</span>
                        <pre class="ce-schema" :aria-label="`Input schema for ${t.label}`">{{ schemaText(t.input_schema, 'input') }}</pre>
                      </section>
                      <section class="ce-schema-section">
                        <span class="ce-schema-label">Output schema</span>
                        <pre class="ce-schema" :aria-label="`Output schema for ${t.label}`">{{ schemaText(t.output_schema, 'output') }}</pre>
                      </section>
                    </div>
                  </div>
                </details>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </details>
  </div>
</template>
