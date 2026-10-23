<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import AgentRuleForm from './AgentRuleForm.vue'
import MemoryDetail from './MemoryDetail.vue'
import { KIND_LABEL, errorText, isRecord, kindOptions, type MemoryItem, type MemoryKind, type MemoryStatus } from './types'
import type { Memory } from './useMemory'

// Memories of one status and kind, with the selected one's detail or the form
// that adds an agent's identity, rule, skill or lesson beside the list.
const props = defineProps<{ memory: Memory }>()

const KINDS = kindOptions()
const VIEWS: { value: MemoryStatus; label: string }[] = [
  { value: 'current', label: 'Current' }, { value: 'superseded', label: 'Earlier versions' }, { value: 'archived', label: 'Archived' },
]
const status = ref<MemoryStatus>('current')
const kind = ref<MemoryKind | null>(null)
const items = ref<MemoryItem[]>([])
const loading = ref(true)
const selected = ref<MemoryItem | null>(null)
const adding = ref(false)

async function load() {
  const query = new URLSearchParams({ limit: '200', status: status.value })
  if (kind.value) query.set('kind', kind.value)
  try {
    const { data } = await api.get(`${props.memory.base.value}/items?${query.toString()}`)
    items.value = (isRecord(data) && Array.isArray(data.items) ? data.items : []) as MemoryItem[]
  } catch (err) {
    props.memory.error.value = errorText(err)
  } finally {
    loading.value = false
  }
}

watch([status, kind, props.memory.revision], () => { void load() }, { immediate: true })

function open(item: MemoryItem) {
  adding.value = false
  selected.value = item
}
</script>

<template>
  <div class="mm-filters">
    <SelectButton v-model="status" :options="VIEWS" option-label="label" option-value="value" :allow-empty="false" size="small" aria-label="Status" />
    <Select v-model="kind" :options="KINDS" option-label="label" option-value="value" size="small" placeholder="All kinds" show-clear aria-label="Kind" />
    <Button v-if="!adding" label="Add agent memory" size="small" severity="secondary" outlined @click="adding = true; selected = null">
      <template #icon><Icon icon="tabler:plus" /></template>
    </Button>
  </div>
  <div class="mm-split" :class="{ solo: !adding && !selected }">
    <div class="mm-panel">
      <div v-if="loading" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" />Loading memories</div>
      <div v-else-if="!items.length" class="kx-empty">
        <span class="kx-empty-ico"><Icon icon="tabler:brain" /></span>
        <p class="kx-empty-title">Nothing here yet</p>
        <p class="kx-empty-sub">Memories appear as agents talk with people, or add the agent's identity and rules yourself.</p>
      </div>
      <button v-for="item in items" v-else :key="item.id" class="mm-row" :class="{ on: selected?.id === item.id }" @click="open(item)">
        <span>
          <span class="mm-row-t">{{ item.content }}</span>
          <span class="mm-row-s">
            <Tag class="kx-tag-sm" severity="secondary" :value="KIND_LABEL[item.kind]" />
            <span>{{ item.scope_family === 'agent' ? 'agent' : 'person' }} · {{ item.key }} · v{{ item.version }}</span>
          </span>
        </span>
      </button>
    </div>
    <AgentRuleForm v-if="adding" :memory="memory" @done="adding = false" />
    <MemoryDetail v-else-if="selected" :memory="memory" :item="selected" @replaced="selected = $event" />
  </div>
</template>
