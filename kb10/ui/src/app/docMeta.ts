import { type BrowseNode } from './types'

// Document-library presentation helpers: a short type badge, a content-type
// icon, and a relative timestamp — the cues that give the row its at-a-glance
// document identity.

const EXT_BADGE: Record<string, string> = {
  'text/markdown': 'MD',
  'text/plain': 'TXT',
  'text/html': 'HTML',
  'text/csv': 'CSV',
  'application/json': 'JSON',
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
}

export function docBadge(n: BrowseNode): string {
  const ct = n.content_type || ''
  if (EXT_BADGE[ct]) return EXT_BADGE[ct]
  const m = n.metadata || {}
  const name = String(m.filename || m.source_url || m.title || '')
  const dot = name.lastIndexOf('.')
  if (dot > 0 && dot < name.length - 1) {
    const ext = name.slice(dot + 1).split(/[?#]/)[0]
    if (ext.length <= 5) return ext.toUpperCase()
  }
  if (m.source_url) return 'URL'
  if (ct.startsWith('image/')) return 'IMG'
  return 'DOC'
}

export function docIcon(n: BrowseNode): string {
  const ct = n.content_type || ''
  const m = n.metadata || {}
  if (m.source_url) return 'tabler:world'
  if (ct === 'application/pdf') return 'tabler:file-type-pdf'
  if (ct === 'text/markdown') return 'tabler:markdown'
  if (ct === 'text/csv' || ct.includes('spreadsheet') || ct.includes('excel')) return 'tabler:table'
  if (ct === 'application/json') return 'tabler:json'
  if (ct.includes('word') || ct.includes('document')) return 'tabler:file-text'
  if (ct.includes('presentation') || ct.includes('powerpoint')) return 'tabler:presentation'
  if (ct === 'text/html') return 'tabler:file-code'
  if (ct.startsWith('image/')) return 'tabler:photo'
  return 'tabler:file-text'
}

export function relativeTime(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  const t = d.getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const sec = Math.round(diff / 1000)
  if (sec < 45) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fullDate(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function chunkCount(n: BrowseNode): number | null {
  const m = n.metadata || {}
  if (typeof m.chunk_count === 'number') return m.chunk_count
  return null
}
