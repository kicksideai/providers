<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { type SearchHit, truncate, hitDocTitle } from '../types'
import { useKbSearch, pct } from '../useKbSearch'
import SearchField from './SearchField.vue'
import IconButton from './IconButton.vue'

// The one KB search surface, in two layouts:
//   rail  — a compact field with an as-you-type results popover (the wiki nav).
//   panel — a full surface with Search / Ask modes; Ask shows a synthesized,
//           grounded answer over the same retrieval, with its sources.
// Choosing a result emits the hit; the host maps it to a navigation target
// (a concept in the wiki, the owning document in the library).
const props = withDefaults(defineProps<{
  kbId: string
  layout?: 'rail' | 'panel'
  ask?: boolean
  placeholder?: string
}>(), { layout: 'panel' })
const emit = defineEmits<{ (e: 'open', hit: SearchHit): void; (e: 'close'): void }>()

const { query, results, answer, loading, error, performed, run, ask: askQuery, runDebounced, clear } = useKbSearch(() => props.kbId)

type Mode = 'search' | 'ask'
const mode = ref<Mode>('search')
const focused = ref(false)
const queryRan = ref('')

const isAsk = computed(() => props.layout === 'panel' && props.ask && mode.value === 'ask')
const submitIcon = computed(() => (
  loading.value ? 'tabler:hourglass' : (isAsk.value ? 'tabler:sparkles' : 'tabler:arrow-right')
))
const top = computed(() => results.value[0])
const rest = computed(() => (isAsk.value ? results.value.slice(1) : results.value))
const showPop = computed(() =>
  props.layout === 'rail' && focused.value && query.value.trim() !== ''
  && (loading.value || performed.value || !!error.value))

function submit() {
  if (!query.value.trim()) return
  queryRan.value = query.value.trim()
  if (isAsk.value) askQuery(8)
  else run(20)
}
function onInput() {
  if (props.layout === 'rail') runDebounced(300)
}
function pickMode(m: Mode) {
  mode.value = m
  if (performed.value && query.value.trim()) submit()
}
function pick(hit: SearchHit) {
  emit('open', hit)
  if (props.layout === 'rail') { clear(); focused.value = false }
}
</script>

<template>
  <!-- Rail: compact field + popover -->
  <div v-if="layout === 'rail'" class="kc-search-rail" @focusin="focused = true" @focusout="focused = false">
    <SearchField
      v-model="query"
      :placeholder="placeholder || 'Search…'"
      @update:model-value="onInput"
      @enter="run(20)"
      @clear="clear"
    />
    <div v-if="showPop" class="kc-search-pop">
      <div v-if="error" class="kc-search-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
      <div v-else-if="results.length" class="kc-search-hits">
        <button v-for="r in results" :key="r.id" class="kc-search-hit" @mousedown.prevent="pick(r)">
          <span class="kc-search-hit-h">
            <span v-if="hitDocTitle(r)" class="kc-search-r-doc"><Icon icon="tabler:file-text" aria-hidden="true" />{{ hitDocTitle(r) }}</span>
            <span class="kc-search-hit-kind">{{ r.node_type || 'result' }}</span>
            <span v-if="r.similarity != null" class="kc-search-hit-score">{{ pct(r.similarity) }}</span>
          </span>
          <span class="kc-search-hit-body">{{ truncate(r.content, 160) }}</span>
        </button>
      </div>
      <div v-else-if="performed && !loading" class="kc-search-state"><Icon icon="tabler:search-off" aria-hidden="true" /><span>No passages matched.</span></div>
      <div v-else-if="loading" class="kc-search-state"><Icon icon="tabler:hourglass" class="kc-search-busy-ico" aria-hidden="true" /><span>Searching…</span></div>
    </div>
  </div>

  <!-- Panel: modes + field + results / answer -->
  <div v-else class="kc-search-panel">
    <div class="kc-search-bar">
      <div v-if="ask" class="kc-search-modes">
        <button class="kc-search-mode" :class="{ on: mode === 'search' }" @click="pickMode('search')">
          <Icon icon="tabler:search" aria-hidden="true" /> Search
        </button>
        <button class="kc-search-mode" :class="{ on: mode === 'ask' }" @click="pickMode('ask')">
          <Icon icon="tabler:message-question" aria-hidden="true" /> Ask
        </button>
      </div>
      <div class="kc-search-field">
        <SearchField
          v-model="query"
          :placeholder="isAsk ? 'Ask this knowledge base a question…' : 'Search every indexed passage…'"
          @enter="submit"
        />
      </div>
      <IconButton :icon="submitIcon" :label="isAsk ? 'Ask' : 'Search'" variant="bordered" :active="loading" :disabled="!query.trim() || loading" @click="submit" />
      <IconButton icon="tabler:x" label="Close search" @click="emit('close')" />
    </div>

    <p v-if="!props.ask" class="kc-search-state">Select an Answer model in knowledge base settings to enable Ask.</p>

    <div v-if="error" class="kc-search-err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>

    <div v-if="loading" class="kc-search-skel"><div v-for="i in 3" :key="i" class="kc-search-skel-row" /></div>

    <template v-else-if="results.length">
      <!-- Ask: synthesized grounded answer, else the best passage as a fallback -->
      <div v-if="isAsk" class="kc-ans">
        <div class="kc-ans-h"><Icon icon="tabler:sparkles" aria-hidden="true" /> {{ answer ? 'Answer' : 'Best match' }} for "{{ queryRan }}"</div>
        <p class="kc-ans-body">{{ answer || truncate(top?.content, 700) }}</p>
        <button v-if="top?.parent_id" class="kc-ans-src" @click="pick(top!)">
          <Icon icon="tabler:file-text" aria-hidden="true" /> Open source document
          <span v-if="top?.similarity != null" class="kc-ans-sim">{{ pct(top?.similarity) }}</span>
        </button>
      </div>

      <div class="kc-search-results">
        <div v-if="isAsk && rest.length" class="kc-search-results-h">Sources</div>
        <button v-for="r in rest" :key="r.id" class="kc-search-result" :class="{ link: !!r.parent_id }" @click="pick(r)">
          <div class="kc-search-r-h">
            <span v-if="hitDocTitle(r)" class="kc-search-r-doc"><Icon icon="tabler:file-text" aria-hidden="true" />{{ hitDocTitle(r) }}</span>
            <span class="kc-search-hit-kind">{{ r.node_type || 'passage' }}</span>
            <span v-if="r.llm_score != null" class="kc-search-r-llm">LLM {{ Math.round(r.llm_score) }}</span>
            <span v-if="r.similarity != null" class="kc-search-hit-score">{{ pct(r.similarity) }}</span>
          </div>
          <p class="kc-search-r-body">{{ truncate(r.content, 360) }}</p>
          <span v-if="r.parent_id" class="kc-search-r-open"><Icon icon="tabler:arrow-up-right" aria-hidden="true" /> Open document</span>
        </button>
      </div>
    </template>

    <div v-else-if="performed" class="kc-search-zero">
      <Icon icon="tabler:search-off" aria-hidden="true" />
      <div class="kc-search-zero-t">No matches</div>
      <div class="kc-search-zero-s">Try different terms or rephrase your question.</div>
    </div>

    <div v-else class="kc-search-zero">
      <Icon :icon="isAsk ? 'tabler:message-question' : 'tabler:search'" aria-hidden="true" />
      <div class="kc-search-zero-t">{{ isAsk ? 'Ask your knowledge base' : 'Search your knowledge base' }}</div>
      <div class="kc-search-zero-s">Two-stage vector + LLM retrieval across every indexed passage.</div>
    </div>
  </div>
</template>
