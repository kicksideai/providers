<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import SelectButton from 'primevue/selectbutton'
import SearchField from './chrome/SearchField.vue'
import { GROUPS, KIND_META, relativeTime, topicLabel, type KindGroup } from './format'
import type { MemoryItem, MemoryStatus } from './types'
import { usePaged, type Memory } from './useMemory'

const props = defineProps<{ memory: Memory; selectedId: string }>()
const emit = defineEmits<{ (e: 'select', item: MemoryItem): void; (e: 'filtered'): void }>()

const VIEWS: { value: MemoryStatus; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'superseded', label: 'Earlier' },
  { value: 'archived', label: 'Archived' },
]
const status = ref<MemoryStatus>('current')
const query = ref('')
const debounced = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debounced.value = q.trim() }, 250)
})

onUnmounted(() => clearTimeout(timer))

const list = usePaged<MemoryItem>(() => {
  if (!props.memory.memoryId.value) return null
  const params = new URLSearchParams({ status: status.value, limit: '100' })
  if (debounced.value) params.set('q', debounced.value)
  return `${props.memory.base.value}/items?${params.toString()}`
}, 'items', props.memory.revision)

watch([status, debounced], () => emit('filtered'))

const closed = ref<Record<KindGroup, boolean>>({ instructions: false, knowhow: false, plans: false, people: false })
const sections = computed(() => GROUPS
  .map((group) => ({ ...group, items: list.rows.value.filter((item) => KIND_META[item.kind]?.group === group.id) }))
  .filter((group) => group.items.length))

const emptyText = computed(() => {
  if (debounced.value) return 'No memories match this search.'
  if (status.value === 'superseded') return 'No earlier versions yet.'
  if (status.value === 'archived') return 'Nothing archived.'
  return 'Nothing remembered yet. Memories appear as agents talk with people.'
})
</script>

<template>
  <div class="mm-rail-tools">
    <SearchField v-model="query" placeholder="Search memories…" label="Search memories" />
    <SelectButton v-model="status" class="mm-views" :options="VIEWS" option-label="label" option-value="value"
      :allow-empty="false" size="small" aria-label="Which memories" />
  </div>
  <nav class="kx-rail-body" aria-label="Memories">
    <div v-if="list.loading.value && !list.rows.value.length" class="mm-skel"><div v-for="i in 6" :key="i" class="mm-skel-row" /></div>
    <div v-else-if="list.error.value" class="kx-notice error mm-rail-note"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ list.error.value }}</span></div>
    <div v-else-if="!list.rows.value.length" class="mm-rail-empty">{{ emptyText }}</div>
    <div v-for="section in sections" :key="section.id" class="kx-railsec" :class="{ closed: closed[section.id] }">
      <button type="button" class="kx-railsec-h" :aria-expanded="!closed[section.id]" @click="closed[section.id] = !closed[section.id]">
        <Icon class="kx-railsec-chev" icon="tabler:chevron-right" aria-hidden="true" />
        <Icon class="kx-railsec-ic" :icon="section.icon" aria-hidden="true" />
        <span class="kx-railsec-t">{{ section.title }}</span>
        <span class="count">{{ section.items.length }}</span>
      </button>
      <div v-show="!closed[section.id]" class="kx-railsec-b">
        <button v-for="item in section.items" :key="item.id" type="button" class="mm-row" :class="{ on: selectedId === item.id }"
          :aria-current="selectedId === item.id ? 'true' : undefined" @click="emit('select', item)">
          <span class="mm-row-ic" :class="KIND_META[item.kind]?.group"><Icon :icon="KIND_META[item.kind]?.icon || 'tabler:note'" aria-hidden="true" /></span>
          <span class="mm-row-main">
            <span class="mm-row-t">{{ item.content }}</span>
            <span class="mm-row-s">{{ topicLabel(item.key) }} · {{ relativeTime(item.valid_at) }}</span>
          </span>
        </button>
      </div>
    </div>
    <button v-if="list.next.value !== null" type="button" class="kx-btn kx-btn-ghost sm mm-more" :disabled="list.loading.value" @click="list.more">
      <Icon v-if="list.loading.value" icon="tabler:loader-2" class="spin" aria-hidden="true" />Show more
    </button>
  </nav>
</template>
