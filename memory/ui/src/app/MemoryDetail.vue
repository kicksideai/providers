<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import ConfirmDialog from './chrome/ConfirmDialog.vue'
import { KIND_META, aboutLabel, fullTime, relativeTime, sourceLabel, topicLabel } from './format'
import { errorText, isRecord, type MemoryItem, type Provenance } from './types'
import { severity, type Memory } from './useMemory'

// One memory in the reader: what it says, whom it is about, when it held and
// how it was learned, its version history and the conversations it came from.
// The detail, its history and every action are bound to the same item id, and a
// response for an earlier selection is dropped.
const props = defineProps<{ memory: Memory; itemId: string }>()
const emit = defineEmits<{ (e: 'replaced', id: string): void; (e: 'gone'): void }>()

const item = ref<MemoryItem | null>(null)
const versions = ref<MemoryItem[]>([])
const nextVersions = ref<number | null>(null)
const provenance = ref<Provenance[]>([])
const loadError = ref('')
const editing = ref<string | null>(null)
const forgetting = ref(false)

const url = computed(() => `${props.memory.base.value}/items/${encodeURIComponent(props.itemId)}`)
const meta = computed(() => (item.value ? KIND_META[item.value.kind] : null))
const live = computed(() => item.value?.status === 'current' || item.value?.status === 'conflict')

let generation = 0
async function load(offset = 0) {
  const current = ++generation
  const target = url.value
  try {
    const { data } = await api.get(offset ? `${target}?offset=${offset}` : target)
    if (current !== generation || !isRecord(data)) return
    if (!offset) {
      const loaded = isRecord(data.item) ? (data.item as unknown as MemoryItem) : null
      // A forgotten memory keeps only an erased record; there is nothing to show.
      if (!loaded || loaded.status === 'forgotten') {
        emit('gone')
        return
      }
      item.value = loaded
      provenance.value = (Array.isArray(data.provenance) ? data.provenance : []) as Provenance[]
    }
    const page = (Array.isArray(data.versions) ? data.versions : []) as MemoryItem[]
    versions.value = offset ? [...versions.value, ...page] : page
    nextVersions.value = typeof data.next_offset === 'number' ? data.next_offset : null
    loadError.value = ''
  } catch (err) {
    if (current !== generation) return
    if (isRecord(err) && isRecord(err.response) && err.response.status === 404) emit('gone')
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
watch(props.memory.revision, () => { void load() })

function post(action: string) {
  const target = `${url.value}/${action}`
  return props.memory.act(() => api.post(target, {}))
}

async function save() {
  const content = (editing.value || '').trim()
  if (!content || !item.value) return
  const target = url.value
  const ok = await props.memory.act(async () => {
    const { data } = await api.put(target, { content })
    if (isRecord(data) && typeof data.item_id === 'string' && data.item_id !== props.itemId) emit('replaced', data.item_id)
  })
  if (ok) editing.value = null
}

async function forget() {
  if (await post('forget')) {
    forgetting.value = false
    emit('gone')
  }
}

function sourceOf(ref: Provenance): string {
  if (ref.host_kind === 'session') return 'Conversation'
  if (ref.host_kind === 'dataflow') return 'Workflow run'
  if (ref.host_kind === 'content') return 'Document'
  return ref.host_kind
}
</script>

<template>
  <div v-if="loadError" class="kx-notice error"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ loadError }}</span></div>
  <div v-else-if="!item" class="mm-skel-reader"><div v-for="i in 4" :key="i" class="mm-skel-line" /></div>
  <article v-else class="mm-reader">
    <header class="mm-head">
      <span class="mm-head-ic" :class="meta?.group"><Icon :icon="meta?.icon || 'tabler:note'" aria-hidden="true" /></span>
      <div class="mm-head-body">
        <div class="mm-head-top">
          <span class="kx-chip">{{ meta?.label }}</span>
          <span class="mm-topic">{{ topicLabel(item.key) }}</span>
          <Tag v-if="item.status !== 'current'" class="kx-tag-sm" :severity="severity(item.status)" :value="item.status" />
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
              <Icon icon="tabler:check" aria-hidden="true" />Save as new version
            </button>
            <button type="button" class="kx-btn kx-btn-ghost sm" @click="editing = null">Cancel</button>
          </div>
        </div>
        <h2 v-else class="mm-title">{{ item.content }}</h2>
        <div class="mm-facts">
          <span class="mm-fact"><Icon icon="tabler:user-circle" aria-hidden="true" />{{ aboutLabel(item) }}</span>
          <span class="mm-fact" :title="fullTime(item.valid_at)"><Icon icon="tabler:calendar-event" aria-hidden="true" />True since {{ relativeTime(item.valid_at) }}</span>
          <span v-if="item.invalid_at" class="mm-fact" :title="fullTime(item.invalid_at)"><Icon icon="tabler:calendar-off" aria-hidden="true" />Until {{ relativeTime(item.invalid_at) }}</span>
          <span class="mm-fact" :title="fullTime(item.recorded_at)"><Icon icon="tabler:sparkles" aria-hidden="true" />{{ sourceLabel(item.source) }}</span>
          <span class="mm-fact"><Icon icon="tabler:stack-2" aria-hidden="true" />{{ item.cardinality === 'single' ? 'One value at a time' : 'Can hold several values' }}</span>
        </div>
      </div>
    </header>

    <section class="mm-sec" aria-labelledby="mm-history">
      <h3 id="mm-history" class="mm-sec-h">History</h3>
      <ol class="mm-timeline">
        <li v-for="version in versions" :key="version.id" :class="{ now: version.id === item.id, past: version.status !== 'current' }">
          <span class="mm-dot" aria-hidden="true" />
          <span class="mm-tl-body">
            <span class="mm-tl-t">{{ version.content }}</span>
            <span class="mm-tl-s">v{{ version.version }} · {{ relativeTime(version.valid_at) }}<template v-if="version.status !== 'current'"> · {{ version.status }}</template></span>
          </span>
        </li>
      </ol>
      <button v-if="nextVersions !== null" type="button" class="kx-btn kx-btn-ghost sm" @click="load(nextVersions)">Show older versions</button>
    </section>

    <section class="mm-sec" aria-labelledby="mm-sources">
      <h3 id="mm-sources" class="mm-sec-h">Learned from</h3>
      <p v-if="!provenance.length" class="mm-muted">{{ item.source === 'owner' ? 'Added by a person on this page.' : 'No conversation recorded for this memory.' }}</p>
      <ul v-else class="mm-sources">
        <li v-for="ref in provenance" :key="ref.host_kind + ref.host_id + ref.event_id">
          <Icon icon="tabler:message-circle" aria-hidden="true" />
          <span>{{ sourceOf(ref) }}</span>
          <span v-if="ref.recorded_at" class="mm-muted" :title="fullTime(ref.recorded_at)">{{ relativeTime(ref.recorded_at) }}</span>
        </li>
      </ul>
    </section>
  </article>

  <ConfirmDialog :open="forgetting" danger icon="tabler:trash" title="Forget this memory" :subtitle="item ? topicLabel(item.key) : ''"
    confirm-label="Forget for good" :busy="memory.busy.value" @cancel="forgetting = false" @confirm="forget">
    This erases the memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone.
  </ConfirmDialog>
</template>
