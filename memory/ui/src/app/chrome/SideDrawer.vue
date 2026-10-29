<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'
import AccessibleOverlay from './AccessibleOverlay.vue'

const props = defineProps<{ open: boolean; title: string; icon: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <AccessibleOverlay :open="open" kind="drawer" @close="emit('close')">
      <aside class="kx-drawer" role="dialog" aria-modal="true" :aria-label="title">
        <div class="kx-drawer-h">
          <span class="kx-drawer-title"><Icon :icon="icon" aria-hidden="true" />{{ title }}</span>
          <IconButton data-overlay-initial icon="tabler:x" label="Close" @click="emit('close')" />
        </div>
        <div class="kx-drawer-b"><slot /></div>
      </aside>
  </AccessibleOverlay>
</template>
