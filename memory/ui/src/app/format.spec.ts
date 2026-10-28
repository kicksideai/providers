// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it } from 'vitest'
import { relativeTime, topicLabel } from './format'

describe('memory formatting', () => {
  it('reads a topic key as words', () => {
    expect(topicLabel('home_city')).toBe('Home city')
    expect(topicLabel('response-style')).toBe('Response style')
  })

  it('states times relative to now, in the largest whole unit', () => {
    const now = Date.parse('2026-10-22T12:00:00Z')
    expect(relativeTime('2026-10-22T11:59:30Z', now)).toBe('just now')
    expect(relativeTime('2026-10-22T09:00:00Z', now)).toBe('3 hours ago')
    expect(relativeTime('2026-10-20T12:00:00Z', now)).toBe('2 days ago')
  })

  it('reads database timestamps without a T separator as UTC', () => {
    const now = Date.parse('2026-10-22T12:00:00Z')
    expect(relativeTime('2026-10-22 10:00:00', now)).toBe('2 hours ago')
  })

  it('gives no text for a missing or unreadable time', () => {
    expect(relativeTime(null)).toBe('')
    expect(relativeTime('not a time')).toBe('')
  })
})
