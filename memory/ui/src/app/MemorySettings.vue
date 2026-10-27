<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import ToggleSwitch from 'primevue/toggleswitch'
import SearchField from './chrome/SearchField.vue'
import { api } from '@wippy-fe/proxy'
import { errorText, isRecord, parseConfig, type MemoryEvents } from './types'
import { usePaged } from './useMemory'

// The Memory trait's settings: the one memory an agent uses and whether it
// learns from conversations. Models, limits and cadence live on the memory.
const CARRIED_KEYS = ['read_enabled', 'recall_limit']

interface MemoryChoice { id: string; name: string; description?: string; item_count?: number }

const props = useProps<{ config?: unknown }>()
const emit = useEvents<MemoryEvents>()

const memoryId = ref('')
const capture = ref(true)
const kept = ref<Record<string, unknown>>({})
const configError = ref('')
const query = ref('')
const debounced = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debounced.value = q.trim() }, 250)
})

onUnmounted(() => clearTimeout(timer))

watch(() => props.value.config, (raw) => {
  try {
    const context = parseConfig(raw)
    memoryId.value = String(context.memory_id || '')
    capture.value = context.write_enabled !== false
    kept.value = Object.fromEntries(Object.entries(context).filter(([key]) => CARRIED_KEYS.includes(key)))
    configError.value = ''
  } catch (err) { configError.value = errorText(err) }
}, { immediate: true, deep: true })

const revision = ref(0)
const choices = usePaged<MemoryChoice>(() => `/api/v1/memory?limit=20${debounced.value ? `&q=${encodeURIComponent(debounced.value)}` : ''}`, 'items', revision)
const current = ref<MemoryChoice | null>(null)
const resolving = ref(false)
const resolveError = ref('')
watch(memoryId, async (id) => {
  current.value = null
  resolveError.value = ''
  if (!id) return
  resolving.value = true
  try {
    const { data } = await api.get(`/api/v1/knowledge/${encodeURIComponent(id)}`)
    if (id !== memoryId.value) return
    if (!isRecord(data) || data.kb_type !== 'memory' || typeof data.name !== 'string') throw new Error('Selected resource is not a memory')
    current.value = { id, name: data.name }
  } catch (err) {
    if (id === memoryId.value) resolveError.value = errorText(err)
  } finally {
    if (id === memoryId.value) resolving.value = false
  }
}, { immediate: true })

function publish(): void {
  emit('config-changed', { context: { ...kept.value, memory_id: memoryId.value, write_enabled: capture.value } })
}

function pick(choice: MemoryChoice): void {
  memoryId.value = choice.id
  publish()
}
</script>

<template>
  <div v-if="configError" class="kx-notice error">{{ configError }}</div>
  <div v-else class="mm-trait">
    <div class="mm-field">
      <span id="trait_memory" class="mm-label">Memory</span>
      <span class="mm-hint">The agent remembers into this memory and recalls from it. Models, limits and cadence are set on the memory.</span>
      <div v-if="resolveError" class="kx-notice error">
        <Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ resolveError }}</span>
      </div>
      <div v-else-if="memoryId && !current && !resolving" class="kx-notice warn">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.</span>
      </div>
      <SearchField v-model="query" placeholder="Find a memory…" label="Find a memory" />
      <div class="mm-choices" role="radiogroup" aria-labelledby="trait_memory">
        <button v-for="choice in choices.rows.value" :key="choice.id" type="button" role="radio" class="mm-choice"
          :class="{ on: choice.id === memoryId }" :aria-checked="choice.id === memoryId" @click="pick(choice)">
          <span class="mm-choice-ic"><Icon :icon="choice.id === memoryId ? 'tabler:circle-check-filled' : 'tabler:brain'" aria-hidden="true" /></span>
          <span class="mm-choice-main">
            <span class="mm-choice-t">{{ choice.name }}</span>
            <span v-if="choice.description || choice.item_count !== undefined" class="mm-choice-s">
              {{ choice.description }}<template v-if="choice.description && choice.item_count !== undefined"> · </template><template v-if="choice.item_count !== undefined">{{ choice.item_count }} memories</template>
            </span>
          </span>
        </button>
        <div v-if="choices.loading.value && !choices.rows.value.length" class="mm-choice-empty"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" />Loading memories…</div>
        <div v-else-if="choices.error.value" class="mm-choice-empty mm-hint-err">{{ choices.error.value }}</div>
        <div v-else-if="!choices.rows.value.length" class="mm-choice-empty">
          {{ debounced ? 'No memory matches.' : 'No memories yet. Create one from Knowledge → New knowledge base → Memory.' }}
        </div>
      </div>
      <button v-if="choices.next.value !== null" type="button" class="kx-btn kx-btn-ghost sm" :disabled="choices.loading.value" @click="choices.more">Show more</button>
    </div>
    <div class="mm-toggle">
      <span class="mm-field">
        <span class="mm-label">Remember conversations</span>
        <span class="mm-hint">Off keeps the memory read-only for this agent: it recalls but learns nothing new.</span>
      </span>
      <ToggleSwitch v-model="capture" aria-label="Remember conversations" @update:model-value="publish" />
    </div>
  </div>
</template>
