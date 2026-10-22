<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Square glyph button used across rails, toolbars, and sheet headers. variant
// picks the resting treatment, size the footprint (28 / 30 / 34).
withDefaults(defineProps<{
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
  variant?: 'plain' | 'bordered' | 'danger'
  size?: 'md' | 'sm' | 'lg'
  spin?: boolean
}>(), { variant: 'plain', size: 'md' })
const emit = defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    class="kx-iconbtn"
    :class="[
      variant === 'bordered' && 'bordered',
      variant === 'danger' && 'danger',
      size === 'sm' && 'sm',
      size === 'lg' && 'lg',
      active && 'on',
    ]"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    @click="emit('click')"
  >
    <Icon :icon="icon" :class="spin && 'spin'" aria-hidden="true" />
  </button>
</template>
