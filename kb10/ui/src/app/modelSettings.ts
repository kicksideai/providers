// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
export const DEFAULT_KB_MODEL = 'class:fast'

export function resolveModel(value: unknown, defaultModel = DEFAULT_KB_MODEL): string {
  if (value == null || value === '') return defaultModel
  return typeof value === 'string' && value.trim() ? value : ''
}
