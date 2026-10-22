<script setup lang="ts">
defineProps<{ modelValue: boolean; disabled?: boolean; label: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>

<template>
  <button type="button" class="mm-switch" :class="{ on: modelValue }" :disabled="disabled" role="switch"
    :aria-checked="modelValue" :aria-label="label" @click="emit('update:modelValue', !modelValue)">
    <span class="mm-switch-knob" />
  </button>
</template>
