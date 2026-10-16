<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { NODE_COLORS } from './types'

// Collapsible glass legend. Nodes are colored by topic cluster (one hue per
// top-level branch); this maps the fixed markers (root, document) and the edge
// styles. Defaults collapsed to a chip so it never crowds the canvas; click to open.
const open = ref(false)
</script>

<template>
  <div class="gx-legend" :class="{ collapsed: !open }">
    <button type="button" class="gx-legend-toggle" :aria-label="open ? 'Hide legend' : 'Show legend'" :aria-expanded="open" :title="open ? 'Hide legend' : 'Show legend'" @click="open = !open">
      <Icon :icon="open ? 'tabler:chevron-down' : 'tabler:list-details'" />
      <span v-if="!open">Legend</span>
    </button>
    <div v-if="open" class="gx-legend-body">
      <div class="gx-legend-row">
        <span class="gx-legend-mark gx-legend-cluster" />
        Color = topic cluster
      </div>
      <div class="gx-legend-row">
        <span class="gx-legend-mark" :style="{ background: NODE_COLORS.root.fill }" />
        Root concept
      </div>
      <div class="gx-legend-row">
        <span class="gx-legend-mark doc" :style="{ background: NODE_COLORS.document.fill }" />
        Source document
      </div>
      <div class="gx-legend-sep" />
      <div class="gx-legend-row"><span class="gx-legend-line subtopic" />subtopic</div>
      <div class="gx-legend-row"><span class="gx-legend-line categorized" />categorized</div>
    </div>
  </div>
</template>
