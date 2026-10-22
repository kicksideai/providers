<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import ConfigFields from './ConfigFields.vue'
import type { Memory } from './useMemory'

// The memory's settings, rendered from the engine's config schema and saved
// through the knowledge control plane.
const props = defineProps<{ memory: Memory }>()
const values = ref<Record<string, unknown>>({})
const dirty = ref(false)
const saved = ref(false)

// A refresh shows the stored settings unless there are unsaved edits.
watch(() => props.memory.status.value?.config, (config) => {
  if (!dirty.value) values.value = { ...(config || {}) }
}, { immediate: true })

function edit(next: Record<string, unknown>) {
  values.value = next
  dirty.value = true
  saved.value = false
}

async function save() {
  if (await props.memory.act(() => api.put(`/api/v1/knowledge/${encodeURIComponent(props.memory.kbId.value)}`, { config: values.value }))) {
    dirty.value = false
    saved.value = true
  }
}
</script>

<template>
  <div class="mm-panel">
    <div class="mm-panel-b">
      <ConfigFields v-if="memory.status.value" :model-value="values" :schema="memory.status.value.config_schema" @update:model-value="edit" />
      <div class="mm-actions">
        <Button label="Save settings" size="small" :disabled="memory.busy.value" @click="save"><template #icon><Icon icon="tabler:device-floppy" /></template></Button>
        <span v-if="saved" class="mm-hint">Saved.</span>
      </div>
    </div>
  </div>
</template>
