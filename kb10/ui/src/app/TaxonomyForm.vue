<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { api, host } from '@wippy-fe/proxy'
import { type GraphConcept, type GraphEdge, type TaxAction } from './types'
import { IconButton, KbButton } from './shared'

// The shared concept taxonomy editor — add child / rename / move / delete — used
// inline by the wiki reader and in a popover by the graph rail. It owns the form,
// validation, and the concept API calls, and reports the node to select next so
// the host can refresh and reselect. Structure edits are immediate graph ops.
const props = defineProps<{
  kbId: string
  mode: TaxAction
  target: GraphConcept | null
  concepts: GraphConcept[]
  edges: GraphEdge[]
}>()
const emit = defineEmits<{ (e: 'saved', nextId: string): void; (e: 'close'): void }>()

const label = ref('')
const description = ref('')
const parentId = ref('')
const reassignId = ref('')
const busy = ref(false)
const error = ref('')

const conceptsById = computed(() => {
  const m = new Map<string, GraphConcept>()
  for (const c of props.concepts) m.set(c.id, c)
  return m
})
const parentOfMap = computed(() => {
  const m = new Map<string, string>()
  for (const e of props.edges) {
    if ((e.edge_type === 'subtopic_of' || e.edge_type === 'categorized_as')
      && conceptsById.value.has(e.from_node_id) && conceptsById.value.has(e.to_node_id)) {
      m.set(e.from_node_id, e.to_node_id)
    }
  }
  return m
})
const title = computed(() => (
  { add: 'Add child concept', rename: 'Rename', move: 'Move to', delete: 'Delete' } as Record<TaxAction, string>
)[props.mode] || '')

const conceptOptions = computed(() => props.concepts.filter((c) => c.node_type !== 'document'))
function isDescendantOf(candidateId: string, ancestorId: string): boolean {
  let id: string | undefined = candidateId
  const guard = new Set<string>()
  while (id && !guard.has(id)) {
    if (id === ancestorId) return true
    guard.add(id)
    id = parentOfMap.value.get(id)
  }
  return false
}
const parentOptions = computed(() => {
  const t = props.target
  if (!t) return conceptOptions.value
  return conceptOptions.value.filter((c) => c.id !== t.id && !isDescendantOf(c.id, t.id))
})
const targetChildren = computed(() => {
  const t = props.target
  if (!t) return { childCount: 0, documentCount: 0, empty: true }
  let childCount = 0
  let documentCount = 0
  for (const e of props.edges) {
    if (e.to_node_id !== t.id) continue
    if (e.edge_type === 'subtopic_of') childCount += 1
    if (e.edge_type === 'categorized_as') documentCount += 1
  }
  return { childCount, documentCount, empty: childCount === 0 && documentCount === 0 }
})
const canSubmit = computed(() => {
  const t = props.target
  if (busy.value) return false
  if (props.mode === 'add') return label.value.trim() !== ''
  if (!t || (t.is_root && (props.mode === 'move' || props.mode === 'delete'))) return false
  if (props.mode === 'rename') return label.value.trim() !== ''
  if (props.mode === 'move') return parentId.value !== '' && parentId.value !== t.id
  if (props.mode === 'delete') return targetChildren.value.empty || reassignId.value !== ''
  return false
})

watch(() => [props.mode, props.target] as const, () => {
  const t = props.target
  label.value = props.mode === 'rename' ? (t?.label || '') : ''
  description.value = props.mode === 'rename' ? (t?.description || '') : ''
  parentId.value = (t && parentOfMap.value.get(t.id)) || ''
  reassignId.value = ''
  error.value = ''
}, { immediate: true })

async function submit() {
  const t = props.target
  const id = props.kbId
  if (!id || !canSubmit.value) return
  busy.value = true
  error.value = ''
  try {
    let next = t?.id || ''
    if (props.mode === 'add') {
      const { data } = await api.post(`/api/v1/kb10/${id}/concepts`, {
        label: label.value.trim(), description: description.value.trim(), parent_id: t?.id,
      })
      if (!data?.success) throw new Error(data?.error || 'create failed')
      next = data.node_id || next
    } else if (props.mode === 'rename' && t) {
      const { data } = await api.patch(`/api/v1/kb10/${id}/concepts/${encodeURIComponent(t.id)}`, {
        label: label.value.trim(), description: description.value.trim(),
      })
      if (!data?.success) throw new Error(data?.error || 'update failed')
      next = t.id
    } else if (props.mode === 'move' && t) {
      const { data } = await api.put(`/api/v1/kb10/${id}/concepts/${encodeURIComponent(t.id)}/parent`, {
        parent_id: parentId.value,
      })
      if (!data?.success) throw new Error(data?.error || 'move failed')
      next = t.id
    } else if (props.mode === 'delete' && t) {
      const body = reassignId.value ? { reassign_to_concept_id: reassignId.value } : {}
      const { data } = await api.delete(`/api/v1/kb10/${id}/concepts/${encodeURIComponent(t.id)}`, { data: body })
      if (!data?.success) throw new Error(data?.error || 'delete failed')
      next = reassignId.value || parentOfMap.value.get(t.id) || ''
    }
    emit('saved', next)
  } catch (e: any) {
    error.value = e?.response?.data?.error || e?.message || 'taxonomy update failed'
    host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="wk-tax" @submit.prevent="submit">
    <div class="wk-tax-h">
      <span>{{ title }}</span>
      <IconButton icon="tabler:x" label="Close" size="sm" @click="emit('close')" />
    </div>
    <template v-if="mode === 'add' || mode === 'rename'">
      <input v-model="label" class="wk-tax-input" placeholder="Label" maxlength="120" autocomplete="off" />
      <textarea v-model="description" class="wk-tax-textarea" rows="2" placeholder="Description (optional)" />
    </template>
    <select v-if="mode === 'move'" v-model="parentId" class="wk-tax-input">
      <option value="" disabled>Select a parent</option>
      <option v-for="c in parentOptions" :key="c.id" :value="c.id">{{ c.label || c.id }}</option>
    </select>
    <div v-if="mode === 'delete'" class="wk-tax-del">
      <div class="wk-tax-counts">
        <span><Icon icon="tabler:list-tree" aria-hidden="true" />{{ targetChildren.childCount }} subtopics</span>
        <span><Icon icon="tabler:file-text" aria-hidden="true" />{{ targetChildren.documentCount }} pages</span>
      </div>
      <select v-if="!targetChildren.empty" v-model="reassignId" class="wk-tax-input">
        <option value="" disabled>Reassign contents to…</option>
        <option v-for="c in parentOptions" :key="c.id" :value="c.id">{{ c.label || c.id }}</option>
      </select>
    </div>
    <div v-if="error" class="wk-tax-err"><Icon icon="tabler:alert-circle" aria-hidden="true" /><span>{{ error }}</span></div>
    <div class="wk-tax-foot">
      <KbButton variant="ghost" small :disabled="busy" @click="emit('close')">Cancel</KbButton>
      <KbButton
        type="submit"
        small
        :variant="mode === 'delete' ? 'danger' : 'primary'"
        :loading="busy"
        :disabled="!canSubmit"
      >{{ mode === 'delete' ? 'Delete' : 'Save' }}</KbButton>
    </div>
  </form>
</template>
