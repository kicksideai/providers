<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'
import KbButton from './KbButton.vue'

// Centered confirm modal. The default slot is the explanatory body; the footer
// is a cancel + confirm pair. busy disables both and spins the confirm button.
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subtitle?: string
  icon?: string
  danger?: boolean
  busy?: boolean
  confirmLabel?: string
  cancelLabel?: string
}>(), { icon: 'tabler:alert-circle', confirmLabel: 'Confirm', cancelLabel: 'Cancel' })
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
      <div class="kx-modal" :class="{ danger }" role="dialog" aria-modal="true" :aria-label="title">
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
          <KbButton variant="ghost" :disabled="busy" @click="emit('cancel')">{{ cancelLabel }}</KbButton>
          <KbButton :variant="danger ? 'danger' : 'primary'" :loading="busy" :disabled="busy" @click="emit('confirm')">{{ confirmLabel }}</KbButton>
        </div>
      </div>
    </div>
  </Transition>
</template>
