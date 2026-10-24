<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Text button. variant selects the fill; loading swaps the leading icon for a
// spinner and is the caller's signal to also pass disabled.
withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'soft' | 'danger'
  icon?: string
  loading?: boolean
  disabled?: boolean
  small?: boolean
  type?: 'button' | 'submit'
}>(), { variant: 'primary', type: 'button' })
const emit = defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    class="kx-btn"
    :class="[`kx-btn-${variant}`, small && 'sm']"
    :type="type"
    :disabled="disabled"
    @click="emit('click')"
  >
    <Icon v-if="loading" icon="tabler:loader-2" class="spin" aria-hidden="true" />
    <Icon v-else-if="icon" :icon="icon" aria-hidden="true" />
    <span><slot /></span>
  </button>
</template>
