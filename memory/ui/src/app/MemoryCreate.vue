<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import ConfigFields from './ConfigFields.vue'
import ModelPicker from './ModelPicker.vue'
import { errorText, isRecord, parseConfig, type ConfigSchema } from './types'

interface CreateContext {
  embedding_model?: string
  config?: Record<string, unknown> & { config_schema?: ConfigSchema }
  edit?: boolean
}
interface E { 'config-changed': { embedding_model: string; config: Record<string, unknown> } }

const props = useProps<{ config?: unknown }>()
const emit = useEvents<E>()

const configError = ref('')
const ctx = ref<CreateContext>({})
watch(() => props.value.config, (raw) => {
  try {
    ctx.value = parseConfig(raw) as CreateContext
    configError.value = ''
  } catch (err) { configError.value = errorText(err) }
}, { immediate: true })
const isEdit = computed(() => !!ctx.value.edit)
const schema = computed<ConfigSchema>(() => (isRecord(ctx.value.config?.config_schema) ? ctx.value.config?.config_schema : {}) as ConfigSchema)

const embeddingModel = ref('class:embed')
const values = ref<Record<string, unknown>>({})

watch(ctx, (next) => {
  const { config_schema: _schema, ...config } = next.config || {}
  values.value = { ...config }
  if (next.embedding_model) embeddingModel.value = next.embedding_model
  publish()
}, { immediate: true })

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
