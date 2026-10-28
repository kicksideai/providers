<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import SearchField from './chrome/SearchField.vue'
import { httpStatus, resolveMemory } from './api'
import { errorText, parseConfig, type MemoryEvents } from './types'
import { useDebounced, usePaged } from './usePaged'

interface MemoryChoice { id: string; name: string; description?: string; item_count?: number }

const props = useProps<{ config?: unknown }>()
const emit = useEvents<MemoryEvents>()

const memoryId = ref('')
const configError = ref('')
const query = ref('')
const debounced = useDebounced(query, 250, (value) => value.trim())

watch(() => props.value.config, (raw) => {
  try {
    const context = parseConfig(raw)
    memoryId.value = typeof context.memory_id === 'string' ? context.memory_id : ''
    configError.value = ''
  } catch (err) { configError.value = errorText(err) }
}, { immediate: true, deep: true })

const choices = usePaged<MemoryChoice>(() => `/api/v1/memory?limit=20${debounced.value ? `&q=${encodeURIComponent(debounced.value)}` : ''}`, 'items')
const current = ref<MemoryChoice | null>(null)
const resolving = ref(false)
const resolveError = ref('')
const unavailable = ref(false)
watch(memoryId, async (id) => {
  current.value = null
  resolveError.value = ''
  unavailable.value = false
  if (!id) return
  resolving.value = true
  try {
    const data = await resolveMemory(id)
    if (id !== memoryId.value) return
    current.value = data
  } catch (err) {
    if (id === memoryId.value) {
      if ([403, 404].includes(httpStatus(err) ?? 0) || errorText(err) === 'Selected resource is not a memory') unavailable.value = true
      else resolveError.value = errorText(err)
    }
  } finally {
    if (id === memoryId.value) resolving.value = false
  }
}, { immediate: true })

function publish(): void {
  emit('config-changed', { context: { memory_id: memoryId.value } })
}

const choicesList = computed(() => choices.rows.value)
function onChoiceKeydown(event: KeyboardEvent, index: number): void {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !choicesList.value.length) return
  event.preventDefault()
  const step = event.key === 'ArrowDown' ? 1 : -1
  const next = choicesList.value[(index + step + choicesList.value.length) % choicesList.value.length]
  pick(next)
  requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-memory-choice="${CSS.escape(next.id)}"]`)?.focus())
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
      <span class="mm-hint">Memory learns from conversations automatically and supplies recall. Models, limits and cadence are set on the memory.</span>
      <div v-if="resolveError" class="kx-notice error">
        <Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ resolveError }}</span>
      </div>
      <div v-else-if="unavailable" class="kx-notice warn">
        <Icon icon="tabler:alert-triangle" aria-hidden="true" />
        <span>The memory this agent used is not available to you, or is not a Memory knowledge base. Pick one below.</span>
      </div>
      <SearchField v-model="query" placeholder="Find a memory…" label="Find a memory" />
      <div class="mm-choices" role="radiogroup" aria-labelledby="trait_memory">
        <button v-for="(choice, index) in choices.rows.value" :key="choice.id" type="button" role="radio" class="mm-choice"
          :data-memory-choice="choice.id" :class="{ on: choice.id === memoryId }" :aria-checked="choice.id === memoryId"
          :tabindex="choice.id === memoryId || (!memoryId && index === 0) ? 0 : -1" @click="pick(choice)" @keydown="onChoiceKeydown($event, index)">
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
  </div>
</template>
