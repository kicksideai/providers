// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { MemoryItem, MemoryKind } from './types'

// How each kind reads on the page: its label, icon and the rail section it
// belongs to. Kind is presentation only; identity is the topic key.
export type KindGroup = 'instructions' | 'knowhow' | 'plans' | 'people'

export const KIND_META: Record<MemoryKind, { label: string; icon: string; group: KindGroup }> = {
  identity: { label: 'Identity', icon: 'tabler:id-badge-2', group: 'instructions' },
  rule: { label: 'Rule', icon: 'tabler:list-check', group: 'instructions' },
  skill: { label: 'Skill', icon: 'tabler:tool', group: 'knowhow' },
  lesson: { label: 'Lesson', icon: 'tabler:bulb', group: 'knowhow' },
  plan: { label: 'Plan', icon: 'tabler:route', group: 'plans' },
  profile_slot: { label: 'Profile', icon: 'tabler:user', group: 'people' },
  preference: { label: 'Preference', icon: 'tabler:heart', group: 'people' },
  fact: { label: 'Fact', icon: 'tabler:note', group: 'people' },
}

export const GROUPS: { id: KindGroup; title: string; icon: string }[] = [
  { id: 'instructions', title: 'Agent instructions', icon: 'tabler:robot' },
  { id: 'knowhow', title: 'Skills and lessons', icon: 'tabler:school' },
  { id: 'plans', title: 'Ongoing plans', icon: 'tabler:route' },
  { id: 'people', title: 'About people', icon: 'tabler:users' },
]

// "home_city" reads as "Home city".
export function topicLabel(key: string): string {
  const words = key.replace(/[_\-.]+/g, ' ').trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key
}

export function aboutLabel(item: Pick<MemoryItem, 'scope_family'>): string {
  return item.scope_family === 'agent' ? 'The agent' : 'A person it talked with'
}

const SOURCE_LABEL: Record<MemoryItem['source'], string> = {
  capture: 'learned in conversation',
  tool: 'saved by the agent',
  reflection: 'from consolidation',
  owner: 'added by a person',
}

export function sourceLabel(source: MemoryItem['source']): string {
  return SOURCE_LABEL[source] || source
}

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
