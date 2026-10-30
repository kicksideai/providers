<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  icon: string
  label: string
  active?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button type="button" class="kx-iconbtn" :class="{ on: active }" :aria-label="label" :title="label"
    :aria-pressed="active === undefined ? undefined : active" :disabled="disabled" @click="emit('click')">
    <Icon :icon="icon" aria-hidden="true" />
  </button>
</template>
