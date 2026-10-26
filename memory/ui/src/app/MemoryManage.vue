<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import Message from 'primevue/message'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import Tag from 'primevue/tag'
import { useProps } from '@wippy-fe/webcomponent-vue'
import ConflictList from './ConflictList.vue'
import MemoryList from './MemoryList.vue'
import MemorySettings from './MemorySettings.vue'
import RunList from './RunList.vue'
import { parseConfig } from './types'
import { useMemory } from './useMemory'

// The memory knowledge base page: memories with their versions and provenance,
// conflicts to resolve, capture and consolidation runs, and the memory's
// settings.
const props = useProps<{ config?: unknown }>()
const memory = useMemory(computed(() => String(parseConfig(props.value.config).kb_id || '')))
const tab = ref('memories')
const failedRuns = computed(() => (memory.status.value?.runs || []).filter((run) => run.status === 'failed').length)
</script>

<template>
  <div class="mm-page">
    <Tabs v-model:value="tab">
      <TabList>
        <Tab value="memories">Memories <Tag v-if="memory.status.value" class="kx-tag-sm" severity="secondary" :value="String(memory.status.value.counts.current)" /></Tab>
        <Tab value="conflicts">Conflicts <Tag v-if="memory.conflicts.value.length" class="kx-tag-sm" severity="warn" :value="String(memory.conflicts.value.length)" /></Tab>
        <Tab value="activity">Activity <Tag v-if="failedRuns" class="kx-tag-sm" severity="danger" :value="`${failedRuns} failed`" /></Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      <Message v-if="memory.error.value" severity="error" class="mm-error">{{ memory.error.value }}</Message>
      <TabPanels>
        <TabPanel value="memories"><MemoryList :memory="memory" /></TabPanel>
        <TabPanel value="conflicts"><ConflictList :memory="memory" /></TabPanel>
        <TabPanel value="activity"><RunList :runs="memory.status.value?.runs || []" /></TabPanel>
        <TabPanel value="settings"><MemorySettings :memory="memory" /></TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
