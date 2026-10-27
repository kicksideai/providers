// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { pageOf, parseConfig } from './types'

describe('memory input contracts', () => {
  it('rejects malformed pages instead of returning an empty result', () => {
    for (const input of [null, {}, { items: {} }, { items: [], next_offset: '2' }, { items: [], next_offset: -1 }]) {
      expect(() => pageOf(input, 'items')).toThrow()
    }
    expect(pageOf({ items: [] }, 'items')).toEqual({ rows: [], next: null })
  })

  it('rejects malformed configuration while accepting an omitted configuration', () => {
    expect(parseConfig(undefined)).toEqual({})
    expect(parseConfig({ memory_id: 'selected' })).toEqual({ memory_id: 'selected' })
    for (const input of ['{', '[]', 'null', [], false]) expect(() => parseConfig(input)).toThrow()
  })
})
