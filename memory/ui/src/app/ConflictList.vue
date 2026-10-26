<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { KIND_LABEL, type ConflictGroup, type MemoryItem } from './types'
import { when, type Memory } from './useMemory'

// Contradicting memories, grouped; keeping one makes the others earlier versions.
const props = defineProps<{ memory: Memory }>()

function keep(group: ConflictGroup, winner: MemoryItem) {
  void props.memory.act(() => api.post(`${props.memory.base.value}/conflicts/${encodeURIComponent(group.group_id)}/resolve`, { winner_id: winner.id }))
}
</script>

<template>
  <div class="mm-panel">
    <div v-if="!memory.conflicts.value.length" class="kx-empty">
      <span class="kx-empty-ico"><Icon icon="tabler:circle-check" /></span>
      <p class="kx-empty-title">No conflicts</p>
      <p class="kx-empty-sub">When two memories contradict each other, they wait here for you to keep the right one.</p>
    </div>
    <div v-for="group in memory.conflicts.value" :key="group.group_id" class="mm-conflict">
      <span class="mm-hint">These memories contradict each other. Keep the one that is right; the others become earlier versions.</span>
      <div v-for="item in group.items" :key="item.id" class="mm-option">
        <div><div class="mm-row-t">{{ item.content }}</div><div class="mm-row-s"><Tag class="kx-tag-sm" severity="secondary" :value="KIND_LABEL[item.kind]" /><span>{{ when(item.valid_at) }}</span></div></div>
        <Button label="Keep this" size="small" :disabled="memory.busy.value" @click="keep(group, item)"><template #icon><Icon icon="tabler:check" /></template></Button>
      </div>
    </div>
  </div>
</template>
