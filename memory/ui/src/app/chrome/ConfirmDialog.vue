<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  icon?: string
  danger?: boolean
  busy?: boolean
  confirmLabel?: string
}>(), { icon: 'tabler:alert-circle', confirmLabel: 'Confirm' })
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.busy) emit('cancel')
}
watch(() => props.open, (open) => {
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="kx-modal">
    <div v-if="open" class="kx-modal-mask" @click.self="!busy && emit('cancel')">
      <div class="kx-modal" :class="{ danger }" role="alertdialog" aria-modal="true" :aria-label="title">
        <div class="kx-modal-h">
          <span class="kx-modal-h-ico"><Icon :icon="icon" aria-hidden="true" /></span>
          <span class="kx-modal-h-text">
            <span class="kx-modal-h-title">{{ title }}</span>
            <span v-if="subtitle" class="kx-modal-h-sub">{{ subtitle }}</span>
          </span>
          <IconButton icon="tabler:x" label="Close" :disabled="busy" @click="emit('cancel')" />
        </div>
        <div class="kx-modal-body"><slot /></div>
        <div class="kx-modal-foot">
          <button type="button" class="kx-btn kx-btn-ghost" :disabled="busy" @click="emit('cancel')">Cancel</button>
          <button type="button" class="kx-btn" :class="danger ? 'kx-btn-danger' : 'kx-btn-primary'" :disabled="busy" @click="emit('confirm')">
            <Icon v-if="busy" icon="tabler:loader-2" class="spin" aria-hidden="true" />{{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
