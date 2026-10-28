<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import ActivityView from './ActivityView.vue'
import AddMemory from './AddMemory.vue'
import ConflictView from './ConflictView.vue'
import IconButton from './chrome/IconButton.vue'
import SideDrawer from './chrome/SideDrawer.vue'
import MemoryDetail from './MemoryDetail.vue'
import MemoryRail from './MemoryRail.vue'
import { errorText, parseConfig, type MemoryItem } from './types'
import { useMemory } from './useMemory'

const props = useProps<{ config?: unknown }>()
const emit = useEvents<{ navigate: string }>()
const configError = ref('')
const context = ref<Record<string, unknown>>({})
watch(() => props.value.config, (raw) => {
  try {
    context.value = parseConfig(raw)
    configError.value = ''
  } catch (err) { configError.value = errorText(err) }
}, { immediate: true })
const memory = useMemory(computed(() => String(context.value.kb_id || '')))

type View = 'item' | 'conflicts' | 'activity'
const view = ref<View>('item')
const selectedId = ref(String(context.value.route || ''))
const adding = ref(false)
const activeStatus = ref<'current' | 'superseded' | 'archived'>('current')

const total = computed(() => memory.status.value?.counts[activeStatus.value])
const conflictCount = computed(() => memory.status.value?.counts.conflict_groups || 0)
const failedRuns = computed(() => (memory.status.value?.runs || []).filter((run) => run.status === 'failed').length)

watch(() => context.value.route, (route) => {
  const next = typeof route === 'string' ? route : ''
  if (next !== selectedId.value) {
    routeUpdate = true
    selectedId.value = next
    if (next) view.value = 'item'
  }
})
watch(memory.memoryId, () => { selectedId.value = ''; view.value = 'item' })
let routeUpdate = false
watch(selectedId, (id) => {
  if (routeUpdate) { routeUpdate = false; return }
  emit('navigate', id || '')
})

function open(id: string) {
  view.value = 'item'
  if (id === selectedId.value) return
  selectedId.value = id
}

function select(item: MemoryItem) { open(item.id) }

function toggle(next: View) {
  view.value = view.value === next ? 'item' : next
}

function added(id: string) {
  adding.value = false
  if (id) open(id)
}
</script>

<template>
  <div v-if="configError" class="kx-notice error">{{ configError }}</div>
  <div v-else class="mm-page">
    <div v-if="memory.error.value" class="kx-notice error mm-page-note">
      <Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ memory.error.value }}</span>
    </div>
    <div class="kx-shell">
      <aside class="kx-rail">
        <div class="kx-railhead">
          <span class="kx-railhead-title">Memories<b v-if="total !== undefined">{{ total }}</b></span>
          <div class="kx-railhead-acts">
            <IconButton icon="tabler:activity" :label="failedRuns ? `Activity, ${failedRuns} failed` : 'Activity'" :active="view === 'activity'" @click="toggle('activity')" />
            <IconButton icon="tabler:plus" label="Add agent memory" @click="adding = true" />
          </div>
        </div>
        <button v-if="conflictCount" type="button" class="mm-conflict-bar" :class="{ on: view === 'conflicts' }" @click="toggle('conflicts')">
          <Icon icon="tabler:arrows-split-2" aria-hidden="true" />
          <span>{{ conflictCount === 1 ? '1 conflict to resolve' : `${conflictCount} conflicts to resolve` }}</span>
          <Icon icon="tabler:chevron-right" aria-hidden="true" />
        </button>
        <MemoryRail :memory="memory" :selected-id="view === 'item' ? selectedId : ''" @select="select" @filtered="selectedId = ''" @status-change="activeStatus = $event as 'current' | 'superseded' | 'archived'" />
      </aside>
      <main class="kx-main">
        <div class="kx-main-scroll mm-main">
          <ConflictView v-if="view === 'conflicts'" :memory="memory" />
          <ActivityView v-else-if="view === 'activity'" :memory="memory" />
          <MemoryDetail v-else-if="selectedId" :key="selectedId" :memory="memory" :item-id="selectedId"
            @replaced="open" @gone="selectedId = ''" />
          <div v-else class="kx-empty kx-empty-spacious mm-empty">
            <span class="kx-empty-ico"><Icon icon="tabler:brain" aria-hidden="true" /></span>
            <p class="kx-empty-title">Select a memory</p>
            <p class="kx-empty-sub">Pick one from the list to see what it says, how it changed and where it was learned.</p>
          </div>
        </div>
      </main>
    </div>
    <SideDrawer :open="adding" title="Add agent memory" icon="tabler:plus" @close="adding = false">
      <AddMemory v-if="adding" :memory="memory" @added="added" />
    </SideDrawer>
  </div>
</template>
