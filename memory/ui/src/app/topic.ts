// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// Topic keys name what a memory is about ("response_style"), never its text, so
// a forgotten memory leaves nothing of its content behind in its key.

export function canonicalTopicKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function isCanonicalTopicKey(value: string): boolean {
  return /^[a-z][a-z0-9_]{0,63}$/.test(value)
}
