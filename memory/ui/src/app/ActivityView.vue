<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Tag from 'primevue/tag'
import { fullTime, relativeTime } from './format'
import type { MemoryRun } from './types'
import { severity, type Memory } from './useMemory'

const props = defineProps<{ memory: Memory }>()
const runs = computed<MemoryRun[]>(() => props.memory.status.value?.runs || [])

function title(run: MemoryRun): string {
  if (run.run_type === 'consolidate') return 'Consolidation'
  if (run.run_type === 'reembed') return 'Re-embedding'
  return run.host_kind === 'content' ? 'Learned from a document' : 'Learned from a conversation'
}

function changes(run: MemoryRun): string {
  const s = run.stats || {}
  const parts = [
    s.added ? `${s.added} new` : '',
    s.superseded ? `${s.superseded} updated` : '',
    s.conflicted ? `${s.conflicted} contested` : '',
    s.rejected ? `${s.rejected} rejected` : '',
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : run.status === 'succeeded' ? 'No changes' : ''
}

function rejections(run: MemoryRun): string {
  return Object.entries(run.stats || {})
    .filter(([code, count]) => code.startsWith('rejected_') && count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, count]) => {
      const [step, ...reason] = code.slice('rejected_'.length).split('_')
      return `${step}: ${reason.join(' ')} (${count})`
    }).join(' · ')
}
</script>

<template>
  <header class="mm-view-head">
    <h2 class="mm-view-title"><Icon icon="tabler:activity" aria-hidden="true" />Activity</h2>
    <p class="mm-muted">The latest work on this memory: conversations captured, consolidation and re-embedding.</p>
  </header>
  <div v-if="!runs.length" class="kx-empty kx-empty-spacious">
    <span class="kx-empty-ico"><Icon icon="tabler:activity" aria-hidden="true" /></span>
    <p class="kx-empty-title">Nothing captured yet</p>
    <p class="kx-empty-sub">Each time an agent captures a conversation or consolidates, it shows here.</p>
  </div>
  <ol v-else class="mm-runs">
    <li v-for="run in runs" :key="run.id" class="mm-run" :class="run.status">
      <div class="mm-run-main">
        <span class="mm-run-t">{{ title(run) }}</span>
        <span class="mm-muted" :title="fullTime(run.finished_at || run.started_at || run.created_at)">
          {{ relativeTime(run.finished_at || run.started_at || run.created_at) }}<template v-if="changes(run)"> · {{ changes(run) }}</template>
        </span>
        <span v-if="rejections(run)" class="mm-muted">{{ rejections(run) }}</span>
        <span v-if="run.last_error" class="mm-run-err">{{ run.last_error }}</span>
      </div>
      <Tag v-if="run.status !== 'succeeded'" class="kx-tag-sm" :severity="severity(run.status)" :value="run.status" />
    </li>
  </ol>
</template>
