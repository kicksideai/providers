<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Search input with a leading icon and a clear button (ui-kit kx-search).
defineProps<{ modelValue: string; placeholder: string; label: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<template>
  <div class="kx-search">
    <Icon class="kx-search-ico" icon="tabler:search" aria-hidden="true" />
    <input class="kx-search-input" type="text" :value="modelValue" :placeholder="placeholder" :aria-label="label"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <button v-if="modelValue" type="button" class="kx-search-clear" aria-label="Clear search" @click="emit('update:modelValue', '')">
      <Icon icon="tabler:x" aria-hidden="true" />
    </button>
  </div>
</template>
