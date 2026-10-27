<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'

defineProps<{ open: boolean; title: string; icon: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

</script>

<template>
  <Dialog :visible="open" position="right" append-to="self" modal :aria-label="title" :closable="false" dismissable-mask
    class="kx-drawer" :pt="{ mask: 'kx-drawer-mask', header: 'kx-drawer-h', content: 'kx-drawer-b' }"
    @update:visible="!$event && emit('close')">
    <template #header>
      <span class="kx-drawer-title"><Icon :icon="icon" aria-hidden="true" />{{ title }}</span>
      <IconButton autofocus icon="tabler:x" label="Close" @click="emit('close')" />
    </template>
    <slot />
  </Dialog>
</template>
