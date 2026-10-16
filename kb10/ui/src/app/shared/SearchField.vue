<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Search input with a leading icon and a clear affordance. v-model drives the
// query; `enter` fires on submit for views that search on demand rather than
// as-you-type.
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'enter'): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="kc-search">
    <Icon class="kc-search-ico" icon="tabler:search" aria-hidden="true" />
    <input
      class="kc-search-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder || 'Search…'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter="emit('enter')"
    />
    <button v-if="modelValue" class="kc-search-clear" aria-label="Clear" @click="emit('update:modelValue', ''); emit('clear')">
      <Icon icon="tabler:x" aria-hidden="true" />
    </button>
  </div>
</template>
