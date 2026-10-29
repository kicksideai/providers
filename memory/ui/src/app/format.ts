// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { MemoryItem, MemoryKind, MemoryRun, MemoryStatus } from './types'

export type KindGroup = 'instructions' | 'knowhow' | 'plans' | 'people'

export const KIND_META: Record<MemoryKind, { label: string; icon: string; group: KindGroup; tone?: string }> = {
  identity: { label: 'Identity', icon: 'tabler:id-badge-2', group: 'instructions' },
  rule: { label: 'Rule', icon: 'tabler:list-check', group: 'instructions' },
  skill: { label: 'Skill', icon: 'tabler:tool', group: 'knowhow', tone: 'kx-tone-violet' },
  lesson: { label: 'Lesson', icon: 'tabler:bulb', group: 'knowhow', tone: 'kx-tone-violet' },
  plan: { label: 'Plan', icon: 'tabler:route', group: 'plans', tone: 'kx-tone-amber' },
  profile_slot: { label: 'Profile', icon: 'tabler:user', group: 'people', tone: 'kx-tone-blue' },
  preference: { label: 'Preference', icon: 'tabler:heart', group: 'people', tone: 'kx-tone-blue' },
  fact: { label: 'Fact', icon: 'tabler:note', group: 'people', tone: 'kx-tone-blue' },
}

export const GROUPS: { id: KindGroup; title: string; icon: string; tone?: string }[] = [
  { id: 'instructions', title: 'Agent instructions', icon: 'tabler:robot' },
  { id: 'knowhow', title: 'Skills and lessons', icon: 'tabler:school', tone: 'kx-tone-violet' },
  { id: 'plans', title: 'Ongoing plans', icon: 'tabler:route', tone: 'kx-tone-amber' },
  { id: 'people', title: 'About people', icon: 'tabler:users', tone: 'kx-tone-blue' },
]

export function topicLabel(key: string): string {
  const words = key.replace(/[_\-.]+/g, ' ').trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key
}

const SOURCE_LABEL: Record<MemoryItem['source'], string> = {
  capture: 'learned in conversation',
  reflection: 'from consolidation',
  owner: 'added by a person',
}

export function sourceLabel(source: MemoryItem['source']): string {
  return SOURCE_LABEL[source]
}

export const STATUS_LABEL: Record<MemoryStatus | MemoryRun['status'], string> = {
  current: 'Current', superseded: 'Earlier', conflict: 'Conflict', archived: 'Archived', forgotten: 'Forgotten',
  scheduled: 'Scheduled', running: 'Running', succeeded: 'Completed', failed: 'Failed', rejected: 'Rejected',
}

const STATUS_SEVERITY: Partial<Record<MemoryStatus | MemoryRun['status'], string>> = { current: 'success', conflict: 'warn', failed: 'danger', archived: 'secondary' }
export function severity(status: MemoryStatus | MemoryRun['status']): string { return STATUS_SEVERITY[status] ?? 'secondary' }

function parseTime(value?: string | null): number {
  if (!value) return NaN
  return Date.parse(value.includes('T') ? value : value.replace(' ', 'T') + 'Z')
}

export function fullTime(value?: string | null): string {
  const t = parseTime(value)
  return Number.isFinite(t) ? new Date(t).toLocaleString() : ''
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60],
]

export function relativeTime(value?: string | null, now = Date.now()): string {
  const t = parseTime(value)
  if (!Number.isFinite(t)) return ''
  const seconds = Math.round((t - now) / 1000)
  const fmt = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return fmt.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
