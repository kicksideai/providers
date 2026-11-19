// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

export function formatIndexingNotice(pending: unknown): string {
  if (typeof pending !== 'object' || !pending) return ''
  const { count, truncated } = pending as { count?: unknown; truncated?: unknown }
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count <= 0) return ''
  const capped = count > 100 || truncated === true
  const waiting = `${Math.min(count, 100)}${capped ? '+' : ''}`
  return `Indexing — ${waiting} ${count === 1 && !capped ? 'change' : 'changes'} waiting`
}
