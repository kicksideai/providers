<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, loadByTagName, on } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { useProps, useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import ConfigFields from './ConfigFields.vue'
import {
  KIND_LABEL, errorText, isRecord,
  type ConflictGroup, type MemoryItem, type MemoryKind, type MemoryRun, type MemoryStatus, type MemoryStatusView, type Provenance,
} from './memoryTypes'

// The memory knowledge base page: browse typed memories with their versions and
// provenance, edit identity and rules, forget and restore, resolve conflicts,
// follow capture and consolidation runs, and change the memory's settings. It
// reads committed state from /memory/{id} and refetches when the memory's
// component meta changes.
interface P { config?: { kb_id?: string; route?: string } | string | null }
const props = useProps<P>()

const kbId = computed(() => {
  const raw = props.value.config
  if (typeof raw === 'string') {
    try { return String((JSON.parse(raw) as { kb_id?: string }).kb_id || '') } catch { return '' }
  }
  return String(raw?.kb_id || '')
})
const base = computed(() => `/api/v1/memory/${encodeURIComponent(kbId.value)}`)

type Tab = 'memories' | 'conflicts' | 'activity' | 'settings'
const tab = ref<Tab>('memories')
const status = ref<MemoryStatusView | null>(null)
const items = ref<MemoryItem[]>([])
const conflicts = ref<ConflictGroup[]>([])
const selected = ref<MemoryItem | null>(null)
const provenance = ref<Provenance[]>([])
const versions = ref<MemoryItem[]>([])
const loading = ref(false)
const error = ref('')
const busy = ref('')

const KINDS = (Object.keys(KIND_LABEL) as MemoryKind[]).map((kind) => ({ value: kind, label: KIND_LABEL[kind] }))
const VIEWS: { value: MemoryStatus; label: string }[] = [
  { value: 'current', label: 'Current' }, { value: 'superseded', label: 'Earlier versions' }, { value: 'forgotten', label: 'Forgotten' },
]
const AGENT_KINDS = (['identity', 'rule', 'skill', 'lesson'] as MemoryKind[]).map((kind) => ({ value: kind, label: KIND_LABEL[kind] }))
const kindFilter = ref<MemoryKind | null>(null)
const statusFilter = ref<MemoryStatus>('current')
const adding = ref(false)

const draft = ref({ kind: 'rule' as MemoryKind, scope_id: '', key: '', content: '' })
const editing = ref('')
const settings = ref<Record<string, unknown>>({})
const settingsNotice = ref('')

async function loadStatus() {
  const { data } = await api.get(`${base.value}/status`)
  status.value = data as MemoryStatusView
  settings.value = { ...(status.value?.config || {}) }
}

async function loadItems() {
  const query = new URLSearchParams({ limit: '200' })
  if (kindFilter.value) query.set('kind', kindFilter.value)
  if (statusFilter.value) query.set('status', statusFilter.value)
  const { data } = await api.get(`${base.value}/items?${query.toString()}`)
  items.value = (isRecord(data) && Array.isArray(data.items) ? data.items : []) as MemoryItem[]
  if (selected.value && !items.value.some((item) => item.id === selected.value?.id)) selected.value = null
}

async function loadConflicts() {
  const { data } = await api.get(`${base.value}/conflicts`)
  conflicts.value = (isRecord(data) && Array.isArray(data.groups) ? data.groups : []) as ConflictGroup[]
}

let generation = 0
async function load() {
  if (!kbId.value) return
  const current = ++generation
  loading.value = true
  try {
    await Promise.all([loadStatus(), loadItems(), loadConflicts()])
    if (selected.value) await select(selected.value)
    if (current === generation) error.value = ''
  } catch (err) {
    if (current === generation) error.value = errorText(err)
  } finally {
    if (current === generation) loading.value = false
  }
}

let unsubscribe: (() => void) | null = null
watch(kbId, (id) => {
  if (unsubscribe) unsubscribe()
  unsubscribe = null
  if (!id) return
  const off = on(`component.${id}`, () => { void load() })
  unsubscribe = typeof off === 'function' ? off : null
}, { immediate: true })
onUnmounted(() => { if (unsubscribe) unsubscribe() })
useHostVisibilityRefresh(load)
watch([kindFilter, statusFilter], () => { void loadItems().catch((err) => { error.value = errorText(err) }) })

async function select(item: MemoryItem) {
  selected.value = item
  editing.value = ''
  const { data } = await api.get(`${base.value}/items/${encodeURIComponent(item.id)}`)
  if (isRecord(data)) {
    if (isRecord(data.item)) selected.value = data.item as unknown as MemoryItem
    provenance.value = (Array.isArray(data.provenance) ? data.provenance : []) as Provenance[]
    versions.value = (Array.isArray(data.versions) ? data.versions : []) as MemoryItem[]
  }
}

async function act(label: string, fn: () => Promise<unknown>) {
  busy.value = label
  error.value = ''
  try {
    await fn()
    await load()
  } catch (err) {
    error.value = errorText(err)
  } finally {
    busy.value = ''
  }
}

function forget(item: MemoryItem) {
  void act('forget', () => api.post(`${base.value}/items/${encodeURIComponent(item.id)}/forget`, { reason: 'forgotten in the memory page' }))
}
function restore(item: MemoryItem) {
  void act('restore', () => api.post(`${base.value}/items/${encodeURIComponent(item.id)}/restore`, {}))
}
function saveEdit(item: MemoryItem) {
  const content = editing.value.trim()
  if (!content) return
  void act('edit', async () => {
    const { data } = await api.put(`${base.value}/items/${encodeURIComponent(item.id)}`, { content, value: content })
    if (isRecord(data) && typeof data.item_id === 'string') selected.value = { ...item, id: data.item_id }
  })
}
function create() {
  const fields = draft.value
  if (!fields.content.trim() || !fields.scope_id.trim()) return
  void act('create', async () => {
    await api.post(`${base.value}/items`, {
      kind: fields.kind, scope_family: 'agent', scope_id: fields.scope_id.trim(),
      key: fields.key.trim() || fields.content.trim(), content: fields.content.trim(),
    })
    draft.value = { ...fields, key: '', content: '' }
    adding.value = false
  })
}
function resolve(group: ConflictGroup, winner: MemoryItem) {
  void act('resolve', () => api.post(`${base.value}/conflicts/${encodeURIComponent(group.group_id)}/resolve`, { winner_id: winner.id }))
}
function saveSettings() {
  void act('settings', async () => {
    await api.put(`/api/v1/knowledge/${encodeURIComponent(kbId.value)}`, { config: settings.value })
    settingsNotice.value = 'Saved.'
  })
}

const editable = computed(() => !!selected.value && (selected.value.kind === 'identity' || selected.value.kind === 'rule')
  && selected.value.status === 'current')
const runs = computed<MemoryRun[]>(() => status.value?.runs || [])
const failedRuns = computed(() => runs.value.filter((run) => run.status === 'failed').length)

const STATUS_SEVERITY: Record<string, string> = { current: 'success', conflict: 'warn', failed: 'danger' }
function severity(status: string): string {
  return STATUS_SEVERITY[status] || 'secondary'
}
function scopeLabel(item: MemoryItem): string {
  return item.scope_family === 'agent' ? 'agent' : item.scope_family === 'owner' ? 'person' : item.scope_family
}
function runTitle(run: MemoryRun): string {
  if (run.run_type === 'consolidate') return 'Consolidation'
  if (run.run_type === 'reembed') return 'Re-embedding'
  return run.host_kind === 'content' ? 'Learned from content' : 'Learned from a conversation'
}
function onAgent(event: Event) {
  const detail = event instanceof CustomEvent && isRecord(event.detail) ? event.detail : {}
  const selected = Array.isArray(detail.selected) ? detail.selected : []
  draft.value.scope_id = String(selected[0] || '')
}

const agentPicker = ref(!!customElements.get('wc-agent-picker'))
onMounted(async () => {
  if (agentPicker.value) return
  try {
    await loadByTagName('wc-agent-picker', { timeoutMs: 8000 })
    agentPicker.value = true
  } catch (err) {
    error.value = `The agent picker could not load: ${errorText(err)}`
  }
})
function when(value?: string | null): string {
  if (!value) return ''
  const t = Date.parse(value.includes('T') ? value : value.replace(' ', 'T') + 'Z')
  return Number.isFinite(t) ? new Date(t).toLocaleString() : value
}
</script>

<template>
  <div class="mm-page">
    <Tabs v-model:value="tab">
      <TabList>
        <Tab value="memories">Memories <Tag v-if="status" class="kx-tag-sm" severity="secondary" :value="String(status.counts.current)" /></Tab>
        <Tab value="conflicts">Conflicts <Tag v-if="conflicts.length" class="kx-tag-sm" severity="warn" :value="String(conflicts.length)" /></Tab>
        <Tab value="activity">Activity <Tag v-if="failedRuns" class="kx-tag-sm" severity="danger" :value="`${failedRuns} failed`" /></Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      <Message v-if="error" severity="error" class="mm-filters">{{ error }}</Message>
      <TabPanels>
        <TabPanel value="memories">
          <div class="mm-filters">
            <SelectButton v-model="statusFilter" :options="VIEWS" option-label="label" option-value="value" :allow-empty="false" size="small" />
            <Select v-model="kindFilter" :options="KINDS" option-label="label" option-value="value" size="small" placeholder="All kinds" show-clear aria-label="Kind" />
            <Button v-if="!adding" label="Add identity or rule" size="small" severity="secondary" outlined @click="adding = true; selected = null"><template #icon><Icon icon="tabler:plus" /></template></Button>
          </div>
          <div class="mm-split" :class="{ solo: !adding && !selected }">
            <div class="mm-panel">
              <div v-if="loading && !items.length" class="kx-loading"><Icon icon="tabler:loader-2" class="spin" />Loading memories</div>
              <div v-else-if="!items.length" class="kx-empty">
                <span class="kx-empty-ico"><Icon icon="tabler:brain" /></span>
                <p class="kx-empty-title">Nothing here yet</p>
                <p class="kx-empty-sub">Memories appear as agents talk with people, or add the agent's identity and rules yourself.</p>
              </div>
              <button v-for="item in items" v-else :key="item.id" class="mm-row" :class="{ on: selected?.id === item.id }" @click="select(item)">
                <span>
                  <span class="mm-row-t">{{ item.content }}</span>
                  <span class="mm-row-s">
                    <Tag class="kx-tag-sm" severity="secondary" :value="KIND_LABEL[item.kind]" />
                    <span>{{ scopeLabel(item) }} · {{ item.key }} · v{{ item.version }}</span>
                  </span>
                </span>
              </button>
            </div>

            <div v-if="adding" class="mm-panel">
              <div class="mm-panel-h">Add identity or rule</div>
              <div class="mm-panel-b">
                <span class="mm-hint">Identity and rules are part of the agent's instructions in every conversation.</span>
                <SelectButton v-model="draft.kind" :options="AGENT_KINDS" option-label="label" option-value="value" :allow-empty="false" size="small" />
                <div class="mm-field">
                  <span class="mm-label">Agent</span>
                  <wc-agent-picker v-if="agentPicker" multi="false" placeholder="Pick the agent"
                    :selected="draft.scope_id ? JSON.stringify([draft.scope_id]) : '[]'" @change="onAgent"></wc-agent-picker>
                </div>
                <div class="mm-field"><label class="mm-label" for="draft_key">Topic</label><InputText id="draft_key" v-model="draft.key" placeholder="e.g. tone" /></div>
                <div class="mm-field"><label class="mm-label" for="draft_content">Text</label>
                  <Textarea id="draft_content" v-model="draft.content" auto-resize placeholder="e.g. Answer in short bullet points." /></div>
                <div class="mm-actions">
                  <Button label="Add" size="small" :disabled="!!busy || !draft.content.trim() || !draft.scope_id.trim()" @click="create"><template #icon><Icon icon="tabler:plus" /></template></Button>
                  <Button label="Cancel" size="small" severity="secondary" text @click="adding = false" />
                </div>
              </div>
            </div>

            <div v-else-if="selected" class="mm-panel">
              <div class="mm-panel-h"><span>{{ KIND_LABEL[selected.kind] }} · {{ selected.key }}</span><Tag class="kx-tag-sm" :severity="severity(selected.status)" :value="selected.status" /></div>
              <div class="mm-panel-b">
                <template v-if="editing">
                  <Textarea v-model="editing" auto-resize aria-label="Memory text" />
                  <div class="mm-actions">
                    <Button label="Save new version" size="small" :disabled="!!busy" @click="saveEdit(selected)"><template #icon><Icon icon="tabler:check" /></template></Button>
                    <Button label="Cancel" size="small" severity="secondary" text @click="editing = ''" />
                  </div>
                </template>
                <div v-else class="mm-row-t">{{ selected.content }}</div>
                <dl class="mm-dl">
                  <dt>About</dt><dd>{{ selected.scope_family === 'agent' ? `agent ${selected.scope_id}` : 'the person who said it' }}</dd>
                  <dt>True since</dt><dd>{{ when(selected.valid_at) }}</dd>
                  <template v-if="selected.invalid_at"><dt>Until</dt><dd>{{ when(selected.invalid_at) }}</dd></template>
                  <dt>Learned</dt><dd>{{ when(selected.recorded_at) }} · {{ selected.source }}</dd>
                </dl>
                <div class="mm-actions">
                  <Button v-if="editable && !editing" label="Edit" size="small" severity="secondary" outlined @click="editing = selected.content"><template #icon><Icon icon="tabler:pencil" /></template></Button>
                  <Button v-if="selected.status !== 'forgotten'" label="Forget" size="small" severity="danger" outlined :disabled="!!busy" @click="forget(selected)"><template #icon><Icon icon="tabler:eye-off" /></template></Button>
                  <Button v-else label="Restore" size="small" severity="secondary" outlined :disabled="!!busy" @click="restore(selected)"><template #icon><Icon icon="tabler:restore" /></template></Button>
                </div>
                <p class="mm-h">Versions</p>
                <div v-for="version in versions" :key="version.id" class="mm-version" :class="{ past: version.status !== 'current' }">
                  <Tag class="kx-tag-sm" :severity="severity(version.status)" :value="`v${version.version}`" /><span>{{ version.content }}</span>
                </div>
                <p class="mm-h">Seen in</p>
                <span v-if="!provenance.length" class="mm-hint">Added by a person or by consolidation.</span>
                <span v-for="ref in provenance" :key="ref.host_kind + ref.host_id + ref.event_id" class="mm-hint">
                  {{ ref.host_kind }} {{ ref.host_id }} · message {{ ref.event_id }}
                </span>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="conflicts">
          <div class="mm-panel">
            <div v-if="!conflicts.length" class="kx-empty">
              <span class="kx-empty-ico"><Icon icon="tabler:circle-check" /></span>
              <p class="kx-empty-title">No conflicts</p>
              <p class="kx-empty-sub">When two memories contradict each other, they wait here for you to keep the right one.</p>
            </div>
            <div v-for="group in conflicts" :key="group.group_id" class="mm-conflict">
              <span class="mm-hint">These memories contradict each other. Keep the one that is right; the others become earlier versions.</span>
              <div v-for="item in group.items" :key="item.id" class="mm-option">
                <div><div class="mm-row-t">{{ item.content }}</div><div class="mm-row-s"><Tag class="kx-tag-sm" severity="secondary" :value="KIND_LABEL[item.kind]" /><span>{{ when(item.valid_at) }}</span></div></div>
                <Button label="Keep this" size="small" :disabled="!!busy" @click="resolve(group, item)"><template #icon><Icon icon="tabler:check" /></template></Button>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="activity">
          <div class="mm-panel">
            <div v-if="!runs.length" class="kx-empty">
              <span class="kx-empty-ico"><Icon icon="tabler:activity" /></span>
              <p class="kx-empty-title">Nothing captured yet</p>
              <p class="kx-empty-sub">Each time an agent captures a conversation or consolidates, the run shows here.</p>
            </div>
            <div v-for="run in runs" :key="run.id" class="mm-row">
              <span>
                <span class="mm-row-t">{{ runTitle(run) }}</span>
                <span class="mm-row-s">
                  <span>{{ when(run.finished_at || run.started_at || run.created_at) }}</span>
                  <span v-if="run.stats?.added">+{{ run.stats.added }} new</span>
                  <span v-if="run.stats?.superseded">{{ run.stats.superseded }} updated</span>
                  <span v-if="run.stats?.conflicted">{{ run.stats.conflicted }} contested</span>
                </span>
                <span v-if="run.last_error" class="mm-row-s mm-row-err">{{ run.last_error }}</span>
              </span>
              <Tag v-if="run.status !== 'succeeded'" class="kx-tag-sm" :severity="severity(run.status)" :value="run.status" />
            </div>
          </div>
        </TabPanel>

        <TabPanel value="settings">
          <div class="mm-panel">
            <div class="mm-panel-b">
              <ConfigFields v-if="status" :schema="status.config_schema" v-model="settings" />
              <div class="mm-actions">
                <Button label="Save settings" size="small" :disabled="!!busy" @click="saveSettings"><template #icon><Icon icon="tabler:device-floppy" /></template></Button>
                <span class="mm-hint">{{ settingsNotice }}</span>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
