<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import { eventDetail, kindOptions } from './types'
import { canonicalTopicKey, defaultTopic, isCanonicalTopicKey, topicSuggestions, type OwnerMemoryKind } from './topic'
import type { Memory } from './useMemory'
import { useWidget } from './useWidget'

// Adds an identity, rule, skill or lesson for one agent; identity and rules are
// part of that agent's instructions in every conversation.
const props = defineProps<{ memory: Memory }>()
const emit = defineEmits<{ (e: 'done'): void }>()

const KINDS = kindOptions(['identity', 'rule', 'skill', 'lesson'])
const kind = ref<OwnerMemoryKind>('rule')
const agent = ref('')
const topic = ref(defaultTopic('rule'))
const text = ref('')
const picker = useWidget('wc-agent-picker')
const suggestions = computed(() => topicSuggestions(kind.value))
const topicKey = computed(() => canonicalTopicKey(topic.value))
const topicError = computed(() => !isCanonicalTopicKey(topicKey.value)
  ? 'Use a short topic key that starts with a letter and contains only lowercase letters, numbers, and underscores.'
  : '')

watch(kind, (next, previous) => {
  if (topic.value === defaultTopic(previous)) topic.value = defaultTopic(next)
})

function onAgent(event: Event) {
  const selected = eventDetail(event).selected
  agent.value = String((Array.isArray(selected) ? selected : [])[0] || '')
}

async function add() {
  const content = text.value.trim()
  if (topicError.value) return
  const added = await props.memory.act(() => api.post(`${props.memory.base.value}/items`, {
    kind: kind.value, scope_family: 'agent', scope_id: agent.value, key: topicKey.value, content,
  }))
  if (added) emit('done')
}
</script>

<template>
  <div class="mm-panel">
    <div class="mm-panel-h">Add agent memory</div>
    <div class="mm-panel-b">
      <span class="mm-hint">Identity and rules are part of the agent's instructions in every conversation.</span>
      <SelectButton v-model="kind" :options="KINDS" option-label="label" option-value="value" :allow-empty="false" size="small" aria-label="Kind" />
      <div class="mm-field">
        <span id="rule_agent" class="mm-label">Agent</span>
        <wc-agent-picker v-if="picker.ready.value" aria-labelledby="rule_agent" multi="false" placeholder="Pick the agent"
          :selected="agent ? JSON.stringify([agent]) : '[]'" @change="onAgent"></wc-agent-picker>
        <Message v-else-if="picker.failed.value" severity="error" size="small">The agent picker could not load: {{ picker.failed.value }}</Message>
      </div>
      <div class="mm-field">
        <label class="mm-label" for="rule_topic">Topic key</label>
        <InputText id="rule_topic" v-model="topic" list="rule_topic_suggestions" aria-describedby="rule_topic_hint rule_topic_error" />
        <datalist id="rule_topic_suggestions"><option v-for="suggestion in suggestions" :key="suggestion" :value="suggestion" /></datalist>
        <span id="rule_topic_hint" class="mm-hint">A stable subject for this memory. Choose a suggestion or enter a short key; it never comes from the memory text.</span>
        <Message v-if="topicError" id="rule_topic_error" severity="error" size="small">{{ topicError }}</Message>
      </div>
      <div class="mm-field"><label class="mm-label" for="rule_text">Text</label>
        <Textarea id="rule_text" v-model="text" auto-resize placeholder="e.g. Answer in short bullet points." /></div>
      <div class="mm-actions">
        <Button label="Add" size="small" :disabled="memory.busy.value || !text.trim() || !agent || !!topicError" @click="add"><template #icon><Icon icon="tabler:plus" /></template></Button>
        <Button label="Cancel" size="small" severity="secondary" text @click="emit('done')" />
      </div>
    </div>
  </div>
</template>
