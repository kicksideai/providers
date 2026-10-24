<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed } from 'vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import ModelPicker from './ModelPicker.vue'
import type { SchemaField } from './types'

// One engine setting, rendered from its config_schema field.
const props = defineProps<{ name: string; field: SchemaField; value: unknown }>()
const emit = defineEmits<{ (e: 'update', v: unknown): void }>()
const title = computed(() => props.field.title || props.name)
</script>

<template>
  <div v-if="field.type === 'boolean'" class="mm-toggle">
    <span class="mm-field">
      <span class="mm-label">{{ title }}</span>
      <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
    </span>
    <ToggleSwitch :model-value="value === true" :aria-label="title" @update:model-value="emit('update', $event)" />
  </div>
  <div v-else class="mm-field">
    <label :id="`${name}_label`" class="mm-label" :for="name">{{ title }}</label>
    <ModelPicker v-if="field.web_component === 'wc-model-picker'" :labelled-by="`${name}_label`" :value="String(value || '')"
      capability="generate" @select="emit('update', $event)" />
    <InputNumber v-else-if="field.type === 'integer' || field.type === 'number'" :input-id="name"
      :model-value="typeof value === 'number' ? value : null" :min="field.minimum" :max="field.maximum"
      :max-fraction-digits="field.type === 'integer' ? 0 : 6" @update:model-value="$event !== null && emit('update', $event)" />
    <Textarea v-else-if="field.format === 'textarea'" :id="name" :model-value="String(value ?? '')" auto-resize
      @update:model-value="emit('update', $event)" />
    <InputText v-else :id="name" :model-value="String(value ?? '')" @update:model-value="emit('update', $event)" />
    <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
  </div>
</template>
