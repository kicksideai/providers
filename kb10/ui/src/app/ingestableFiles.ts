const DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'docx',
  'doc',
  'pptx',
  'ppt',
  'xlsx',
  'xls',
  'rtf',
  'odt',
  'ods',
  'odp',
  'epub',
])

const TEXT_EXTENSIONS = new Set([
  'txt',
  'md',
  'markdown',
  'html',
  'htm',
  'css',
  'js',
  'json',
  'xml',
  'py',
  'lua',
  'rb',
  'php',
  'java',
  'c',
  'cpp',
  'cs',
  'go',
  'sh',
  'bat',
  'ps1',
  'yml',
  'yaml',
  'toml',
  'sql',
  'csv',
  'tsv',
])

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/epub+zip',
])

const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/javascript',
  'application/xml',
])

const ACCEPT_EXTENSIONS = [
  ...Array.from(DOCUMENT_EXTENSIONS),
  ...Array.from(TEXT_EXTENSIONS),
].map((ext) => `.${ext}`)

export const KNOWLEDGE_UPLOAD_ACCEPT = [
  ...ACCEPT_EXTENSIONS,
  'text/*',
  ...Array.from(TEXT_MIME_TYPES),
  ...Array.from(DOCUMENT_MIME_TYPES),
].join(',')

export const KNOWLEDGE_UPLOAD_REJECT_MESSAGE =
  'This file type is not supported for knowledge ingestion. Use text, Markdown, CSV, JSON, HTML, PDF, or Office documents.'

function extensionOf(name: string): string {
  const last = String(name || '').toLowerCase().split('/').pop() || ''
  const dot = last.lastIndexOf('.')
  return dot >= 0 ? last.slice(dot + 1) : ''
}

export function isKnowledgeIngestableFile(file: File): boolean {
  const type = String(file.type || '').toLowerCase()
  if (type.startsWith('text/')) return true
  if (DOCUMENT_MIME_TYPES.has(type) || TEXT_MIME_TYPES.has(type)) return true

  const ext = extensionOf(file.name)
  return DOCUMENT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(ext)
}
