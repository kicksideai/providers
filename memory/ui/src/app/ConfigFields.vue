<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import ConfigField from './ConfigField.vue'
import type { ConfigSchema, SchemaField } from './types'

// The engine's config_schema as a form, one titled section per field
// `section`, in field order. The schema is the single declaration of memory
// settings; the sections only say how they read. A `before-<section>` slot
// puts a field the schema does not hold at the start of that section.
const props = defineProps<{ schema: ConfigSchema; modelValue: Record<string, unknown> }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Record<string, unknown>): void }>()

const SECTIONS: Record<string, { title: string; icon: string; hint: string }> = {
  models: { title: 'Models', icon: 'tabler:cpu', hint: 'Which models read conversations and decide what changes in the memory.' },
  learning: { title: 'What it learns', icon: 'tabler:school', hint: 'What agents that use this memory capture into it.' },
  recall: { title: 'What agents see', icon: 'tabler:eye', hint: 'How much of the memory goes into an agent\'s instructions and each step.' },
  upkeep: { title: 'Upkeep', icon: 'tabler:refresh', hint: 'Background work that keeps the memory tidy.' },
}

const sections = computed(() => {
  const ordered = (Object.entries(props.schema.properties || {}) as [string, SchemaField][])
    .sort((a, b) => (a[1].order ?? 1000) - (b[1].order ?? 1000))
  const groups: { id: string; fields: [string, SchemaField][] }[] = []
  for (const entry of ordered) {
    const id = entry[1].section || 'other'
    const group = groups.find((g) => g.id === id)
    if (group) group.fields.push(entry)
    else groups.push({ id, fields: [entry] })
  }
  return groups
})

function wide(field: SchemaField): boolean {
  return field.type === 'boolean' || field.format === 'textarea'
}

function set(key: string, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="mm-sections">
    <section v-for="section in sections" :key="section.id" class="mm-section">
      <template v-if="SECTIONS[section.id]">
        <h3 class="mm-section-h"><Icon :icon="SECTIONS[section.id].icon" aria-hidden="true" />{{ SECTIONS[section.id].title }}</h3>
        <p class="mm-section-hint">{{ SECTIONS[section.id].hint }}</p>
      </template>
      <div class="mm-grid">
        <slot :name="`before-${section.id}`" />
        <ConfigField v-for="[key, field] in section.fields" :key="key" :class="{ wide: wide(field) }" :name="key" :field="field"
          :value="modelValue[key]" @update="set(key, $event)" />
      </div>
    </section>
  </div>
</template>
