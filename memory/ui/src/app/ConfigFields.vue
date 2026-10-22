<script setup lang="ts">
import { computed } from 'vue'
import MmSwitch from './shared/MmSwitch.vue'
import ModelPicker from './shared/ModelPicker.vue'
import type { ConfigSchema, SchemaField } from './memoryTypes'

// Renders the engine's config_schema as a form: model pickers, switches,
// numbers and text. The schema is the single declaration of memory settings.
const props = defineProps<{ schema: ConfigSchema; modelValue: Record<string, unknown> }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Record<string, unknown>): void }>()

const ordered = computed(() => (Object.entries(props.schema.properties || {}) as [string, SchemaField][])
  .sort((a, b) => (a[1].order ?? 1000) - (b[1].order ?? 1000)))
const basic = computed(() => ordered.value.filter(([, f]) => f.group !== 'advanced'))
const advanced = computed(() => ordered.value.filter(([, f]) => f.group === 'advanced'))

function set(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function numberInput(key: string, field: SchemaField, event: Event) {
  const raw = (event.target as HTMLInputElement).value
  if (raw === '') return
  const n = Number(raw)
  if (!Number.isFinite(n)) return
  set(key, field.type === 'integer' ? Math.round(n) : n)
}
</script>

<template>
  <div class="mm-pane">
    <template v-for="[key, field] in basic" :key="key">
      <div v-if="field.type === 'boolean'" class="mm-toggle">
        <div class="mm-field">
          <span class="mm-label">{{ field.title || key }}</span>
          <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
        </div>
        <MmSwitch :label="field.title || key" :model-value="modelValue[key] === true" @update:model-value="set(key, $event)" />
      </div>
      <div v-else-if="field.web_component === 'wc-model-picker'" class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <ModelPicker :value="String(modelValue[key] || '')" capability="generate" @select="set(key, $event)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </div>
      <label v-else-if="field.type === 'integer' || field.type === 'number'" class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <input class="mm-input" type="number" :name="key" :min="field.minimum" :max="field.maximum"
          :step="field.type === 'integer' ? 1 : 'any'" :value="modelValue[key] as number" @input="numberInput(key, field, $event)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </label>
      <label v-else class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <textarea v-if="field.format === 'textarea'" class="mm-textarea" :name="key" :value="String(modelValue[key] ?? '')"
          @input="set(key, ($event.target as HTMLTextAreaElement).value)"></textarea>
        <input v-else class="mm-input" :name="key" :value="String(modelValue[key] ?? '')"
          @input="set(key, ($event.target as HTMLInputElement).value)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </label>
    </template>
    <details v-if="advanced.length" class="mm-more">
      <summary>More settings</summary>
      <div class="mm-pane">
    <template v-for="[key, field] in advanced" :key="key">
      <div v-if="field.type === 'boolean'" class="mm-toggle">
        <div class="mm-field">
          <span class="mm-label">{{ field.title || key }}</span>
          <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
        </div>
        <MmSwitch :label="field.title || key" :model-value="modelValue[key] === true" @update:model-value="set(key, $event)" />
      </div>
      <div v-else-if="field.web_component === 'wc-model-picker'" class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <ModelPicker :value="String(modelValue[key] || '')" capability="generate" @select="set(key, $event)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </div>
      <label v-else-if="field.type === 'integer' || field.type === 'number'" class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <input class="mm-input" type="number" :name="key" :min="field.minimum" :max="field.maximum"
          :step="field.type === 'integer' ? 1 : 'any'" :value="modelValue[key] as number" @input="numberInput(key, field, $event)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </label>
      <label v-else class="mm-field">
        <span class="mm-label">{{ field.title || key }}</span>
        <textarea v-if="field.format === 'textarea'" class="mm-textarea" :name="key" :value="String(modelValue[key] ?? '')"
          @input="set(key, ($event.target as HTMLTextAreaElement).value)"></textarea>
        <input v-else class="mm-input" :name="key" :value="String(modelValue[key] ?? '')"
          @input="set(key, ($event.target as HTMLInputElement).value)" />
        <span v-if="field.description" class="mm-hint">{{ field.description }}</span>
      </label>
    </template>
      </div>
    </details>
  </div>
</template>
