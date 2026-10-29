<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import Tag from 'primevue/tag'
import { fullTime, relativeTime, severity, STATUS_LABEL } from './format'
import type { MemoryRun } from './types'
import { type Memory } from './useMemory'

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
        <span v-if="run.last_error" class="mm-run-err">{{ run.last_error }}</span>
        <template v-if="run.status === 'failed'">
          <span v-if="run.to_event_id" class="mm-muted">Range: {{ run.from_event_id || 'Beginning' }} → {{ run.to_event_id }}</span>
          <details v-if="run.model_output !== undefined">
            <summary>Rejected model output</summary>
            <pre class="mm-value">{{ JSON.stringify(run.model_output, null, 2) }}</pre>
          </details>
        </template>
      </div>
      <Tag v-if="run.status !== 'succeeded'" class="kx-tag-sm" :severity="severity(run.status)" :value="STATUS_LABEL[run.status]" />
    </li>
  </ol>
</template>
