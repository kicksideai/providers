// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// A memory stores only the settings someone set; the engine defaults fill in
// the rest when the memory runs, so a changed default reaches every memory
// that never overrode it.

export function shownConfig(defaults: Record<string, unknown>, stored: Record<string, unknown>): Record<string, unknown> {
  return { ...defaults, ...stored }
}

export function savedConfig(stored: Record<string, unknown>, edits: Record<string, unknown>): Record<string, unknown> {
  return { ...stored, ...edits }
}
