<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import ConfigFields from './ConfigFields.vue'
import ModelPicker from './shared/ModelPicker.vue'
import { isRecord, type ConfigSchema } from './memoryTypes'

// The memory engine's pane of the knowledge base create/edit dialog. The
// embedding model is fixed when the memory is created; every other setting is
// rendered from the engine's config_schema and sent back as config.
interface CreateContext {
  id?: string
  kb_type?: string
  embedding_model?: string
  config?: Record<string, unknown> & { config_schema?: ConfigSchema }
  edit?: boolean
}
interface P { config?: CreateContext | string | null }
interface E { 'config-changed': { embedding_model: string; config: Record<string, unknown> } }

const props = useProps<P>()
const emit = useEvents<E>()

const ctx = computed<CreateContext>(() => {
  const raw = props.value.config
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as CreateContext } catch { return {} }
  }
  return raw || {}
})
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
  <div class="mm-pane">
    <div class="mm-field">
      <span class="mm-label">Embedding model</span>
      <span v-if="isEdit" class="mm-hint">{{ embeddingModel }} — fixed when the memory was created.</span>
      <ModelPicker v-else :value="embeddingModel" capability="embed" @select="onEmbedding" />
      <span v-if="!isEdit" class="mm-hint">Vectors are 512-dimensional; the model cannot change later.</span>
    </div>
    <ConfigFields :schema="schema" :model-value="values" @update:model-value="onValues" />
  </div>
</template>
