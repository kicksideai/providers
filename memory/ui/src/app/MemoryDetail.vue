<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { KIND_LABEL, errorText, isRecord, type MemoryItem, type Provenance } from './types'
import { severity, when, type Memory } from './useMemory'

// One memory: its text, when it was true and learned, its versions and the
// messages it was seen in. Identity and rules are edited here as new versions.
const props = defineProps<{ memory: Memory; item: MemoryItem }>()
const emit = defineEmits<{ (e: 'replaced', item: MemoryItem): void }>()

const detail = ref<MemoryItem>(props.item)
const versions = ref<MemoryItem[]>([])
const provenance = ref<Provenance[]>([])
const editing = ref('')
const confirmingForget = ref(false)
const itemUrl = computed(() => `${props.memory.base.value}/items/${encodeURIComponent(props.item.id)}`)
const editable = computed(() => (detail.value.kind === 'identity' || detail.value.kind === 'rule') && detail.value.status === 'current')

async function load() {
  editing.value = ''
  confirmingForget.value = false
  if (detail.value.id !== props.item.id) detail.value = props.item
  try {
    const { data } = await api.get(itemUrl.value)
    if (!isRecord(data)) return
    if (isRecord(data.item)) detail.value = data.item as unknown as MemoryItem
    versions.value = (Array.isArray(data.versions) ? data.versions : []) as MemoryItem[]
    provenance.value = (Array.isArray(data.provenance) ? data.provenance : []) as Provenance[]
  } catch (err) {
    props.memory.error.value = errorText(err)
  }
}

watch([() => props.item.id, props.memory.revision], () => { void load() }, { immediate: true })

function forget() {
  void props.memory.act(() => api.post(`${itemUrl.value}/forget`, {}))
}
function archive() {
  void props.memory.act(() => api.post(`${itemUrl.value}/archive`, {}))
}
function restore() {
  void props.memory.act(() => api.post(`${itemUrl.value}/restore`, {}))
}
function save() {
  const content = editing.value.trim()
  if (!content) return
  void props.memory.act(async () => {
    const { data } = await api.put(itemUrl.value, { content })
    if (isRecord(data) && typeof data.item_id === 'string') emit('replaced', { ...detail.value, id: data.item_id })
  })
}
</script>

<template>
  <div class="mm-panel">
    <div class="mm-panel-h"><span>{{ KIND_LABEL[detail.kind] }} · {{ detail.key }}</span><Tag class="kx-tag-sm" :severity="severity(detail.status)" :value="detail.status" /></div>
    <div class="mm-panel-b">
      <template v-if="editing">
        <Textarea v-model="editing" auto-resize aria-label="Memory text" />
        <div class="mm-actions">
          <Button label="Save new version" size="small" :disabled="memory.busy.value" @click="save"><template #icon><Icon icon="tabler:check" /></template></Button>
          <Button label="Cancel" size="small" severity="secondary" text @click="editing = ''" />
        </div>
      </template>
      <div v-else class="mm-row-t">{{ detail.content }}</div>
      <dl class="mm-dl">
        <dt>About</dt><dd>{{ detail.scope_family === 'agent' ? `agent ${detail.scope_id}` : 'the person who said it' }}</dd>
        <dt>True since</dt><dd>{{ when(detail.valid_at) }}</dd>
        <template v-if="detail.invalid_at"><dt>Until</dt><dd>{{ when(detail.invalid_at) }}</dd></template>
        <dt>Learned</dt><dd>{{ when(detail.recorded_at) }} · {{ detail.source }}</dd>
      </dl>
      <div class="mm-actions">
        <Button v-if="editable && !editing" label="Edit" size="small" severity="secondary" outlined @click="editing = detail.content"><template #icon><Icon icon="tabler:pencil" /></template></Button>
        <Button v-if="detail.status === 'current' || detail.status === 'conflict'" label="Archive" size="small" severity="secondary" outlined :disabled="memory.busy.value" @click="archive"><template #icon><Icon icon="tabler:archive" /></template></Button>
        <Button v-if="detail.status === 'archived'" label="Restore" size="small" severity="secondary" outlined :disabled="memory.busy.value" @click="restore"><template #icon><Icon icon="tabler:restore" /></template></Button>
        <Button v-if="detail.status !== 'forgotten' && !confirmingForget" label="Forget" size="small" severity="danger" outlined :disabled="memory.busy.value" @click="confirmingForget = true"><template #icon><Icon icon="tabler:trash" /></template></Button>
      </div>
      <Message v-if="confirmingForget" severity="warn" size="small">
        Forget erases this memory, every earlier version of it and the conversation lines it was learned from. It cannot be undone.
        <div class="mm-actions mm-confirm">
          <Button label="Forget for good" size="small" severity="danger" :disabled="memory.busy.value" @click="forget" />
          <Button label="Cancel" size="small" severity="secondary" text @click="confirmingForget = false" />
        </div>
      </Message>
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
</template>
