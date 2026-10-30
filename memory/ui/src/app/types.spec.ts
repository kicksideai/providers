// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { parseConfig } from './types'

describe('memory input contracts', () => {
  it('rejects malformed configuration while accepting an omitted configuration', () => {
    expect(parseConfig(undefined)).toEqual({})
    expect(parseConfig({ memory_id: 'selected' })).toEqual({ memory_id: 'selected' })
    for (const input of ['{', '[]', 'null', [], false]) expect(() => parseConfig(input)).toThrow()
  })
})
