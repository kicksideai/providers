<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Tag from 'primevue/tag'
import type { MemoryRun } from './types'
import { severity, when } from './useMemory'

// Capture, consolidation and re-embedding runs, newest first, with what each
// changed and why a failed one failed.
defineProps<{ runs: MemoryRun[] }>()

function title(run: MemoryRun): string {
  if (run.run_type === 'consolidate') return 'Consolidation'
  if (run.run_type === 'reembed') return 'Re-embedding'
  return run.host_kind === 'content' ? 'Learned from content' : 'Learned from a conversation'
}
</script>

<template>
  <div class="mm-panel">
    <div v-if="!runs.length" class="kx-empty">
      <span class="kx-empty-ico"><Icon icon="tabler:activity" /></span>
      <p class="kx-empty-title">Nothing captured yet</p>
      <p class="kx-empty-sub">Each time an agent captures a conversation or consolidates, the run shows here.</p>
    </div>
    <div v-for="run in runs" :key="run.id" class="mm-row">
      <span>
        <span class="mm-row-t">{{ title(run) }}</span>
        <span class="mm-row-s">
          <span>{{ when(run.finished_at || run.started_at || run.created_at) }}</span>
          <span v-if="run.stats?.added">+{{ run.stats.added }} new</span>
          <span v-if="run.stats?.superseded">{{ run.stats.superseded }} updated</span>
          <span v-if="run.stats?.conflicted">{{ run.stats.conflicted }} contested</span>
        </span>
        <span v-if="run.last_error" class="mm-row-s mm-row-err">{{ run.last_error }}</span>
      </span>
      <Tag v-if="run.status !== 'succeeded'" class="kx-tag-sm" :severity="severity(run.status)" :value="run.status" />
    </div>
  </div>
</template>
