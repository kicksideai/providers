<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import ConfirmDialog from './chrome/ConfirmDialog.vue'
import { KIND_META, fullTime, relativeTime, topicLabel, STATUS_LABEL, severity } from './format'
import { errorText, type MemoryItem, type Provenance } from './types'
import { type Memory } from './useMemory'
import { httpStatus, memoryApi } from './api'

const props = defineProps<{ memory: Memory; itemId: string }>()
const emit = defineEmits<{
  (e: 'replaced', id: string): void
  (e: 'gone'): void
  (e: 'open', id: string): void
  (e: 'conversation', id: string): void
}>()

const item = ref<MemoryItem | null>(null)
const versions = ref<MemoryItem[]>([])
const nextVersions = ref<number | null>(null)
const provenance = ref<Provenance[]>([])
const loadError = ref('')
const editing = ref<string | null>(null)
const forgetting = ref(false)

const meta = computed(() => (item.value ? KIND_META[item.value.kind] : null))
const icon = computed(() => item.value ? KIND_META[item.value.kind].icon : 'tabler:brain')
const live = computed(() => item.value?.status === 'current' || item.value?.status === 'conflict')

let generation = 0
async function load(offset = 0, limit?: number) {
  const current = ++generation
  try {
    const data = await memoryApi(props.memory.memoryId.value).item(props.itemId, offset, limit)
    if (current !== generation) return
    if (!offset) {
      const loaded = data.item
      if (loaded.status === 'forgotten') {
        emit('gone')
        return
      }
      item.value = loaded
      provenance.value = data.provenance
    }
    const page = data.versions
    versions.value = offset ? [...versions.value, ...page.rows] : page.rows
    nextVersions.value = page.next
    loadError.value = ''
  } catch (err) {
    if (current !== generation) return
    if (httpStatus(err) === 404) emit('gone')
    else loadError.value = errorText(err)
  }
}

watch(() => props.itemId, () => {
  item.value = null
  versions.value = []
  editing.value = null
  forgetting.value = false
  void load()
}, { immediate: true })
async function reloadVersions(): Promise<void> {
  const current = ++generation
  const wanted = versions.value.length
  try {
    let offset = 0
    let next: number | null = null
    const rows: MemoryItem[] = []
    let first = true
    do {
      const size = Math.min(100, Math.max(1, wanted - rows.length))
      const page = await memoryApi(props.memory.memoryId.value).item(props.itemId, offset, size)
      if (current !== generation) return
      if (first) {
        if (page.item.status === 'forgotten') { emit('gone'); return }
        item.value = page.item; provenance.value = page.provenance; first = false
      }
      rows.push(...page.versions.rows)
      next = page.versions.next
      offset = next ?? 0
    } while (rows.length < wanted && next !== null)
    versions.value = rows; nextVersions.value = next; loadError.value = ''
  } catch (err) {
    if (current === generation) {
      if (httpStatus(err) === 404) emit('gone')
      else loadError.value = errorText(err)
    }
  }
}
watch(props.memory.revision, () => { void reloadVersions() })

function post(action: 'archive' | 'restore' | 'forget') {
  return props.memory.act(() => memoryApi(props.memory.memoryId.value).act(props.itemId, action))
}

async function save() {
  const content = (editing.value || '').trim()
  if (!content || !item.value) return
  const ok = await props.memory.act(async () => {
    const replacement = await memoryApi(props.memory.memoryId.value).edit(props.itemId, content)
    if (replacement && replacement !== props.itemId) emit('replaced', replacement)
  })
  if (ok) editing.value = null
}

async function forget() {
  if (await post('forget')) {
    forgetting.value = false
    emit('gone')
  }
}


function sourceIcon(origin: Provenance): string {
  if (origin.host_kind === 'item') return 'tabler:brain'
  if (origin.host_kind === 'content') return 'tabler:file-text'
  if (origin.host_kind === 'dataflow') return 'tabler:route'
  return 'tabler:message-circle'
}

function sourceLabel(origin: Provenance): string {
  if (origin.line) {
    if (origin.line.role === 'tool') return 'Tool result'
    const author = origin.line.author
    if (author?.kind === 'user') return 'They said'
    if (author?.kind === 'system') return 'Workflow input'
    if (author?.kind === 'agent') return item.value?.scope_family === 'agent' && item.value.scope_id === author.id ? 'The agent said' : `Task from ${author.id || 'an agent'}`
    return 'Message'
  }
  if (origin.host_kind === 'item') return origin.memory ? 'From the memory' : 'From a memory that is no longer kept'
  if (origin.host_kind === 'content') return 'A document'
  if (origin.host_kind === 'dataflow') return 'A workflow run'
  return 'A conversation whose text is no longer kept'
}
</script>

<template>
  <div v-if="loadError" class="kx-notice error"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ loadError }}</span></div>
  <div v-else-if="!item" class="mm-skel-reader"><div v-for="i in 4" :key="i" class="mm-skel-line" /></div>
  <article v-else class="mm-reader">
    <header class="mm-head">
      <span class="mm-head-ic" :class="meta?.tone"><Icon :icon="icon" aria-hidden="true" /></span>
      <div class="mm-head-body">
        <div class="mm-head-top">
          <span class="kx-chip">{{ meta?.label }}</span>
          <span class="mm-topic">{{ topicLabel(item.key) }}</span>
          <Tag v-if="item.status !== 'current'" class="kx-tag-sm" :severity="severity(item.status)" :value="STATUS_LABEL[item.status]" />
          <span class="mm-head-acts">
            <button v-if="live && editing === null" type="button" class="kx-btn kx-btn-ghost sm" @click="editing = item.content">
              <Icon icon="tabler:pencil" aria-hidden="true" />Edit
            </button>
            <button v-if="live" type="button" class="kx-btn kx-btn-ghost sm" :disabled="memory.busy.value" @click="post('archive')">
              <Icon icon="tabler:archive" aria-hidden="true" />Archive
            </button>
            <button v-if="item.status === 'archived'" type="button" class="kx-btn kx-btn-ghost sm" :disabled="memory.busy.value" @click="post('restore')">
              <Icon icon="tabler:restore" aria-hidden="true" />Restore
            </button>
            <button type="button" class="kx-btn kx-btn-ghost sm mm-danger" :disabled="memory.busy.value" @click="forgetting = true">
              <Icon icon="tabler:trash" aria-hidden="true" />Forget
            </button>
          </span>
        </div>
        <div v-if="editing !== null" class="mm-edit">
          <Textarea v-model="editing" auto-resize rows="2" aria-label="Memory text" />
          <div class="mm-edit-acts">
            <button type="button" class="kx-btn kx-btn-primary sm" :disabled="memory.busy.value || !editing.trim()" @click="save">
              <Icon icon="tabler:check" aria-hidden="true" />Save text
            </button>
            <button type="button" class="kx-btn kx-btn-ghost sm" @click="editing = null">Cancel</button>
          </div>
        </div>
        <h2 v-else class="mm-title">{{ item.content }}</h2>
        <div class="mm-facts">
          <span v-if="item.scope_family === 'agent'" class="mm-fact"><Icon icon="tabler:robot" aria-hidden="true" />About the agent itself</span>
          <span class="mm-fact" :title="fullTime(item.valid_at)"><Icon icon="tabler:calendar-event" aria-hidden="true" />True since {{ relativeTime(item.valid_at) }}</span>
          <span v-if="item.invalid_at" class="mm-fact" :title="fullTime(item.invalid_at)"><Icon icon="tabler:calendar-off" aria-hidden="true" />Until {{ relativeTime(item.invalid_at) }}</span>
        </div>
      </div>
    </header>

    <section v-if="versions.length > 1 || nextVersions !== null" class="mm-sec" aria-labelledby="mm-history">
      <h3 id="mm-history" class="mm-sec-h">History</h3>
      <ol class="mm-timeline">
        <li v-for="version in versions" :key="version.id" :class="{ now: version.id === item.id, past: version.status !== 'current' }">
          <span class="mm-dot" aria-hidden="true" />
          <span class="mm-tl-body">
            <span class="mm-tl-t">{{ version.content }}</span>
            <span class="mm-tl-s">v{{ version.version }} · {{ relativeTime(version.valid_at) }}<template v-if="version.status !== 'current'"> · {{ STATUS_LABEL[version.status] }}</template></span>
          </span>
        </li>
      </ol>
      <button v-if="nextVersions !== null" type="button" class="kx-btn kx-btn-ghost sm" @click="load(nextVersions)">Show older versions</button>
    </section>

    <section class="mm-sec" aria-labelledby="mm-sources">
      <h3 id="mm-sources" class="mm-sec-h">Learned from</h3>
      <p v-if="!provenance.length" class="mm-muted">{{ item.source === 'owner' ? 'Added by a person on this page.' : 'No conversation recorded for this memory.' }}</p>
      <ul v-else class="mm-sources">
        <li v-for="origin in provenance" :key="origin.host_kind + origin.host_id + origin.event_id" class="mm-source">
          <Icon class="mm-source-ic" :icon="sourceIcon(origin)" aria-hidden="true" />
          <div class="mm-source-body">
            <div class="mm-source-head">
              <span>{{ sourceLabel(origin) }}</span>
              <span v-if="origin.line?.created_at || origin.recorded_at" class="mm-muted"
                :title="fullTime(origin.line?.created_at || origin.recorded_at || '')">{{ relativeTime(origin.line?.created_at || origin.recorded_at || '') }}</span>
            </div>
            <blockquote v-if="origin.line" class="mm-quote">{{ origin.line.text }}</blockquote>
            <button v-if="origin.memory" type="button" class="mm-source-link" @click="emit('open', origin.memory.id)">
              <span class="mm-source-topic">{{ topicLabel(origin.memory.key) }}</span>
              <span>{{ origin.memory.content }}</span>
            </button>
            <button v-if="origin.host_kind === 'session'" type="button" class="kx-btn kx-btn-ghost sm"
              @click="emit('conversation', origin.host_id)">
              <Icon icon="tabler:external-link" aria-hidden="true" />Open conversation
            </button>
          </div>
        </li>
      </ul>
    </section>
  </article>

  <ConfirmDialog :open="forgetting" danger icon="tabler:trash" title="Forget this memory" :subtitle="item ? topicLabel(item.key) : ''"
    confirm-label="Forget for good" :busy="memory.busy.value" @cancel="forgetting = false" @confirm="forget">
    This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone.
  </ConfirmDialog>
</template>
