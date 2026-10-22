<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import ConfigFields from './ConfigFields.vue'
import { savedConfig, shownConfig } from './settings'
import type { Memory } from './useMemory'

// The memory's settings, rendered from the engine's config schema and saved
// through the knowledge control plane. Only stored values and edits are saved.
const props = defineProps<{ memory: Memory }>()
const edits = ref<Record<string, unknown>>({})
const saved = ref(false)
const stored = computed(() => props.memory.status.value?.config || {})
const values = computed(() => ({ ...shownConfig(props.memory.status.value?.defaults || {}, stored.value), ...edits.value }))
const dirty = computed(() => Object.keys(edits.value).length > 0)

watch(() => props.memory.kbId.value, () => { edits.value = {} })

function edit(next: Record<string, unknown>) {
  const changed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(next)) {
    if (value !== values.value[key] || key in edits.value) changed[key] = value
  }
  edits.value = { ...edits.value, ...changed }
  saved.value = false
}

async function save() {
  const config = savedConfig(stored.value, edits.value)
  if (await props.memory.act(() => api.put(`/api/v1/knowledge/${encodeURIComponent(props.memory.kbId.value)}`, { config }))) {
    edits.value = {}
    saved.value = true
  }
}
</script>

<template>
  <div class="mm-panel">
    <div class="mm-panel-b">
      <ConfigFields v-if="memory.status.value" :model-value="values" :schema="memory.status.value.config_schema" @update:model-value="edit" />
      <div class="mm-actions">
        <Button label="Save settings" size="small" :disabled="memory.busy.value || !dirty" @click="save"><template #icon><Icon icon="tabler:device-floppy" /></template></Button>
        <span v-if="saved" class="mm-hint">Saved.</span>
      </div>
    </div>
  </div>
</template>
