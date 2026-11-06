<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'
import AccessibleOverlay from './AccessibleOverlay.vue'

const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
const props = withDefaults(defineProps<{
  open: boolean; title: string; subtitle?: string; icon?: string; danger?: boolean; busy?: boolean; confirmLabel?: string
}>(), { icon: 'tabler:alert-circle', confirmLabel: 'Confirm' })
</script>

<template>
  <AccessibleOverlay :open="open" kind="dialog" :dismissible="!busy" @close="emit('cancel')">
      <div class="kx-modal" :class="{ danger }" role="alertdialog" aria-modal="true" :aria-label="title">
        <div class="kx-modal-h">
      <span class="kx-modal-h-ico"><Icon :icon="icon" aria-hidden="true" /></span>
      <span class="kx-modal-h-text">
        <span class="kx-modal-h-title">{{ title }}</span>
        <span v-if="subtitle" class="kx-modal-h-sub">{{ subtitle }}</span>
      </span>
      <IconButton data-overlay-initial icon="tabler:x" label="Close" :disabled="busy" @click="emit('cancel')" />
        </div>
        <div class="kx-modal-body"><slot /></div>
        <div class="kx-modal-foot">
      <button type="button" class="kx-btn kx-btn-ghost" :disabled="busy" @click="emit('cancel')">Cancel</button>
      <button type="button" class="kx-btn" :class="danger ? 'kx-btn-danger' : 'kx-btn-primary'" :disabled="busy" @click="emit('confirm')">
        <Icon v-if="busy" icon="tabler:loader-2" class="spin" aria-hidden="true" />{{ confirmLabel }}
      </button>
        </div>
      </div>
  </AccessibleOverlay>
</template>
