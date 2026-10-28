<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'

withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  icon?: string
  danger?: boolean
  busy?: boolean
  confirmLabel?: string
}>(), { icon: 'tabler:alert-circle', confirmLabel: 'Confirm' })
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

</script>

<template>
  <Dialog :visible="open" modal append-to="self" role="alertdialog" :aria-label="title" :closable="false"
    :close-on-escape="!busy" :dismissable-mask="!busy" class="kx-modal" :class="{ danger }"
    :pt="{ mask: 'kx-modal-mask', header: 'kx-modal-h', content: 'kx-modal-body', footer: 'kx-modal-foot' }"
    @update:visible="!$event && emit('cancel')">
    <template #header>
      <span class="kx-modal-h-ico"><Icon :icon="icon" aria-hidden="true" /></span>
      <span class="kx-modal-h-text">
        <span class="kx-modal-h-title">{{ title }}</span>
        <span v-if="subtitle" class="kx-modal-h-sub">{{ subtitle }}</span>
      </span>
      <IconButton icon="tabler:x" label="Close" :disabled="busy" @click="emit('cancel')" />
    </template>
    <slot />
    <template #footer>
      <button type="button" autofocus class="kx-btn kx-btn-ghost" :disabled="busy" @click="emit('cancel')">Cancel</button>
      <button type="button" class="kx-btn" :class="danger ? 'kx-btn-danger' : 'kx-btn-primary'" :disabled="busy" @click="emit('confirm')">
        <Icon v-if="busy" icon="tabler:loader-2" class="spin" aria-hidden="true" />{{ confirmLabel }}
      </button>
    </template>
  </Dialog>
</template>
