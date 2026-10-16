<script setup lang="ts">
// A labeled on/off switch used for the contextual-embedding toggle.
defineProps<{ modelValue: boolean; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>

<template>
  <button
    type="button"
    class="cx-switch"
    :class="{ on: modelValue }"
    :disabled="disabled"
    role="switch"
    :aria-checked="modelValue"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="cx-switch-knob" />
  </button>
</template>
