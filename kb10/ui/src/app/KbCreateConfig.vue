<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import ToggleSwitch from './ToggleSwitch.vue'
import KbButton from './shared/KbButton.vue'
import { DEFAULT_KB_MODEL, resolveModel } from './modelSettings'
import { fitsHalfColumn } from './pairing'
import { useMaintenance, type MaintenanceRunType } from './useMaintenance'

type ConfigValue = string | number | boolean
interface EngineConfigField {
  format?: string
  key: string
  type?: 'string' | 'integer' | 'number' | 'boolean'
  label?: string
  description?: string
  default?: ConfigValue
  minimum?: number
  maximum?: number
  order?: number
}
interface CreateConfig {
  kb_type?: string
  // The knowledge base being edited; empty while creating one.
  id?: string
  embedding_model?: string
  config?: Record<string, unknown> & { config_schema?: unknown }
  edit?: boolean
}
interface P { config?: CreateConfig | null }
interface E { 'config-changed': { embedding_model: string; config: Record<string, unknown> } }

const props = useProps<P>()
const emit = useEvents<E>()

// Canonical class aliases — the runtime resolves these to the configured model
// from the catalog, so the defaults follow the deployment instead of a pinned id.
const PREFERRED_EMBED = 'class:embed'

const ctx = computed<CreateConfig>(() => props.value.config || {})
const isEdit = computed(() => !!ctx.value.edit)
const kbId = computed(() => (isEdit.value ? ctx.value.id || '' : ''))
const kbType = computed(() => ctx.value.kb_type || '')
// Graph/wiki build a concept graph from the document pre-summary, so contextual
// embedding is mandatory for them. A plain document KB can embed chunks as-is, so
// there it is an optional (default-on) cost choice — the only type with the toggle.
const contextRequired = computed(() => kbType.value !== 'document')

const embeddingModel = ref('')
const contextual = ref(true)
const summaryModel = ref<string | false>()
const chunkModel = ref<string | false>()
// The two settings the summary model reads: standing instructions folded into
// every document summary, and the length budget. Free text for the budget so an
// empty box (the engine default applies) stays distinct from an explicit 0 (no
// fallback summary text at all).
const summaryPrompt = ref('')
const summaryMaxChars = ref('')
// Embed images — off by default (heavier: vision captioning + extra vectors).
// On: source diagrams/figures become retrievable image nodes, captioned in
// context and embedded alongside text.
const embedImages = ref(false)
const captionModel = ref(DEFAULT_KB_MODEL)
const engineConfig = ref<Record<string, unknown>>({})
// Retrieval / agentic RAG.
const analysisSetting = ref<string | false>()
const retrievalModel = computed(() => resolveModel(analysisSetting.value, ''))
const enableReranking = ref(false)
const hyde = ref(false)
const selfTuning = ref(false)
const tuningInterval = ref(25)
const lastTuning = computed(() => ctx.value.config?.tuning as { applied_at?: string; rationale?: string } | undefined)
const queryPrompt = ref('')
const retrievalIterations = ref<number | null>(null)
// Ask driver: how a grounded answer is produced — built-in single-shot synthesis
// over retrieved passages, or an agentic agent that retrieves over iterations.
// query_agent is the KB's agent for the agentic driver (empty = built-in agent).
const queryDriver = ref<'built-in' | 'agentic'>('built-in')
const queryAgent = ref('')

function onQueryAgent(e: Event) {
  const d = (e as CustomEvent).detail
  const ids: string[] = d && Array.isArray(d.selected) ? d.selected.map(String) : []
  queryAgent.value = ids[0] || ''
}

// The engine's own config fields, read from config_schema passed in the context.
const schemaFields = computed<EngineConfigField[]>(() => {
  const schema = ctx.value.config?.config_schema as
    | { properties?: Record<string, Omit<EngineConfigField, 'key'>> }
    | undefined
  const p = schema?.properties
  if (p) {
    return Object.entries(p)
      .map(([key, f]) => ({ key, ...f }))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.key.localeCompare(b.key))
  }
  return []
})

// Keys declared in config_schema that a dedicated control below renders and
// writes: the summary settings in the contextual section, and the analysis model,
// its strategy, tuning, reranking and instructions in the Ask section. The
// generic options list renders only the remaining engine keys.
const OWNED_KEYS = [
  'summary_model', 'chunk_enrichment_model', 'summary_prompt', 'summary_max_chars',
  'analysis_model', 'query_strategy', 'self_tuning', 'self_tuning_query_interval', 'enable_reranking', 'extra_prompt',
]
const engineFields = computed(() => schemaFields.value.filter(f => !OWNED_KEYS.includes(f.key)))
function resolveSetting(key: string, value: unknown): string {
  const fallback = schemaFields.value.find(f => f.key === key)?.default
  return resolveModel(value, typeof fallback === 'string' ? fallback : DEFAULT_KB_MODEL)
}
const selectedSummaryModel = computed(() => resolveSetting('summary_model', summaryModel.value))
const selectedChunkModel = computed(() => resolveSetting('chunk_enrichment_model', chunkModel.value))

function modelSetting(value: unknown): string | false | undefined {
  if (typeof value === 'string' || value === false) return value
}
// Prose fields need the full row to be readable; the rest are placed by what
// they render — see fitsHalfColumn.
const engineProseFields = computed(() => engineFields.value.filter(f => f.format === 'textarea'))
const engineShortFields = computed(() => engineFields.value.filter(f => f.format !== 'textarea'))
const summaryPromptField = computed(() => schemaFields.value.find(f => f.key === 'summary_prompt'))
const summaryLengthField = computed(() => schemaFields.value.find(f => f.key === 'summary_max_chars'))
// The length carries its unit beside the name, so the pairing budget measures
// the label as it renders.
const summaryLengthLabel = computed(() => {
  const f = summaryLengthField.value
  return f ? `${f.label || f.key} characters` : ''
})

const summaryCharsMin = computed(() => summaryLengthField.value?.minimum ?? 0)
const summaryCharsMax = computed(() => summaryLengthField.value?.maximum)
// The engine's own default, shown as the placeholder: an untouched knowledge
// base resolves it at ingest, so it is never written into the KB's config here.
const summaryCharsPlaceholder = computed(() => {
  const d = summaryLengthField.value?.default
  return typeof d === 'number' ? String(d) : ''
})

// null = no override of the engine default. A value outside the engine's own
// bounds is not an override either: it is refused and named below the field
// rather than clamped into a length the knowledge base never asked for.
const summaryCharsValue = computed<number | null>(() => {
  const t = summaryMaxChars.value.trim()
  if (t === '') return null
  const n = Number(t)
  if (!Number.isInteger(n)) return null
  const max = summaryCharsMax.value
  if (n < summaryCharsMin.value || (max !== undefined && n > max)) return null
  return n
})
const summaryCharsError = computed(() => {
  const t = summaryMaxChars.value.trim()
  if (t === '' || summaryCharsValue.value !== null) return ''
  const max = summaryCharsMax.value
  if (max === undefined) return `Summary length must be a whole number of ${summaryCharsMin.value} characters or more.`
  return `Summary length must be a whole number between ${summaryCharsMin.value} and ${max} characters.`
})

function seed() {
  const c = ctx.value.config || {}
  embeddingModel.value = ctx.value.embedding_model || PREFERRED_EMBED
  summaryModel.value = modelSetting(c.summary_model)
  chunkModel.value = modelSetting(c.chunk_enrichment_model)
  contextual.value = contextRequired.value || !!(selectedSummaryModel.value || selectedChunkModel.value)

  summaryPrompt.value = typeof c.summary_prompt === 'string' ? c.summary_prompt : ''
  // A knowledge base being created holds no length of its own — the box stays
  // empty on the engine default, which the placeholder names.
  summaryMaxChars.value = isEdit.value && typeof c.summary_max_chars === 'number'
    ? String(c.summary_max_chars)
    : ''

  embedImages.value = c.embed_images === true
  captionModel.value = typeof c.image_caption_model === 'string' && c.image_caption_model
    ? c.image_caption_model
    : DEFAULT_KB_MODEL

  const cfg: Record<string, unknown> = {}
  for (const f of engineFields.value) {
    const v = c[f.key]
    cfg[f.key] = v !== undefined ? v : f.default
  }
  engineConfig.value = cfg

  analysisSetting.value = modelSetting(c.analysis_model)
  enableReranking.value = c.enable_reranking === true
  hyde.value = c.query_strategy === 'hyde'
  selfTuning.value = c.self_tuning === true
  tuningInterval.value = typeof c.self_tuning_query_interval === 'number' ? c.self_tuning_query_interval : 25
  queryPrompt.value = typeof c.extra_prompt === 'string' ? c.extra_prompt : ''
  const it = Number(c.max_retrieval_iterations)
  retrievalIterations.value = Number.isFinite(it) && it > 0 ? it : null

  queryDriver.value = c.query_driver === 'agentic' ? 'agentic' : 'built-in'
  queryAgent.value = typeof c.query_agent === 'string' ? c.query_agent : ''
}

function buildConfig(): Record<string, unknown> {
  const cfg: Record<string, unknown> = { ...engineConfig.value }
  cfg.summary_model = contextual.value ? summaryModel.value : false
  cfg.chunk_enrichment_model = contextual.value ? chunkModel.value : false
  cfg.summary_prompt = summaryPrompt.value.trim()
  if (summaryCharsValue.value !== null) cfg.summary_max_chars = summaryCharsValue.value
  cfg.embed_images = embedImages.value
  cfg.image_caption_model = captionModel.value || DEFAULT_KB_MODEL
  cfg.analysis_model = analysisSetting.value
  cfg.query_strategy = hyde.value ? 'hyde' : 'plain'
  cfg.self_tuning = selfTuning.value
  cfg.self_tuning_query_interval = tuningInterval.value
  cfg.enable_reranking = enableReranking.value
  cfg.extra_prompt = queryPrompt.value.trim()
  if (retrievalIterations.value) cfg.max_retrieval_iterations = retrievalIterations.value
  cfg.query_driver = queryDriver.value
  cfg.query_agent = queryAgent.value
  return cfg
}

function pickValue(e: Event): string {
  const d = (e as CustomEvent).detail
  return typeof d === 'string' ? d : (d && typeof d === 'object' && 'value' in d ? String((d as { value: unknown }).value) : '')
}
function onEmbed(e: Event) { embeddingModel.value = pickValue(e) }
function onSummary(e: Event) { summaryModel.value = pickValue(e) }
function onChunk(e: Event) { chunkModel.value = pickValue(e) }

function setContextual(enabled: boolean) {
  if (enabled && !selectedSummaryModel.value && !selectedChunkModel.value) {
    summaryModel.value = ''
    chunkModel.value = ''
  }
  contextual.value = enabled
}

function setEngineField(f: EngineConfigField, raw: string) {
  if (f.type === 'integer') {
    const n = Number.parseInt(raw, 10)
    engineConfig.value[f.key] = Number.isNaN(n) ? undefined : n
  } else if (f.type === 'number') {
    const n = Number.parseFloat(raw)
    engineConfig.value[f.key] = Number.isNaN(n) ? undefined : n
  } else {
    engineConfig.value[f.key] = raw
  }
}
function engineFieldValue(key: string): string {
  const v = engineConfig.value[key]
  return v === undefined || v === null ? '' : String(v)
}

// ── Maintenance (edit only) ─────────────────────────────────────────────────
const formConfig = computed(buildConfig)
const initialConfig = ref<Record<string, unknown>>({})
const configPatch = computed(() => Object.fromEntries(Object.entries(formConfig.value).filter(
  ([key, value]) => value !== undefined && !Object.is(value, initialConfig.value[key]),
)))
const dirty = computed(() => Object.keys(configPatch.value).length > 0 ||
  Object.keys(initialConfig.value).some(key => !(key in formConfig.value)))

function publish() {
  emit('config-changed', { embedding_model: embeddingModel.value, config: configPatch.value })
}

const {
  statusError: maintenanceError,
  running: maintenanceRunning,
  anyBusy: maintenanceBusy,
  start: startMaintenance,
  statusLine,
} = useMaintenance(() => kbId.value)
const canMaintain = computed(() => !!kbId.value)
// Both actions rewrite content under the SAVED settings and cost model calls, so
// they stay closed while the form holds unsaved changes — otherwise a full
// regeneration runs under settings the user just replaced. They also stay closed
// while a run is in flight: the two runs rewrite the same nodes, and the server
// refuses a second one anyway.
const maintenanceBlocked = computed(() => maintenanceBusy.value || dirty.value)
const regenStatus = computed(() => statusLine('resummarize'))
const reembedStatus = computed(() => statusLine('reembed'))

function startRun(runType: MaintenanceRunType) {
  if (maintenanceBlocked.value) return
  void startMaintenance(runType)
}

function seedAndPublish() {
  seed()
  initialConfig.value = formConfig.value
  publish()
}

watch(() => props.value.config, seedAndPublish)
watch([embeddingModel, formConfig], publish)

onMounted(() => {
  loadByTagName('wc-model-picker', { timeoutMs: 8000 }).catch(() => {})
  loadByTagName('wc-agent-picker', { timeoutMs: 8000 }).catch(() => {})
  seedAndPublish()
})
</script>

<template>
  <div class="cx">
    <!-- Indexing — every decision that shapes what this knowledge base stores,
         in the order ingest applies them: the vector model, the engine's own
         ingest settings, then the two optional passes that run before embedding. -->
    <div class="cx-group">
      <div class="cx-group-h"><Icon icon="tabler:vector" aria-hidden="true" /><span>Indexing</span></div>
      <p class="cx-lead">How documents are turned into vectors when they enter this knowledge base.</p>

      <div class="cx-field">
        <span class="cx-label">Embedding model</span>
        <div v-if="isEdit" class="cx-fixed">
          <Icon icon="tabler:lock" aria-hidden="true" /><span class="cx-fixed-v">{{ embeddingModel || '—' }}</span>
          <span class="st-hint">fixed after creation</span>
        </div>
        <wc-model-picker v-else :value="embeddingModel" capability="embed" @select="onEmbed"></wc-model-picker>
        <p class="st-hint">Documents are embedded with this model so they can be retrieved by meaning.</p>
      </div>

      <!-- The engine's own ingest settings (e.g. wiki link depth), in declared
           order: a field short enough for a half column takes one, a longer one
           spans the row so it never drags a neighbour down. Prose fields take
           the full width below. -->
      <div v-if="engineShortFields.length" class="cx-row">
        <label
          v-for="f in engineShortFields"
          :key="f.key"
          class="cx-field"
          :class="{ 'cx-span': !fitsHalfColumn(f.label || f.key, f.description) }"
        >
          <span class="cx-label">{{ f.label || f.key }}</span>
          <input
            class="cx-input"
            :type="f.type === 'integer' || f.type === 'number' ? 'number' : 'text'"
            :min="f.minimum"
            :max="f.maximum"
            :step="f.type === 'integer' ? 1 : undefined"
            :value="engineFieldValue(f.key)"
            @input="setEngineField(f, ($event.target as HTMLInputElement).value)"
          />
          <p v-if="f.description" class="st-hint">{{ f.description }}</p>
        </label>
      </div>

      <!-- A single-line input makes a multi-sentence instruction unreadable. -->
      <label v-for="f in engineProseFields" :key="f.key" class="cx-field">
        <span class="cx-label">{{ f.label || f.key }}</span>
        <textarea
          class="cx-input cx-textarea"
          rows="3"
          :value="String(engineFieldValue(f.key) ?? '')"
          @input="setEngineField(f, ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
        <p v-if="f.description" class="st-hint">{{ f.description }}</p>
      </label>

      <!-- Contextual embedding — mandatory for graph/wiki (the concept graph is built
           from the summary); an optional, default-on cost choice for plain documents. -->
      <div class="cx-sub">
        <div class="cx-sub-h">
          <span class="cx-sub-t">
            <span class="cx-label">Contextual embedding</span>
            <span class="st-hint">
              Adds a short document summary and per-chunk context before embedding, so retrieval
              understands each chunk in the context of its whole document.
              <template v-if="contextRequired"> Required — the concept graph is built from these models.</template>
            </span>
          </span>
          <ToggleSwitch v-if="!contextRequired" :model-value="contextual" @update:model-value="setContextual" aria-label="Contextual embedding" />
          <span v-else class="cx-req">Required</span>
        </div>

        <template v-if="contextual">
          <div class="cx-row">
            <div class="cx-field">
              <span class="cx-label">Summary model</span>
              <wc-model-picker :value="selectedSummaryModel" capability="generate" @select="onSummary"></wc-model-picker>
              <p class="st-hint">Summarises each document before chunking.</p>
            </div>
            <div class="cx-field">
              <span class="cx-label">Chunk enrichment model</span>
              <wc-model-picker :value="selectedChunkModel" capability="generate" @select="onChunk"></wc-model-picker>
              <p class="st-hint">Adds context to each chunk.</p>
            </div>
          </div>

          <label v-if="summaryPromptField" class="cx-field">
            <span class="cx-label">{{ summaryPromptField.label || summaryPromptField.key }} <span class="cx-opt">optional</span></span>
            <textarea
              class="cx-input cx-textarea"
              rows="3"
              :value="summaryPrompt"
              placeholder="e.g. Lead with the customer's stated goal, then the decisions and dates."
              @input="summaryPrompt = ($event.target as HTMLTextAreaElement).value"
            ></textarea>
            <p v-if="summaryPromptField.description" class="st-hint">{{ summaryPromptField.description }}</p>
          </label>

          <!-- A length budget is one number: it takes a column while its words
               fit one, and the row once they no longer do. -->
          <div v-if="summaryLengthField" class="cx-row">
            <label class="cx-field" :class="{ 'cx-span': !fitsHalfColumn(summaryLengthLabel, summaryLengthField.description) }">
              <span class="cx-label">{{ summaryLengthField.label || summaryLengthField.key }} <span class="cx-opt">characters</span></span>
              <input
                class="cx-input"
                type="number"
                :min="summaryCharsMin"
                :max="summaryCharsMax"
                :placeholder="summaryCharsPlaceholder"
                :value="summaryMaxChars"
                @input="summaryMaxChars = ($event.target as HTMLInputElement).value"
              />
              <p v-if="summaryCharsError" class="cx-err">{{ summaryCharsError }}</p>
              <p v-else-if="summaryLengthField.description" class="st-hint">{{ summaryLengthField.description }}</p>
            </label>
          </div>
        </template>
        <p v-else class="cx-hint"><Icon icon="tabler:circle-dot" aria-hidden="true" />Plain embedding — chunks are embedded as-is.</p>
      </div>

      <!-- Embed images — off by default. On: source diagrams/figures become
           retrievable image nodes, captioned in context and embedded alongside text. -->
      <div class="cx-sub">
        <div class="cx-sub-h">
          <span class="cx-sub-t">
            <span class="cx-label">Embed images</span>
            <span class="st-hint">
              Captions diagrams and figures from your documents and embeds them alongside the text,
              so a search returns the relevant image as well as the prose around it.
            </span>
          </span>
          <ToggleSwitch v-model="embedImages" aria-label="Embed images" />
        </div>
        <div v-if="embedImages" class="cx-field">
          <span class="cx-label">Caption model</span>
          <wc-model-picker :value="captionModel" capability="vision" @select="captionModel = pickValue($event)"></wc-model-picker>
          <p class="st-hint">Describes each image in the context of its section.</p>
        </div>
      </div>
    </div>

    <div class="cx-group">
      <div class="cx-group-h"><Icon icon="tabler:message-2" aria-hidden="true" /><span>Search and Ask</span></div>

      <div class="cx-field">
        <span class="cx-label">Search analysis model</span>
        <wc-model-picker :value="retrievalModel" capability="generate" @select="analysisSetting = pickValue($event).trim() || false"></wc-model-picker>
        <p v-if="analysisSetting === false" class="st-hint">Answers are disabled. Ask returns matching passages.</p>
        <p v-else-if="!retrievalModel" class="st-hint">Search returns direct matches. Ask uses Fast when available.</p>
      </div>

      <label class="cx-toggle">
        <ToggleSwitch v-model="hyde" aria-label="Hypothetical answer retrieval" />
        <span><span class="cx-label">Hypothetical answer retrieval</span><span class="st-hint">Uses the Search analysis model to generate a short hypothetical answer before embedding each question.</span></span>
      </label>
      <label class="cx-toggle">
        <ToggleSwitch v-model="selfTuning" aria-label="Autonomous retrieval tuning" />
        <span><span class="cx-label">Autonomous retrieval tuning</span><span class="st-hint">Learns standing instructions from document summaries and retrieval outcomes. Applies changes when a caller has write access.</span></span>
      </label>
      <p v-if="lastTuning?.applied_at" class="st-hint">Last tuning: {{ lastTuning.applied_at }}. {{ lastTuning.rationale }}</p>
      <p v-if="(hyde || selfTuning) && !retrievalModel" class="st-hint">HyDE and tuning stay off until a Search analysis model is available.</p>
      <label v-if="selfTuning" class="cx-field">
        <span class="cx-label">Tuning interval</span>
        <input class="cx-input" type="number" min="5" max="500" step="1" v-model.number="tuningInterval" />
        <p class="st-hint">Queries between tuning attempts, from 5 to 500. Each attempt uses one bounded model call.</p>
      </label>

      <!-- The round budget belongs to the mode that spends it, so both sit on
           one row, and both carry hints short enough for a half column. -->
      <div class="cx-row">
        <label class="cx-field">
          <span class="cx-label">Mode</span>
          <select class="cx-input" :value="queryDriver" @change="queryDriver = ($event.target as HTMLSelectElement).value as 'built-in' | 'agentic'">
            <option value="built-in">Single-shot</option>
            <option value="agentic">Agentic</option>
          </select>
          <p class="st-hint">Single-shot answers in one pass. Agentic works in rounds.</p>
        </label>

        <!-- The round budget is the agentic driver's alone: it is the only reader
             of max_retrieval_iterations. Concept-graph traversal depth is the
             Link depth field above, a separate key. -->
        <label v-if="queryDriver === 'agentic'" class="cx-field">
          <span class="cx-label">Max rounds</span>
          <input class="cx-input" type="number" min="1" max="40" placeholder="20" :value="retrievalIterations ?? ''" @input="retrievalIterations = Number(($event.target as HTMLInputElement).value) || null" />
          <p class="st-hint">Retrieve-and-reason rounds before answering. Default 20.</p>
        </label>
      </div>

      <div v-if="queryDriver === 'agentic'" class="cx-field">
        <span class="cx-label">Query agent <span class="cx-opt">optional</span></span>
        <wc-agent-picker
          multi="false"
          placeholder="Built-in Q&amp;A agent"
          :selected="queryAgent ? JSON.stringify([queryAgent]) : '[]'"
          @change="onQueryAgent"
        ></wc-agent-picker>
        <p class="st-hint">Answer with a specific agent — it gets a retrieval tool over this KB — instead of the built-in Q&amp;A agent.</p>
      </div>

      <label class="cx-toggle" v-if="queryDriver !== 'agentic'">
        <ToggleSwitch v-model="enableReranking" aria-label="Rerank results" />
        <span><span class="cx-label">Rerank results</span><span class="st-hint">A second LLM pass re-orders retrieved passages by relevance before answering.</span></span>
      </label>

      <label class="cx-field">
        <span class="cx-label">Instructions <span class="cx-opt">optional</span></span>
        <textarea class="cx-input cx-textarea" rows="3" :value="queryPrompt" placeholder="e.g. Always check the Architecture Overview doc before answering." @input="queryPrompt = ($event.target as HTMLTextAreaElement).value" />
        <p class="st-hint">Standing guidance applied to retrieval and answering on every question.</p>
      </label>
    </div>

    <!-- Maintenance — only over a knowledge base that already holds content. -->
    <div v-if="canMaintain" class="cx-group">
      <div class="cx-group-h"><Icon icon="tabler:refresh" aria-hidden="true" /><span>Maintenance</span></div>
      <p class="cx-lead">
        Rewrite the summaries or vectors this knowledge base already holds, under its saved settings.
        <template v-if="dirty">Save your changes first — a run uses the saved settings, not the ones in this form.</template>
      </p>

      <p v-if="maintenanceError" class="cx-err">{{ maintenanceError }}</p>

      <!-- Both actions rewrite the same content, so they read as one pair of
           choices; each run's own words follow underneath, named by what it wrote. -->
      <div class="cx-maint-row">
        <KbButton
          variant="soft"
          small
          :disabled="maintenanceBlocked || !initialConfig.summary_model"
          :loading="maintenanceRunning('resummarize')"
          @click="startRun('resummarize')"
        >Regenerate summaries</KbButton>
        <KbButton
          variant="soft"
          small
          :disabled="maintenanceBlocked"
          :loading="maintenanceRunning('reembed')"
          @click="startRun('reembed')"
        >Re-embed vectors</KbButton>
      </div>

      <p v-if="regenStatus.text" class="cx-maint-status" :class="regenStatus.tone">
        <span class="cx-maint-what">Summaries</span>{{ regenStatus.text }}
      </p>
      <p v-if="reembedStatus.text" class="cx-maint-status" :class="reembedStatus.tone">
        <span class="cx-maint-what">Vectors</span>{{ reembedStatus.text }}
      </p>
    </div>
  </div>
</template>
