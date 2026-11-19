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

export type IngestStatus = 'uploading' | 'processing' | 'retrying' | 'done' | 'error'

export interface IngestItem {
  key: string
  name: string
  uuid?: string
  targetKb?: string
  needsFileSelection?: boolean
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

const ACTIVE: IngestStatus[] = ['uploading', 'processing', 'retrying']
const UPLOAD_FAILURES = ['error', 'failed', 'enqueue_failed']
const UPLOAD_PROGRESS = ['pending', 'uploaded', 'queued', 'processing']
const UNCONFIRMED_UPLOAD = 'Upload could not be confirmed. Retry this file to continue.'

interface PendingUpload {
  file: File
  token?: string
}

export function useIngest(kbId: () => string, onDone: (closePanel: boolean) => void) {
  const items = ref<IngestItem[]>([])
  const submitting = ref(false)
  const okMsg = ref('')
  const errMsg = ref('')

  let keySeq = 0
  const nextKey = (p: string) => `${p}${++keySeq}`
  const pendingUploads = new Map<string, PendingUpload>()
  const uploadWatches = new Map<string, () => void>()
  const reloadTimers: ReturnType<typeof setTimeout>[] = []
  let fileRefreshTimer: ReturnType<typeof setTimeout> | undefined
  let fileBatchChanged = false

  // busy while any file upload is in flight or a URL/text/my-uploads POST is open.
  const busy = computed(() => submitting.value || items.value.some((i) => ACTIVE.includes(i.status)))

  function reset() { okMsg.value = ''; errMsg.value = '' }
  function clearItems() {
    pendingUploads.clear()
    for (const stop of uploadWatches.values()) stop()
    if (fileRefreshTimer !== undefined) clearTimeout(fileRefreshTimer)
    fileRefreshTimer = undefined
    fileBatchChanged = false
    for (const timer of reloadTimers.splice(0)) clearTimeout(timer)
    items.value = []
  }
  function clearDone() { items.value = items.value.filter((it) => it.status !== 'done') }
  function patch(key: string, p: Partial<IngestItem>) {
    items.value = items.value.map((i) => (i.key === key ? { ...i, ...p } : i))
  }
  function currentFile(key: string) {
    return items.value.find((it) => it.key === key && it.targetKb === kbId())
  }
  function canRetry(it: IngestItem) {
    return it.status === 'error' && it.targetKb === kbId() && !it.needsFileSelection
      && (!!it.uuid || pendingUploads.has(it.key))
  }

  // Embedding lands a little after the content is queued, and the KB push topic
  // is not reliably delivered, so re-fire onDone a few times after a completion
  // to let the host list pick up the materialized documents.
  function scheduleReloads() {
    for (const t of reloadTimers.splice(0)) clearTimeout(t)
    for (const ms of [2500, 8000, 20000]) reloadTimers.push(setTimeout(() => onDone(false), ms))
  }

  function updateAddedMessage() {
    const done = items.value.filter((i) => i.status === 'done').length
    okMsg.value = done > 1 ? `Added ${done} items to the library.` : 'Added to the library.'
  }

  function filesInProgress() {
    return items.value.some((it) => it.targetKb && ACTIVE.includes(it.status))
  }

  function settleFileBatch() {
    if (!fileBatchChanged || filesInProgress()) return
    fileBatchChanged = false
    if (fileRefreshTimer !== undefined) clearTimeout(fileRefreshTimer)
    fileRefreshTimer = undefined
    onDone(false)
    scheduleReloads()
  }

  function failFile(key: string, error: string, needsFileSelection = false) {
    if (!currentFile(key)) return
    patch(key, { status: 'error', error, needsFileSelection })
    settleFileBatch()
  }

  function markDone(key: string) {
    const it = items.value.find((i) => i.key === key)
    if (!it || it.status === 'done') return
    patch(key, { status: 'done', error: undefined })
    updateAddedMessage()
    fileBatchChanged = true
    // Keep long-running batches visible without reloading the catalog for each file.
    if (filesInProgress() && fileRefreshTimer === undefined) {
      fileRefreshTimer = setTimeout(() => {
        fileRefreshTimer = undefined
        onDone(false)
      }, 2500)
    }
    settleFileBatch()
  }

  // A queued, terminal item for the sources that complete on their POST (URL,
  // text, existing uploads) rather than on an upload-progress topic.
  function addQueued(name: string, uuid?: string) {
    items.value = [...items.value, { key: nextKey('q'), name, uuid, status: 'done' }]
    updateAddedMessage()
    onDone(true)
    scheduleReloads()
  }

  // ── Realtime ────────────────────────────────────────────────────────────────
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

  function failureReason(data: unknown, fallback: string): string {
    if (!isRecord(data)) return fallback
    const details = data.details
    const candidates = isRecord(details)
      ? [details.details, details.message, details.error, data.error]
      : [details, data.error]
    return candidates.find((value): value is string => typeof value === 'string' && !!value.trim()) || fallback
  }

  function uploadPath(uuid: string) {
    return `/api/v1/uploads/${encodeURIComponent(uuid)}`
  }

  async function readUpload(uuid: string) {
    try {
      const { data } = await api.get(uploadPath(uuid))
      const upload = isRecord(data?.upload) ? data.upload : (isRecord(data) ? data : {})
      if (upload.uuid !== uuid || typeof upload.status !== 'string') throw new Error(UNCONFIRMED_UPLOAD)
      return upload
    } catch (e: any) {
      if (e?.response?.status === 404) return undefined
      throw e
    }
  }

  function trackUpload(key: string, uuid: string, initial?: Record<string, unknown>, afterRetry = false) {
    if (!currentFile(key)) return
    pendingUploads.delete(key)
    uploadWatches.get(key)?.()
    patch(key, { status: 'processing', error: undefined, needsFileSelection: false })
    const topic = `upload:${uuid}`
    const timers: ReturnType<typeof setTimeout>[] = []
    let off: (() => void) | undefined
    let awaitingRetryProgress = afterRetry
    function stop() {
      uploadWatches.delete(key)
      off?.()
      for (const timer of timers) clearTimeout(timer)
    }
    function apply(upload: Record<string, unknown>, finalCheck = false) {
      if (uploadWatches.get(key) !== stop || !currentFile(key)) return
      const status = String(upload.status)
      if (UPLOAD_PROGRESS.includes(status)) awaitingRetryProgress = false
      if (UPLOAD_FAILURES.includes(status) && (!awaitingRetryProgress || finalCheck)) {
        stop()
        failFile(key, String(upload.error || upload.error_details || 'File processing failed'))
      } else if (status === 'completed') {
        stop()
        markDone(key)
      }
    }
    async function refresh(finalCheck = false) {
      try {
        const upload = await readUpload(uuid)
        if (upload) apply(upload, finalCheck)
      } catch { /* A temporary status lookup failure is separate from file processing. */ }
    }
    uploadWatches.set(key, stop)
    if (initial) apply(initial)
    if (!uploadWatches.has(key)) return
    const unsubscribe = on('@message', (msg: unknown) => {
      if (messageTopic(msg) !== topic) return
      const upload = uploadStatusPayload(msg)
      if (upload.uuid !== uuid) return
      // A delayed failure event from the preceding attempt cannot fail the retry.
      if (afterRetry && upload.status !== 'completed') void refresh()
      else apply(upload)
    })
    if (typeof unsubscribe === 'function') off = unsubscribe
    if (!initial) void refresh()
    for (const ms of [1500, 5000, 15000]) timers.push(setTimeout(() => { void refresh(ms === 15000) }, ms))
  }

  function handleComponentMeta(event: ComponentMetaEvent) {
    const meta = event.meta || {}
    if (String(meta.status || '') === 'error') {
      errMsg.value = String(meta.last_error || 'Embedding failed')
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
    clearItems()
    kbRun++
    if (kbUnsub) kbUnsub()
  })

  // ── File upload (multiple) ──────────────────────────────────────────────────
  async function reconcileSubmission(key: string, uuid: string, reason: string, needsFileSelection = false) {
    try {
      const upload = await readUpload(uuid)
      if (upload) { trackUpload(key, uuid, upload); return }
    } catch { /* The owner's row may not yet exist after an interrupted response. */ }
    failFile(key, reason, needsFileSelection)
  }

  async function submitFile(key: string, uuid: string, file: File, token: string) {
    patch(key, { status: 'uploading', error: undefined })
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('upload_token', token)
      const { data: res } = await api.post('/api/v1/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res?.success && res.uuid === uuid) trackUpload(key, uuid)
      else await reconcileSubmission(key, uuid, failureReason(res, UNCONFIRMED_UPLOAD))
    } catch (e: any) {
      const data = e?.response?.data
      const status = e?.response?.status
      const rejected = status === 400
      const reason = failureReason(data, e?.message || 'Upload failed')
      if (rejected) pendingUploads.delete(key)
      await reconcileSubmission(key, uuid,
        rejected ? `${reason}. Select this file again to start a new upload.` : reason, rejected)
      if (status === 401) host.handleError('auth-expired', e)
    }
  }

  async function startUpload(key: string, id: string) {
    const pending = pendingUploads.get(key)
    if (!pending) return
    try {
      const { data } = await api.post(`/api/v1/knowledge/${encodeURIComponent(id)}/upload-token`)
      if (!currentFile(key)) return
      if (!data?.success || typeof data.upload_token !== 'string' || !data.upload_token
          || typeof data.upload_id !== 'string' || !data.upload_id) {
        failFile(key, failureReason(data, 'Could not get an upload token and file ID'))
        return
      }
      pending.token = data.upload_token
      patch(key, { uuid: data.upload_id })
      await submitFile(key, data.upload_id, pending.file, data.upload_token)
    } catch (e: any) {
      failFile(key, failureReason(e?.response?.data, e?.message || 'Could not get an upload token'))
      if (e?.response?.status === 401) host.handleError('auth-expired', e)
    }
  }

  async function retryFile(key: string) {
    const it = currentFile(key)
    if (!it?.targetKb || !canRetry(it)) return
    const uuid = it.uuid
    if (!uuid) {
      patch(key, { status: 'uploading', error: undefined })
      await startUpload(key, it.targetKb)
      return
    }
    patch(key, { status: 'retrying', error: undefined })
    try {
      const upload = await readUpload(uuid)
      if (!currentFile(key)) return
      if (!upload) {
        const pending = pendingUploads.get(key)
        // Only a missing owner record allows a manual resubmit with the original token.
        if (pending?.token) await submitFile(key, uuid, pending.file, pending.token)
        else failFile(key, 'Upload not found. Select this file again to start a new upload.', true)
      } else if (!UPLOAD_FAILURES.includes(String(upload.status))) {
        trackUpload(key, uuid, upload)
      } else {
        pendingUploads.delete(key)
        const { data } = await api.post(`${uploadPath(uuid)}/retry`)
        if (data?.success && data.upload_id === uuid) trackUpload(key, uuid, undefined, true)
        else await reconcileSubmission(key, uuid, data?.error || 'Could not retry file processing')
      }
    } catch (e: any) {
      await reconcileSubmission(key, uuid, e?.response?.data?.error || UNCONFIRMED_UPLOAD)
      if (e?.response?.status === 401) host.handleError('auth-expired', e)
    }
  }

  function uploadFiles(files: FileList | File[]) {
    const id = kbId()
    if (!id) return
    reset()
    for (const file of Array.from(files)) {
      if (!isKnowledgeIngestableFile(file)) { errMsg.value = KNOWLEDGE_UPLOAD_REJECT_MESSAGE; continue }
      const key = nextKey('f')
      pendingUploads.set(key, { file })
      items.value = [...items.value, { key, name: file.name, targetKb: id, status: 'uploading' }]
      void startUpload(key, id)
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

  async function ingestExistingUploads(uploads: { uuid: string; name?: string }[], reingestKey?: string) {
    const id = kbId()
    if (!id || !uploads.length) return
    reset()
    submitting.value = true
    try {
      const { data } = await api.post(`/api/v1/knowledge/${id}/ingest-upload`, {
        upload_ids: uploads.map((u) => u.uuid),
        ...(reingestKey ? { reingest: true } : {}),
      }, reingestKey ? { headers: { 'Idempotency-Key': reingestKey } } : undefined)
      if (reingestKey && data?.reingest !== true) {
        errMsg.value = 'Re-ingest requires an updated Knowledge service'
        return
      }
      const results = Array.isArray(data?.results) ? data.results : []
      const nameOf = (uuid: string) => uploads.find((u) => u.uuid === uuid)?.name || uuid
      let any = false
      for (const r of results) {
        if (r?.success) { any = true; addQueued(nameOf(String(r.upload_id)), String(r.upload_id)) }
      }
      const failed = reingestKey ? results.find((r: any) => r?.success === false) : undefined
      if (failed || !any) errMsg.value = failed?.error || data?.error || 'Could not ingest the selected uploads'
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
    clearDone,
    uploadFile,
    uploadFiles,
    canRetry,
    retryFile,
    listMyUploads,
    ingestExistingUploads,
    ingestText,
  }
}
