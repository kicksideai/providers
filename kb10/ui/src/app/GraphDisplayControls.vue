<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Canvas display controls — one horizontal bar on the legend's line. Two orthogonal
// filters plus a reset: the level slider peels the graph open by hierarchy level,
// and concepts-only drops document nodes. Reset lifts both, plus any isolation and
// hidden nodes.
defineProps<{ level: number; maxLevel: number; conceptsOnly: boolean; hiddenCount: number; focused: boolean }>()
const emit = defineEmits<{
  (e: 'update:level', v: number): void
  (e: 'toggle-concepts'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="gx-display">
    <div v-if="maxLevel > 1" class="gx-display-slider" :title="`Showing ${level} of ${maxLevel} levels`">
      <Icon class="gx-display-ic" icon="tabler:stack-2" aria-hidden="true" />
      <input
        class="gx-range"
        type="range"
        min="1"
        :max="maxLevel"
        :value="level"
        aria-label="Graph depth"
        @input="emit('update:level', Number(($event.target as HTMLInputElement).value))"
      />
      <span class="gx-display-lvl">{{ level }}<span class="gx-display-lvl-max">/{{ maxLevel }}</span></span>
      <span class="gx-display-div" aria-hidden="true" />
    </div>

    <button
      class="gx-display-row"
      role="switch"
      :aria-checked="conceptsOnly"
      :title="conceptsOnly ? 'Show document nodes' : 'Hide document nodes — concepts only'"
      @click="emit('toggle-concepts')"
    >
      <Icon :icon="conceptsOnly ? 'tabler:files-off' : 'tabler:files'" class="gx-display-ic" aria-hidden="true" />
      <span class="gx-display-label">Concepts only</span>
      <span class="gx-display-sw" :class="{ on: conceptsOnly }"><span class="gx-display-knob" /></span>
    </button>

    <template v-if="hiddenCount || focused || level < maxLevel">
      <span class="gx-display-div" aria-hidden="true" />
      <button class="gx-display-reset" title="Show every node and clear branch isolation" @click="emit('reset')">
        <Icon icon="tabler:arrow-back-up" aria-hidden="true" />
        <span>Reset</span>
      </button>
    </template>
  </div>
</template>
