<!-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import { KIND_META, topicLabel } from './format'
import { canonicalTopicKey, isCanonicalTopicKey } from './topic'
import { eventDetail, type MemoryKind } from './types'
import { usePaged, type Memory } from './useMemory'
import { useWidget } from './useWidget'

const props = defineProps<{ memory: Memory }>()
const emit = defineEmits<{ (e: 'added', id: string): void }>()

type AgentKind = Extract<MemoryKind, 'identity' | 'rule' | 'skill' | 'lesson'>
const KINDS: { value: AgentKind; label: string; hint: string }[] = [
  { value: 'identity', label: 'Identity', hint: 'Who the agent is: its name, role and voice. Part of every conversation.' },
  { value: 'rule', label: 'Rule', hint: 'How the agent must behave. Part of every conversation.' },
  { value: 'skill', label: 'Skill', hint: 'Something the agent knows how to do. Recalled when relevant.' },
  { value: 'lesson', label: 'Lesson', hint: 'Experience worth reusing. Recalled when relevant.' },
]
const kind = ref<AgentKind>('rule')
const agent = ref('')
const topic = ref('')
const text = ref('')
const picker = useWidget('wc-agent-picker')

const kindHint = computed(() => KINDS.find((k) => k.value === kind.value)?.hint || '')
const topicKey = computed(() => canonicalTopicKey(topic.value))
const topicError = computed(() => (topic.value && !isCanonicalTopicKey(topicKey.value) ? 'Use a short topic of letters, digits and spaces.' : ''))
const ready = computed(() => !!agent.value && isCanonicalTopicKey(topicKey.value) && !!text.value.trim())

const topics = usePaged<{ key: string; cardinality: 'single' | 'multi'; current_count: number }>(
  () => (props.memory.memoryId.value ? `${props.memory.base.value}/topics?scope_family=agent&kind=${kind.value}` : null),
  'topics', props.memory.revision)
const suggestions = computed(() => topics.rows.value.map((t) => t.key).filter((key) => key !== topicKey.value).slice(0, 8))

watch(kind, () => { topic.value = '' })

function onAgent(event: Event) {
  const selected = eventDetail(event).selected
  agent.value = String((Array.isArray(selected) ? selected : [])[0] || '')
}

async function add() {
  if (!ready.value) return
  let created: string | null = null
  const target = `${props.memory.base.value}/items`
  const ok = await props.memory.act(async () => {
    const { data } = await api.post(target, {
      kind: kind.value, scope_family: 'agent', scope_id: agent.value, key: topicKey.value, value: text.value.trim(), content: text.value.trim(),
    })
    if (!data || typeof data.item_id !== 'string' || !data.item_id) throw new Error('Memory create response is missing item_id')
    created = data.item_id
  })
  if (ok && created !== null) emit('added', created)
}
</script>

<template>
  <form class="mm-form" @submit.prevent="add">
    <div class="mm-field">
      <span id="add_kind" class="mm-label">What to add</span>
      <SelectButton v-model="kind" :options="KINDS" option-label="label" option-value="value" :allow-empty="false" aria-labelledby="add_kind" />
      <span class="mm-hint"><Icon :icon="KIND_META[kind].icon" aria-hidden="true" />{{ kindHint }}</span>
    </div>
    <div class="mm-field">
      <span id="add_agent" class="mm-label">Agent</span>
      <wc-agent-picker v-if="picker.ready.value" aria-labelledby="add_agent" multi="false" placeholder="Pick the agent"
        :selected="agent ? JSON.stringify([agent]) : '[]'" @change="onAgent"></wc-agent-picker>
      <Message v-else-if="picker.failed.value" severity="error" size="small">The agent picker could not load: {{ picker.failed.value }}</Message>
    </div>
    <div class="mm-field">
      <label class="mm-label" for="add_topic">Topic</label>
      <InputText id="add_topic" v-model="topic" placeholder="e.g. response style" :invalid="!!topicError" autocomplete="off" />
      <span v-if="topicError" class="mm-hint mm-hint-err">{{ topicError }}</span>
      <span v-else class="mm-hint">What this is about, not what it says. A topic that already exists gets a new version.</span>
      <div v-if="suggestions.length" class="mm-suggest" aria-label="Topics in use">
        <button v-for="key in suggestions" :key="key" type="button" class="mm-suggest-chip" @click="topic = topicLabel(key)">{{ topicLabel(key) }}</button>
      </div>
    </div>
    <div class="mm-field">
      <label class="mm-label" for="add_text">Text</label>
      <Textarea id="add_text" v-model="text" auto-resize rows="3" placeholder="e.g. Answer in short bullet points." />
    </div>
    <div class="mm-form-foot">
      <button type="submit" class="kx-btn kx-btn-primary" :disabled="memory.busy.value || !ready">
        <Icon :icon="memory.busy.value ? 'tabler:loader-2' : 'tabler:plus'" :class="{ spin: memory.busy.value }" aria-hidden="true" />Add to memory
      </button>
    </div>
  </form>
</template>
