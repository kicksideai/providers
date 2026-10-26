<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import { KIND_META, relativeTime, sourceLabel, topicLabel } from './format'
import type { ConflictGroup, MemoryItem } from './types'
import { usePaged, type Memory } from './useMemory'

// Memories that contradict each other, one card per group. Keeping one makes the
// others earlier versions; agents see an open group as unresolved alternatives.
const props = defineProps<{ memory: Memory }>()

const groups = usePaged<ConflictGroup>(() => (props.memory.kbId.value ? `${props.memory.base.value}/conflicts` : null), 'groups', props.memory.revision)

function keep(group: ConflictGroup, winner: MemoryItem) {
  const target = `${props.memory.base.value}/conflicts/${encodeURIComponent(group.group_id)}/resolve`
  void props.memory.act(() => api.post(target, { winner_id: winner.id }))
}
</script>

<template>
  <header class="mm-view-head">
    <h2 class="mm-view-title"><Icon icon="tabler:arrows-split-2" aria-hidden="true" />Conflicts</h2>
    <p class="mm-muted">These memories contradict each other. Keep the one that is right; the others move to earlier versions. Until then, agents treat them as unresolved.</p>
  </header>
  <div v-if="groups.error.value" class="kx-notice error"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ groups.error.value }}</span></div>
  <div v-else-if="!groups.loading.value && !groups.rows.value.length" class="kx-empty kx-empty-spacious">
    <span class="kx-empty-ico"><Icon icon="tabler:circle-check" aria-hidden="true" /></span>
    <p class="kx-empty-title">No conflicts</p>
    <p class="kx-empty-sub">When two memories contradict each other they wait here for you to keep the right one.</p>
  </div>
  <section v-for="group in groups.rows.value" :key="group.group_id" class="mm-card" :aria-label="`Conflict about ${topicLabel(group.items[0]?.key || '')}`">
    <div class="mm-card-h"><span class="kx-chip">{{ KIND_META[group.items[0]?.kind]?.label }}</span>{{ topicLabel(group.items[0]?.key || '') }}</div>
    <div v-for="option in group.items" :key="option.id" class="mm-option">
      <div class="mm-option-main">
        <span class="mm-option-t">{{ option.content }}</span>
        <span class="mm-muted">{{ relativeTime(option.valid_at) }} · {{ sourceLabel(option.source) }}</span>
      </div>
      <button type="button" class="kx-btn kx-btn-soft sm" :disabled="memory.busy.value" @click="keep(group, option)">
        <Icon icon="tabler:check" aria-hidden="true" />Keep this
      </button>
    </div>
  </section>
  <button v-if="groups.next.value !== null" type="button" class="kx-btn kx-btn-ghost sm mm-more" :disabled="groups.loading.value" @click="groups.more">Show more conflicts</button>
</template>
