<script setup lang="ts">
import { computed } from 'vue'
import Panel from 'primevue/panel'
import ConfigField from './ConfigField.vue'
import type { ConfigSchema, SchemaField } from './types'

// The engine's config_schema as a form, everyday fields first and the
// `group: advanced` ones folded under More settings. The schema is the single
// declaration of memory settings.
const props = defineProps<{ schema: ConfigSchema; modelValue: Record<string, unknown> }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Record<string, unknown>): void }>()

const ordered = computed(() => (Object.entries(props.schema.properties || {}) as [string, SchemaField][])
  .sort((a, b) => (a[1].order ?? 1000) - (b[1].order ?? 1000)))
const basic = computed(() => ordered.value.filter(([, f]) => f.group !== 'advanced'))
const advanced = computed(() => ordered.value.filter(([, f]) => f.group === 'advanced'))

function set(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="mm-stack">
    <ConfigField v-for="[key, field] in basic" :key="key" :name="key" :field="field" :value="modelValue[key]" @update="set(key, $event)" />
    <Panel v-if="advanced.length" header="More settings" toggleable collapsed>
      <div class="mm-stack">
        <ConfigField v-for="[key, field] in advanced" :key="key" :name="key" :field="field" :value="modelValue[key]" @update="set(key, $event)" />
      </div>
    </Panel>
  </div>
</template>
