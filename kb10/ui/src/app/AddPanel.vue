<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useIngest, type MyUpload } from './useIngest'
import { KNOWLEDGE_UPLOAD_ACCEPT } from './ingestableFiles'

// The one ingest panel shared by all three KB kinds. Three sources over a single
// progress model: multi-file upload (Uploads-page style per-file progress),
// already-uploaded files ("My uploads"), and pasted text.
const props = defineProps<{ kbId: string; noun?: string }>()
const emit = defineEmits<{ (e: 'changed'): void }>()

const ing = useIngest(() => props.kbId, () => emit('changed'))

type Mode = 'file' | 'uploads' | 'text'
const mode = ref<Mode>('file')
const modes: { id: Mode; label: string; icon: string }[] = [
  { id: 'file', label: 'Upload files', icon: 'tabler:cloud-upload' },
  { id: 'text', label: 'Paste text', icon: 'tabler:text-plus' },
  { id: 'uploads', label: 'My uploads', icon: 'tabler:folder' },
]

const noun = computed(() => props.noun || 'content')

function setMode(m: Mode) {
  ing.reset()
  mode.value = m
  if (m === 'uploads') loadUploads()
}

// ── File upload (multiple) ─────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

function browse() { fileInput.value?.click() }
function onPick(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) ing.uploadFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const files = e.dataTransfer?.files
  if (files?.length) ing.uploadFiles(files)
}

// ── My uploads ─────────────────────────────────────────────────────────────
const uploads = ref<MyUpload[]>([])
const uploadsLoading = ref(false)
const uploadsError = ref('')
const filter = ref('')
const selected = ref<Record<string, boolean>>({})

const filteredUploads = computed(() => {
  const q = filter.value.trim().toLowerCase()
  return q ? uploads.value.filter((u) => u.filename.toLowerCase().includes(q)) : uploads.value
})
const selectedCount = computed(() => Object.values(selected.value).filter(Boolean).length)

async function loadUploads() {
  uploadsLoading.value = true
  uploadsError.value = ''
  try {
    const { uploads: list } = await ing.listMyUploads(200, 0)
    uploads.value = list
  } catch (e: any) {
    uploadsError.value = e?.message || 'Could not load your uploads'
  } finally {
    uploadsLoading.value = false
  }
}
function toggleSelect(uuid: string) {
  selected.value = { ...selected.value, [uuid]: !selected.value[uuid] }
}
async function addSelected() {
  const picked = uploads.value.filter((u) => selected.value[u.uuid]).map((u) => ({ uuid: u.uuid, name: u.filename }))
  if (!picked.length) return
  await ing.ingestExistingUploads(picked)
  if (!ing.errMsg.value) selected.value = {}
}

function fmtSize(n?: number): string {
  if (!n || n <= 0) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

// ── Text ──────────────────────────────────────────────────────────────────────
const title = ref('')
const text = ref('')
const contentType = ref('text/plain')
const charCount = computed(() => text.value.length)
async function submitText() {
  if (!text.value.trim()) return
  await ing.ingestText(text.value, title.value, contentType.value)
  if (!ing.errMsg.value) { text.value = ''; title.value = '' }
}

// ── Progress items (shared across all sources) ───────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  uploading: 'Uploading…',
  processing: 'Processing…',
  done: 'Added',
  error: 'Failed',
}
function statusIcon(s: string): string {
  if (s === 'done') return 'tabler:circle-check'
  if (s === 'error') return 'tabler:alert-circle'
  return 'tabler:loader-2'
}
const hasItems = computed(() => ing.items.value.length > 0)

onMounted(() => { if (mode.value === 'uploads') loadUploads() })
watch(() => props.kbId, () => { ing.clearItems(); ing.reset() })
</script>

<template>
  <div class="ap">
    <div class="ap-modes" role="tablist">
      <button
        v-for="m in modes"
        :key="m.id"
        class="ap-mode"
        :class="{ on: mode === m.id }"
        role="tab"
        :aria-selected="mode === m.id"
        @click="setMode(m.id)"
      >
        <Icon :icon="m.icon" aria-hidden="true" />
        <span>{{ m.label }}</span>
      </button>
    </div>

    <!-- Success is shown per-item in the progress list below; only errors need a banner. -->
    <div v-if="ing.errMsg.value" class="ap-msg err"><Icon icon="tabler:alert-circle" />{{ ing.errMsg.value }}</div>

    <!-- Upload files (multiple) -->
    <section v-if="mode === 'file'" class="ap-pane">
      <input ref="fileInput" type="file" class="ap-file" multiple :accept="KNOWLEDGE_UPLOAD_ACCEPT" @change="onPick" />
      <button
        type="button"
        class="ap-drop"
        :class="{ over: dragOver }"
        @click="browse"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop="onDrop"
      >
        <Icon icon="tabler:cloud-upload" class="ap-drop-ico" aria-hidden="true" />
        <span class="ap-drop-t">Drop files or click to browse</span>
        <span class="ap-drop-s">Upload several at once — PDF, Word, Excel, PowerPoint, and plain text.</span>
      </button>
    </section>

    <!-- My uploads -->
    <section v-else-if="mode === 'uploads'" class="ap-pane">
      <div class="ap-uploads-bar">
        <input v-model="filter" class="ap-input" type="text" placeholder="Filter your uploads…" autocomplete="off" />
        <button class="ap-submit" :disabled="!selectedCount || ing.busy.value" @click="addSelected">
          <Icon :icon="ing.busy.value ? 'tabler:loader-2' : 'tabler:plus'" :class="ing.busy.value && 'spin'" aria-hidden="true" />
          {{ selectedCount ? `Add ${selectedCount} selected` : 'Add selected' }}
        </button>
      </div>
      <div v-if="uploadsLoading" class="ap-uploads-state"><Icon icon="tabler:loader-2" class="spin" aria-hidden="true" /> Loading your uploads…</div>
      <div v-else-if="uploadsError" class="ap-uploads-state err"><Icon icon="tabler:alert-circle" aria-hidden="true" /> {{ uploadsError }}</div>
      <div v-else-if="!filteredUploads.length" class="ap-uploads-state"><Icon icon="tabler:folder-off" aria-hidden="true" /> No uploads found.</div>
      <ul v-else class="ap-uploads">
        <li
          v-for="u in filteredUploads"
          :key="u.uuid"
          class="ap-upload"
          :class="{ on: selected[u.uuid] }"
          @click="toggleSelect(u.uuid)"
        >
          <Icon class="ap-upload-check" :icon="selected[u.uuid] ? 'tabler:square-check' : 'tabler:square'" aria-hidden="true" />
          <Icon class="ap-upload-ico" icon="tabler:file-text" aria-hidden="true" />
          <span class="ap-upload-main">
            <span class="ap-upload-name">{{ u.filename }}</span>
            <span class="ap-upload-meta">
              <span v-if="u.mime_type" class="mono">{{ u.mime_type }}</span>
              <span v-if="fmtSize(u.size)">{{ fmtSize(u.size) }}</span>
            </span>
          </span>
        </li>
      </ul>
    </section>

    <!-- Text -->
    <section v-else class="ap-pane">
      <div class="ap-form">
        <div class="ap-grid2">
          <div class="ap-field">
            <label class="ap-label" for="ap-title">Title <span class="ap-opt">optional</span></label>
            <input id="ap-title" v-model="title" class="ap-input" type="text" :placeholder="`Give this ${noun} a title`" autocomplete="off" />
          </div>
          <div class="ap-field">
            <label class="ap-label" for="ap-format">Format</label>
            <select id="ap-format" v-model="contentType" class="ap-input">
              <option value="text/plain">Plain text</option>
              <option value="text/markdown">Markdown</option>
              <option value="text/html">HTML</option>
            </select>
          </div>
        </div>
        <div class="ap-field">
          <div class="ap-label-row">
            <label class="ap-label" for="ap-content">Content</label>
            <span v-if="charCount" class="ap-count">{{ charCount.toLocaleString() }} chars</span>
          </div>
          <textarea
            id="ap-content"
            v-model="text"
            class="ap-textarea"
            rows="12"
            :placeholder="`Paste or write the ${noun} to add to this knowledge base…`"
          />
        </div>
        <div class="ap-actions">
          <span class="ap-hint"><Icon icon="tabler:sparkles" aria-hidden="true" /> Content is chunked and embedded automatically.</span>
          <button class="ap-submit" :disabled="!text.trim() || ing.busy.value" @click="submitText">
            <Icon :icon="ing.busy.value ? 'tabler:loader-2' : 'tabler:upload'" :class="ing.busy.value && 'spin'" aria-hidden="true" />
            {{ ing.busy.value ? 'Adding…' : 'Add to knowledge base' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Shared progress list across all sources -->
    <div v-if="hasItems" class="ap-items">
      <div class="ap-items-h">
        <span>Progress</span>
        <button v-if="!ing.busy.value" class="ap-items-clear" @click="ing.clearItems()">Clear done</button>
      </div>
      <ul class="ap-items-list">
        <li v-for="it in ing.items.value" :key="it.key" class="ap-item" :class="it.status">
          <Icon class="ap-item-ic" :class="['uploading','processing','embedding'].includes(it.status) && 'spin'" :icon="statusIcon(it.status)" aria-hidden="true" />
          <span class="ap-item-name">{{ it.name }}</span>
          <span class="ap-item-status">{{ it.error || STATUS_LABEL[it.status] }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
