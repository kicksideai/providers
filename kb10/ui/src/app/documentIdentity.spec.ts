import { describe, expect, it } from 'vitest'
import { canonicalSourceKey, contentDeletePayload } from './types'

describe('document deletion identity', () => {
  const metadata = { external_source: 'feed:a', external_id: 'doc' }
  const local = { id: 'one', metadata: { ...metadata, source_ref: { thread_id: 'local' } } }
  const incoming = { id: 'two', metadata: { ...metadata, source_ref: { thread_id: 'incoming', thread_event_seq: 3 } } }
  const legacy = { id: 'three', metadata }

  it('keeps different lineages separately addressable', () => {
    expect(new Set([local, incoming, legacy].map(canonicalSourceKey)).size).toBe(3)
    expect(contentDeletePayload(incoming)?.source_ref).toEqual({
      external_id: 'doc',
      document_identity: { ...metadata, lineage: 'incoming' },
    })
    expect(contentDeletePayload(legacy)?.source_ref.document_identity).toEqual(metadata)
  })

  it('uses the persisted key and keeps non-ASCII key bytes', () => {
    const node = { id: 'root', metadata: {
      external_source: ' feed:a\t',
      external_id: ' \u00a0doc\r\n',
      thread_id: 'recorded',
      source_ref: { thread_id: '', external_id: 'different' },
    } }
    expect(contentDeletePayload(node)?.source_ref.document_identity).toEqual({
      external_source: 'feed:a', external_id: '\u00a0doc', lineage: 'recorded',
    })
  })
})
