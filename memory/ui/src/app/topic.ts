// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { MemoryKind } from './types'

export type OwnerMemoryKind = Extract<MemoryKind, 'identity' | 'rule' | 'skill' | 'lesson'>

const TOPICS: Record<OwnerMemoryKind, readonly string[]> = {
  identity: ['agent_identity', 'role', 'name'],
  rule: ['response_style', 'format', 'language', 'safety'],
  skill: ['capability', 'workflow', 'tool_use'],
  lesson: ['operating_principle', 'domain_guidance', 'quality_standard'],
}

export function topicSuggestions(kind: OwnerMemoryKind): readonly string[] {
  return TOPICS[kind]
}

export function defaultTopic(kind: OwnerMemoryKind): string {
  return topicSuggestions(kind)[0]
}

export function canonicalTopicKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function isCanonicalTopicKey(value: string): boolean {
  return /^[a-z][a-z0-9_]{0,63}$/.test(value)
}
