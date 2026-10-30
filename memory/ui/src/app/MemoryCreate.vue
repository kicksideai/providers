<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import ConfigFields from './ConfigFields.vue'
import ModelPicker from './ModelPicker.vue'
import { errorText, parseConfig, parseCreateSchema, type ConfigSchema, type MemoryCreateEvents } from './types'

interface CreateContext {
  embedding_model?: string
  config?: Record<string, unknown> & { config_schema?: ConfigSchema }
  edit?: boolean
}

const props = useProps<{ config?: unknown }>()
const emit = useEvents<MemoryCreateEvents>()

const configError = ref('')
const ctx = ref<CreateContext>({})
const embeddingModel = ref('class:embed')
const values = ref<Record<string, unknown>>({})
watch(() => props.value.config, (raw) => {
  try {
    const next = parseConfig(raw)
    const config = next.config
    if (!config || typeof config !== 'object') throw new Error('Memory create schema must supply object properties')
    const schema = parseCreateSchema((config as Record<string, unknown>).config_schema)
    const valueConfig = { ...(config as Record<string, unknown>), config_schema: schema }
    ctx.value = { ...next, config: valueConfig } as CreateContext
    const { config_schema: _schema, ...initialValues } = valueConfig
    values.value = { ...initialValues }
    embeddingModel.value = ctx.value.embedding_model || 'class:embed'
    configError.value = ''
    publish()
  } catch (err) { configError.value = errorText(err) }
}, { immediate: true })
const isEdit = computed(() => !!ctx.value.edit)
const schema = computed(() => ctx.value.config?.config_schema as ConfigSchema)

function publish() {
  emit('config-changed', { embedding_model: embeddingModel.value, config: { ...values.value } })
}

function onEmbedding(model: string) {
  embeddingModel.value = model
  publish()
}

function onValues(next: Record<string, unknown>) {
  values.value = next
  publish()
}
</script>

<template>
  <div v-if="configError" class="kx-notice error">{{ configError }}</div>
  <ConfigFields v-else :schema="schema" :model-value="values" @update:model-value="onValues">
    <template #before-models>
      <div class="mm-field wide">
        <span id="embedding_label" class="mm-label">Embedding model</span>
        <span v-if="isEdit" class="mm-hint">{{ embeddingModel }}, fixed when the memory was created.</span>
        <ModelPicker v-else labelled-by="embedding_label" :value="embeddingModel" capability="embed" @select="onEmbedding" />
        <span v-if="!isEdit" class="mm-hint">Turns memories into vectors for search. It cannot change after the memory is created.</span>
      </div>
    </template>
  </ConfigFields>
</template>
