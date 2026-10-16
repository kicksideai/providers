<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from '@wippy-fe/proxy'

// Shared trait-config body for Jira/Confluence: pick the Atlassian connection
// (required) and optionally pin a project (Jira) / space (Confluence). `kind`
// selects the resource type, the context key, and labels. Emits the trait
// context object on every change; the thin root adapts props/events to the host.
interface Conn { component_id: string; name?: string; provider?: string }
interface Res { type?: string; id?: string; key?: string; name?: string }
interface Config { connection_id?: string; project_key?: string; space_key?: string }

const props = defineProps<{ kind: 'jira' | 'confluence'; config: Config | null }>()
const emit = defineEmits<{ (e: 'change', value: Config): void }>()

const resourceType = computed(() => (props.kind === 'jira' ? 'jira_project' : 'confluence_space'))
const resourceKey = computed(() => (props.kind === 'jira' ? 'project_key' : 'space_key'))
const resourceLabel = computed(() => (props.kind === 'jira' ? 'Project' : 'Space'))

const connections = ref<Conn[]>([])
const resources = ref<Res[]>([])
const connectionId = ref('')
const pinned = ref('')
const loadingConns = ref(false)
const loadingRes = ref(false)
const error = ref('')

function readConfig(cfg: Config | null) {
  connectionId.value = cfg?.connection_id || ''
  pinned.value = (cfg && (cfg as any)[resourceKey.value]) || ''
}
watch(() => props.config, c => readConfig(c), { immediate: true })

function publish() {
  const out: Config = { connection_id: connectionId.value || undefined }
  if (pinned.value) (out as any)[resourceKey.value] = pinned.value
  emit('change', out)
}

async function loadConnections() {
  loadingConns.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/v1/connections?provider=atlassian')
    connections.value = (data && data.connections) || []
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loadingConns.value = false
  }
}

async function loadResources() {
  resources.value = []
  if (!connectionId.value) return
  loadingRes.value = true
  try {
    const { data } = await api.post(`/api/v1/connections/${encodeURIComponent(connectionId.value)}/discover_resources`, {})
    const all: Res[] = (data && data.resources) || []
    resources.value = all.filter(r => r.type === resourceType.value)
  } catch (e) {
    // Discovery is best-effort (token may lack the product's scope); pinning is optional.
    resources.value = []
  } finally {
    loadingRes.value = false
  }
}

function onConnectionChange() {
  pinned.value = ''
  publish()
  loadResources()
}

loadConnections().then(() => { if (connectionId.value) loadResources() })
</script>

<template>
  <div class="atl-pick">
    <label class="atl-field">
      <span>Atlassian connection</span>
      <select v-model="connectionId" @change="onConnectionChange">
        <option value="">{{ loadingConns ? 'Loading…' : 'Select a connection' }}</option>
        <option v-for="c in connections" :key="c.component_id" :value="c.component_id">{{ c.name || c.component_id }}</option>
      </select>
    </label>

    <label v-if="connectionId" class="atl-field">
      <span>{{ resourceLabel }} <em>(optional — pin to scope this trait)</em></span>
      <select v-model="pinned" @change="publish">
        <option value="">{{ loadingRes ? 'Loading…' : 'Any (account-wide)' }}</option>
        <option v-for="r in resources" :key="r.id || r.key" :value="r.key">{{ r.name || r.key }} ({{ r.key }})</option>
      </select>
    </label>

    <p v-if="!connections.length && !loadingConns" class="atl-hint">
      No Atlassian connection yet — add one from the Connections page first.
    </p>
    <p v-if="error" class="atl-error">{{ error }}</p>
  </div>
</template>
