<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, on } from '@wippy-fe/proxy'
import { useProps, useHostVisibilityRefresh } from '@wippy-fe/webcomponent-vue'
import ConfigFields from './ConfigFields.vue'
import {
  KIND_ICON, KIND_LABEL, errorText, isRecord,
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

const KINDS: MemoryKind[] = ['identity', 'rule', 'profile_slot', 'preference', 'fact', 'skill', 'lesson']
const VIEWS: { status: MemoryStatus; label: string }[] = [
  { status: 'current', label: 'Current' }, { status: 'superseded', label: 'Earlier versions' }, { status: 'forgotten', label: 'Forgotten' },
]
const kindFilter = ref<MemoryKind | ''>('')
const statusFilter = ref<MemoryStatus>('current')
const scopeFilter = ref<'' | 'agent' | 'owner'>('')
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
  if (scopeFilter.value) query.set('scope_family', scopeFilter.value)
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
watch([kindFilter, statusFilter, scopeFilter], () => { void loadItems().catch((err) => { error.value = errorText(err) }) })

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
const counts = computed(() => status.value?.counts)
const runs = computed<MemoryRun[]>(() => status.value?.runs || [])
const failedRuns = computed(() => runs.value.filter((run) => run.status === 'failed').length)

function scopeLabel(item: MemoryItem): string {
  return item.scope_family === 'agent' ? `agent ${item.scope_id}` : item.scope_family === 'owner' ? 'user' : item.scope_family
}
function when(value?: string | null): string {
  if (!value) return ''
  const t = Date.parse(value.includes('T') ? value : value.replace(' ', 'T') + 'Z')
  return Number.isFinite(t) ? new Date(t).toLocaleString() : value
}
</script>

<template>
  <div class="mm-page">
    <div class="mm-stats">
      <div class="mm-stat"><span class="mm-stat-ico"><Icon icon="tabler:brain" /></span>
        <div><div class="mm-stat-n">{{ counts?.current ?? 0 }}</div><div class="mm-stat-l">current memories</div></div></div>
      <div class="mm-stat"><span class="mm-stat-ico"><Icon icon="tabler:history" /></span>
        <div><div class="mm-stat-n">{{ counts?.superseded ?? 0 }}</div><div class="mm-stat-l">earlier versions</div></div></div>
      <div class="mm-stat"><span class="mm-stat-ico warn"><Icon icon="tabler:alert-triangle" /></span>
        <div><div class="mm-stat-n">{{ counts?.conflict_groups ?? 0 }}</div><div class="mm-stat-l">conflicts to resolve</div></div></div>
    </div>

    <div class="mm-tabs" role="tablist">
      <button class="mm-tab" :class="{ on: tab === 'memories' }" role="tab" @click="tab = 'memories'"><Icon icon="tabler:brain" />Memories</button>
      <button class="mm-tab" :class="{ on: tab === 'conflicts' }" role="tab" @click="tab = 'conflicts'"><Icon icon="tabler:git-compare" />Conflicts<span v-if="conflicts.length" class="mm-chip conflict">{{ conflicts.length }}</span></button>
      <button class="mm-tab" :class="{ on: tab === 'activity' }" role="tab" @click="tab = 'activity'"><Icon icon="tabler:activity" />Activity<span v-if="failedRuns" class="mm-chip failed">{{ failedRuns }} failed</span></button>
      <button class="mm-tab" :class="{ on: tab === 'settings' }" role="tab" @click="tab = 'settings'"><Icon icon="tabler:settings" />Settings</button>
    </div>

    <div v-if="error" class="mm-notice error"><Icon icon="tabler:alert-circle" /><span>{{ error }}</span></div>

    <template v-if="tab === 'memories'">
      <div class="mm-filters">
        <button v-for="v in VIEWS" :key="v.status" class="mm-chip-btn" :class="{ on: statusFilter === v.status }" @click="statusFilter = v.status">{{ v.label }}</button>
        <span class="mm-sep" />
        <select class="mm-select mm-select-sm" v-model="scopeFilter" name="scope_filter" aria-label="Whose memories">
          <option value="">Everyone</option><option value="owner">About people</option><option value="agent">Agent identity &amp; rules</option>
        </select>
        <select class="mm-select mm-select-sm" v-model="kindFilter" name="kind_filter" aria-label="Kind">
          <option value="">All kinds</option><option v-for="kind in KINDS" :key="kind" :value="kind">{{ KIND_LABEL[kind] }}</option>
        </select>
      </div>
      <div class="mm-split">
        <div class="mm-card">
          <div v-if="loading && !items.length" class="mm-empty"><Icon icon="tabler:loader-2" class="spin" /></div>
          <div v-else-if="!items.length" class="mm-empty"><Icon icon="tabler:brain" /><span>No memories match these filters.</span></div>
          <div v-else class="mm-list">
            <button v-for="item in items" :key="item.id" class="mm-row" :class="{ on: selected?.id === item.id }" @click="select(item)">
              <span class="mm-row-ico"><Icon :icon="KIND_ICON[item.kind]" /></span>
              <span>
                <span class="mm-row-t">{{ item.content }}</span>
                <span class="mm-row-s">
                  <span class="mm-chip">{{ KIND_LABEL[item.kind] }}</span>
                  <span class="mm-chip">{{ scopeLabel(item) }}</span>
                  <span>{{ item.key }} · v{{ item.version }}</span>
                </span>
              </span>
              <span class="mm-chip" :class="item.status">{{ item.status }}</span>
            </button>
          </div>
        </div>

        <div class="mm-card" v-if="selected">
          <div class="mm-card-h"><span>{{ KIND_LABEL[selected.kind] }} · {{ selected.key }}</span><span class="mm-chip" :class="selected.status">{{ selected.status }}</span></div>
          <div class="mm-card-b">
            <div v-if="editing">
              <textarea class="mm-textarea" v-model="editing" name="edit_content"></textarea>
              <div class="mm-actions" style="margin-top: 8px;">
                <button class="mm-btn primary" :disabled="!!busy" @click="saveEdit(selected)"><Icon icon="tabler:check" />Save new version</button>
                <button class="mm-btn ghost" @click="editing = ''">Cancel</button>
              </div>
            </div>
            <div v-else class="mm-row-t">{{ selected.content }}</div>
            <dl class="mm-dl">
              <dt>Scope</dt><dd>{{ scopeLabel(selected) }}</dd>
              <dt>True since</dt><dd>{{ when(selected.valid_at) }}</dd>
              <dt v-if="selected.invalid_at">Until</dt><dd v-if="selected.invalid_at">{{ when(selected.invalid_at) }}</dd>
              <dt>Learned</dt><dd>{{ when(selected.recorded_at) }} · {{ selected.source }}</dd>
            </dl>
            <div class="mm-actions">
              <button v-if="editable && !editing" class="mm-btn ghost" @click="editing = selected.content"><Icon icon="tabler:pencil" />Edit</button>
              <button v-if="selected.status !== 'forgotten'" class="mm-btn danger" :disabled="!!busy" @click="forget(selected)"><Icon icon="tabler:eye-off" />Forget</button>
              <button v-else class="mm-btn ghost" :disabled="!!busy" @click="restore(selected)"><Icon icon="tabler:restore" />Restore</button>
            </div>
            <p class="mm-h">Versions</p>
            <div v-for="version in versions" :key="version.id" class="mm-version" :class="{ past: version.status !== 'current' }">
              <span class="mm-chip" :class="version.status">v{{ version.version }}</span><span>{{ version.content }}</span>
            </div>
            <p class="mm-h">Seen in</p>
            <div v-if="!provenance.length" class="mm-hint">Added by a person or by consolidation.</div>
            <div v-for="ref in provenance" :key="ref.host_kind + ref.host_id + ref.event_id" class="mm-hint">
              {{ ref.host_kind }} {{ ref.host_id }} · message {{ ref.event_id }}
            </div>
          </div>
        </div>
        <div class="mm-card" v-else-if="!adding">
          <div class="mm-card-b">
            <span class="mm-hint">Select a memory to see its versions and where it was learned.</span>
            <div class="mm-actions"><button class="mm-btn ghost" @click="adding = true"><Icon icon="tabler:plus" />Add identity or rule</button></div>
          </div>
        </div>
        <div class="mm-card" v-else>
          <div class="mm-card-h">Add identity or rule</div>
          <div class="mm-card-b">
            <span class="mm-hint">Agent identity and rules are part of the agent's instructions in every conversation.</span>
            <div class="mm-grid2">
              <label class="mm-field"><span class="mm-label">Kind</span>
                <select class="mm-select" v-model="draft.kind" name="draft_kind">
                  <option value="identity">Identity</option><option value="rule">Rule</option>
                  <option value="skill">Skill</option><option value="lesson">Lesson</option>
                </select></label>
              <label class="mm-field"><span class="mm-label">Agent id</span>
                <input class="mm-input" v-model="draft.scope_id" name="draft_scope" placeholder="the agent this applies to" /></label>
            </div>
            <label class="mm-field"><span class="mm-label">Topic</span><input class="mm-input" v-model="draft.key" name="draft_key" placeholder="e.g. tone" /></label>
            <label class="mm-field"><span class="mm-label">Text</span><textarea class="mm-textarea" v-model="draft.content" name="draft_content" placeholder="e.g. Answer in short bullet points."></textarea></label>
            <div class="mm-actions">
              <button class="mm-btn primary" :disabled="!!busy || !draft.content.trim() || !draft.scope_id.trim()" @click="create"><Icon icon="tabler:plus" />Add</button>
              <button class="mm-btn ghost" @click="adding = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="tab === 'conflicts'" class="mm-card">
      <div v-if="!conflicts.length" class="mm-empty"><Icon icon="tabler:circle-check" /><span>No conflicting memories.</span></div>
      <div v-for="group in conflicts" :key="group.group_id" class="mm-conflict">
        <span class="mm-hint">These memories contradict each other. Keep the one that is right; the others become earlier versions.</span>
        <div v-for="item in group.items" :key="item.id" class="mm-option">
          <div><div class="mm-row-t">{{ item.content }}</div><div class="mm-row-s"><span class="mm-chip">{{ KIND_LABEL[item.kind] }}</span><span>{{ when(item.valid_at) }}</span></div></div>
          <button class="mm-btn primary" :disabled="!!busy" @click="resolve(group, item)"><Icon icon="tabler:check" />Keep this</button>
        </div>
      </div>
    </div>

    <div v-else-if="tab === 'activity'" class="mm-card">
      <div v-if="!runs.length" class="mm-empty"><Icon icon="tabler:activity" /><span>Nothing captured yet.</span></div>
      <div v-else class="mm-list">
        <div v-for="run in runs" :key="run.id" class="mm-row" style="cursor: default;">
          <span class="mm-row-ico"><Icon :icon="run.run_type === 'consolidate' ? 'tabler:sparkles' : run.run_type === 'reembed' ? 'tabler:vector' : 'tabler:message-plus'" /></span>
          <span>
            <span class="mm-row-t">{{ run.run_type === 'derive' ? (run.host_kind === 'content' ? 'Learned from content' : 'Learned from a conversation') : run.run_type === 'consolidate' ? 'Consolidation' : 'Re-embedding' }}</span>
            <span class="mm-row-s">
              <span>{{ when(run.finished_at || run.started_at || run.created_at) }}</span>
              <span v-if="run.stats?.added">+{{ run.stats.added }} new</span>
              <span v-if="run.stats?.superseded">{{ run.stats.superseded }} updated</span>
              <span v-if="run.stats?.conflicted">{{ run.stats.conflicted }} conflicts</span>
            </span>
            <span v-if="run.last_error" class="mm-row-s" style="color: var(--mm-danger);">{{ run.last_error }}</span>
          </span>
          <span class="mm-chip" :class="run.status === 'failed' ? 'failed' : run.status === 'succeeded' ? 'current' : ''">{{ run.status }}</span>
        </div>
      </div>
    </div>

    <div v-else class="mm-card">
      <div class="mm-card-h">Memory settings</div>
      <div class="mm-card-b">
        <ConfigFields v-if="status" :schema="status.config_schema" v-model="settings" />
        <div class="mm-actions">
          <button class="mm-btn primary" :disabled="!!busy" @click="saveSettings"><Icon icon="tabler:device-floppy" />Save settings</button>
          <span class="mm-hint">{{ settingsNotice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
