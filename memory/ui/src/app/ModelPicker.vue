<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Message from 'primevue/message'
import { loadByTagName } from '@wippy-fe/proxy'

// The shared model picker (wc-model-picker). A picker that cannot load is
// reported, not replaced by a free-text field.
defineProps<{ value: string; capability: 'embed' | 'generate' }>()
const emit = defineEmits<{ (e: 'select', v: string): void }>()
const ready = ref(!!customElements.get('wc-model-picker'))
const failed = ref('')

onMounted(async () => {
  if (ready.value) return
  try {
    await loadByTagName('wc-model-picker', { timeoutMs: 8000 })
    ready.value = true
  } catch (err) {
    failed.value = err instanceof Error ? err.message : String(err)
  }
})

function onSelect(event: Event) {
  const detail: unknown = event instanceof CustomEvent ? event.detail : undefined
  if (typeof detail === 'string' && detail) emit('select', detail)
}
</script>

<template>
  <wc-model-picker v-if="ready" :value="value" :capability="capability" @select="onSelect"></wc-model-picker>
  <Message v-else-if="failed" severity="error" size="small">The model picker could not load: {{ failed }}</Message>
</template>
