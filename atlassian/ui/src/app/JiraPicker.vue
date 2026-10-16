<script setup lang="ts">
import { computed } from 'vue'
import { useProps, useEvents } from '@wippy-fe/webcomponent-vue'
import PickerBody from './PickerBody.vue'

// Root for kickside-atlassian-jira-picker. Adapts the host's config attribute and
// config-changed event to the shared PickerBody (kind=jira).
interface P { config?: { connection_id?: string; project_key?: string } | null }
interface E { 'config-changed': { connection_id?: string; project_key?: string } }
const props = useProps<P>()
const emit = useEvents<E>()
const config = computed(() => props.value.config || null)
function onChange(cfg: any) { emit('config-changed', cfg) }
</script>

<template>
  <PickerBody kind="jira" :config="config" @change="onChange" />
</template>
