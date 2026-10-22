import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { api, host, on } from '@wippy-fe/proxy'
import { KNOWLEDGE_UPLOAD_REJECT_MESSAGE, isKnowledgeIngestableFile } from './ingestableFiles'
import {
  subscribeComponentMeta,
  type ComponentMetaEvent,
} from './componentMeta'

// Shared ingest pipeline for the kb10 detail UIs, used by the one AddPanel across
// all three KB kinds. Four sources funnel into one progress model:
//   - file upload (multiple at once): upload-token -> POST /uploads (per file),
//     processed by the uploads module, then auto-queued into the KB by the
//     upload-token callback. Progress streams over the owner upload:<uuid>
//     notification topic, so a file is done when its upload is processed.
//   - existing uploads ("My uploads"): POST /ingest-upload by upload id.
//   - URL and pasted text: POST a KB content event.
// Completion = the content is in the KB and queued for embedding; embedding runs
// in the background per-KB, so onDone is re-fired a few times (a poll, like the
// Uploads page) to let the host list pick up materialized documents.
//
// Realtime uses the documented web-component proxy event API. Upload completion
// uses the owner per-upload notifications. KB background failures surface through
// canonical component public meta on `component.<kb_id>`.

export type IngestStatus = 'uploading' | 'processing' | 'done' | 'error'

export interface IngestItem {
  key: string
  name: string
  uuid?: string
  externalId?: string
  status: IngestStatus
  error?: string
}

export interface MyUpload {
  uuid: string
  filename: string
  mime_type?: string
  size?: number
  status?: string
  created_at?: string
}

const ACTIVE: IngestStatus[] = ['uploading', 'processing']

export function useIngest(kbId: () => string, onDone: () => void) {
  const items = ref<IngestItem[]>([])
  const submitting = ref(false)
  const okMsg = ref('')
  const errMsg = ref('')

  let keySeq = 0
  const nextKey = (p: string) => `${p}${++keySeq}`

  // busy while any file upload is in flight or a URL/text/my-uploads POST is open.
  const busy = computed(() => submitting.value || items.value.some((i) => ACTIVE.includes(i.status)))

  function reset() { okMsg.value = ''; errMsg.value = '' }
  function clearItems() { items.value = items.value.filter((i) => ACTIVE.includes(i.status)) }
  function removeItem(key: string) { items.value = items.value.filter((i) => i.key !== key) }
  function patch(key: string, p: Partial<IngestItem>) {
    items.value = items.value.map((i) => (i.key === key ? { ...i, ...p } : i))
  }

  // Embedding lands a little after the content is queued, and the KB push topic
  // is not reliably delivered, so re-fire onDone a few times after a completion
  // to let the host list pick up the materialized documents.
  const reloadTimers: ReturnType<typeof setTimeout>[] = []
  function scheduleReloads() {
    for (const t of reloadTimers.splice(0)) clearTimeout(t)
    for (const ms of [2500, 8000, 20000]) reloadTimers.push(setTimeout(() => onDone(), ms))
  }

  function announceAdded() {
    const done = items.value.filter((i) => i.status === 'done').length
    okMsg.value = done > 1 ? `Added ${done} items to the library.` : 'Added to the library.'
    onDone()
    scheduleReloads()
  }

  function markDone(key: string) {
    const it = items.value.find((i) => i.key === key)
    if (!it || it.status === 'done') return
    patch(key, { status: 'done' })
    announceAdded()
  }

  // A queued, terminal item for the sources that complete on their POST (URL,
  // text, existing uploads) rather than on an upload-progress topic.
  function addQueued(name: string, uuid?: string) {
    items.value = [...items.value, { key: nextKey('q'), name, uuid, status: 'done' }]
    announceAdded()
  }

  // ── Realtime ────────────────────────────────────────────────────────────────
  const uploadSubs = new Map<string, () => void>()
  const uploadStatusTimers: ReturnType<typeof setTimeout>[] = []

  function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }

  function messageTopic(msg: unknown): string {
    const root = isRecord(msg) ? msg : {}
    return String(root.topic || '')
  }

  function uploadStatusPayload(msg: unknown): Record<string, unknown> {
    const root = isRecord(msg) ? msg : {}
    const candidates = [
      root,
      isRecord(root.data) ? root.data : null,
      isRecord(root.payload) ? root.payload : null,
      isRecord(root.detail) ? root.detail : null,
    ].filter(Boolean) as Record<string, unknown>[]
    for (const item of candidates) {
      if (typeof item.uuid === 'string' && typeof item.status === 'string') return item
    }
    return {}
  }

  function applyUploadStatus(uuid: string, status: unknown, error?: unknown) {
    const it = items.value.find((i) => i.uuid === uuid && ACTIVE.includes(i.status))
    if (!it) return
    const s = String(status || '')
    // 'completed' = the file is processed and queued into the KB; that's done for
    // the upload. Embedding then runs in the background.
    if (s === 'error' || s === 'failed') {
      patch(it.key, { status: 'error', error: String(error || 'File processing failed') })
    } else if (s === 'completed') {
      markDone(it.key)
    } else if (['pending', 'uploaded', 'queued', 'processing'].includes(s)) {
      patch(it.key, { status: 'processing' })
    }
  }

  function handleUpload(uuid: string, msg: unknown) {
    const data = uploadStatusPayload(msg)
    if (data.uuid !== uuid) return
    applyUploadStatus(uuid, data.status, data.error)
  }

  function subscribeUploadTopic(uuid: string) {
    const topic = `upload:${uuid}`
    if (uploadSubs.has(topic)) return
    const off = on('@message', (msg: unknown) => {
      if (messageTopic(msg) !== topic) return
      handleUpload(uuid, msg)
    })
    if (typeof off === 'function') uploadSubs.set(topic, off)
  }

  async function refreshUploadStatus(uuid: string) {
    if (!uuid || !items.value.some((i) => i.uuid === uuid && ACTIVE.includes(i.status))) return
    try {
      const { data } = await api.get(`/api/v1/uploads/${encodeURIComponent(uuid)}`)
      const upload = isRecord(data?.upload) ? data.upload : (isRecord(data) ? data : {})
      applyUploadStatus(uuid, upload.status, upload.error || upload.error_details)
    } catch {
      // Realtime is the primary path; this bounded reconciliation only closes
      // missed-event races and must not surface transient read failures as ingest errors.
    }
  }

  function scheduleUploadStatusRefresh(uuid: string) {
    void refreshUploadStatus(uuid)
    for (const ms of [1500, 5000, 15000]) {
      uploadStatusTimers.push(setTimeout(() => { void refreshUploadStatus(uuid) }, ms))
    }
  }

  function handleComponentMeta(event: ComponentMetaEvent) {
    const meta = event.meta || {}
    if (String(meta.status || '') === 'error') {
      const err = String(meta.last_error || 'Embedding failed')
      for (const it of items.value) if (ACTIVE.includes(it.status)) patch(it.key, { status: 'error', error: err })
      errMsg.value = err
    }
  }

  let kbUnsub: (() => void) | null = null
  let kbRun = 0
  function subscribeKb(id: string) {
    const run = ++kbRun
    if (kbUnsub) { kbUnsub(); kbUnsub = null }
    if (!id) return
    const off = subscribeComponentMeta(id, handleComponentMeta)
    if (run !== kbRun) {
      if (off) off()
      return
    }
    kbUnsub = off
  }
  watch(() => kbId(), (id) => { subscribeKb(id) }, { immediate: true })

  onBeforeUnmount(() => {
    for (const t of reloadTimers.splice(0)) clearTimeout(t)
    for (const t of uploadStatusTimers.splice(0)) clearTimeout(t)
    kbRun++
    if (kbUnsub) kbUnsub()
    for (const off of uploadSubs.values()) off()
    uploadSubs.clear()
  })

  // ── File upload (multiple) ──────────────────────────────────────────────────
  async function startUpload(key: string, file: File, id: string) {
    try {
      const { data: token } = await api.post(`/api/v1/knowledge/${id}/upload-token`)
      if (!token?.success || !token.upload_token) {
        patch(key, { status: 'error', error: token?.error || 'Could not get an upload token' })
        return
      }
      const form = new FormData()
      form.append('file', file)
      form.append('upload_token', token.upload_token)
      const { data: res } = await api.post('/api/v1/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res?.success && res.uuid) {
        const uuid = String(res.uuid)
        patch(key, { uuid, externalId: `upload:${uuid}`, status: 'processing' })
        subscribeUploadTopic(uuid)
        scheduleUploadStatusRefresh(uuid)
      } else {
        patch(key, { status: 'error', error: res?.error || 'Upload failed' })
      }
    } catch (e: any) {
      patch(key, { status: 'error', error: e?.response?.data?.error || e?.message || 'Upload error' })
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    }
  }

  function uploadFiles(files: FileList | File[]) {
    const id = kbId()
    if (!id) return
    reset()
    for (const file of Array.from(files)) {
      if (!isKnowledgeIngestableFile(file)) { errMsg.value = KNOWLEDGE_UPLOAD_REJECT_MESSAGE; continue }
      const key = nextKey('f')
      items.value = [...items.value, { key, name: file.name, status: 'uploading' }]
      void startUpload(key, file, id)
    }
  }

  function uploadFile(file: File) { uploadFiles([file]) }

  // ── Existing uploads ("My uploads") ─────────────────────────────────────────
  async function listMyUploads(limit = 100, offset = 0): Promise<{ uploads: MyUpload[]; total: number }> {
    const { data } = await api.get(`/api/v1/uploads/list?limit=${limit}&offset=${offset}`)
    const raw = Array.isArray(data?.uploads) ? data.uploads : []
    const uploads: MyUpload[] = raw.map((u: any) => ({
      uuid: String(u.uuid),
      filename: String(u.filename || (u.meta && u.meta.filename) || u.uuid),
      mime_type: u.mime_type,
      size: u.size,
      status: u.status,
      created_at: u.created_at,
    }))
    return { uploads, total: Number(data?.meta?.total ?? uploads.length) }
  }

  async function ingestExistingUploads(uploads: { uuid: string; name?: string }[]) {
    const id = kbId()
    if (!id || !uploads.length) return
    reset()
    submitting.value = true
    try {
      const { data } = await api.post(`/api/v1/knowledge/${id}/ingest-upload`, {
        upload_ids: uploads.map((u) => u.uuid),
      })
      const results = Array.isArray(data?.results) ? data.results : []
      const nameOf = (uuid: string) => uploads.find((u) => u.uuid === uuid)?.name || uuid
      let any = false
      for (const r of results) {
        if (r?.success) { any = true; addQueued(nameOf(String(r.upload_id)), String(r.upload_id)) }
      }
      if (!any) errMsg.value = data?.error || 'Could not ingest the selected uploads'
    } catch (e: any) {
      errMsg.value = e?.response?.data?.error || e?.message || 'Ingest error'
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      submitting.value = false
    }
  }

  // ── Pasted text ──────────────────────────────────────────────────────────────
  async function ingestText(content: string, title: string, contentType: string) {
    const id = kbId()
    if (!content.trim() || !id) return
    reset()
    submitting.value = true
    try {
      const metadata = title.trim() ? { title: title.trim() } : undefined
      const { data } = await api.post(`/api/v1/knowledge/${id}/ingest`, { content, content_type: contentType, metadata })
      if (data?.success) addQueued(title.trim() || 'Pasted text')
      else errMsg.value = data?.error || 'Ingestion failed'
    } catch (e: any) {
      errMsg.value = e?.response?.data?.error || e?.message || 'Ingestion error'
      host.handleError(e?.response?.status === 401 ? 'auth-expired' : 'other', e)
    } finally {
      submitting.value = false
    }
  }

  return {
    items,
    busy,
    okMsg: computed(() => okMsg.value),
    errMsg: computed(() => errMsg.value),
    reset,
    clearItems,
    removeItem,
    uploadFile,
    uploadFiles,
    listMyUploads,
    ingestExistingUploads,
    ingestText,
  }
}
