import { describe, expect, it } from 'vitest'
import { contentDeletePayload } from './types'

describe('document deletion identity', () => {
  it('carries each root UUID and leaves delete versions to Knowledge', () => {
    const sourceRef = { external_id: 'doc', thread_id: 'origin', thread_event_seq: 3, external_version: 'v1' }
    const metadata = { external_source: 'feed:a', external_id: 'doc', external_version: 'v1', source_ref: sourceRef }
    const local = contentDeletePayload({ id: 'one', metadata })
    const incoming = contentDeletePayload({ id: 'two', metadata })
    expect(local?.metadata.node_id).toBe('one')
    expect(incoming?.metadata.node_id).toBe('two')
    expect(incoming?.external_version).toBeUndefined()
    expect(incoming?.source_ref).toEqual({ external_id: 'doc' })
  })

  it('uses the bound external ID as supplied by the server', () => {
    const node = { id: 'root', external_id: '\u00a0doc', metadata: { external_id: 'old' } }
    expect(contentDeletePayload(node)?.external_id).toBe('\u00a0doc')
  })

  it('queues an unbound document with its UUID as the event external ID', () => {
    expect(contentDeletePayload({ id: 'root' })).toMatchObject({
      external_id: 'root', metadata: { node_id: 'root' },
    })
  })
})
