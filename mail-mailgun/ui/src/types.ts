// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// The Mail delivery settings block's driver panel contract (see the Mail administration README).
export type Values = { [key: string]: string | null }
export interface PanelProps {
  values?: Values | null
  secrets?: { [key: string]: boolean } | null
  errors?: { [key: string]: string } | null
  disabled?: boolean
}
export interface PanelEvents {
  change: { values: Values }
  validity: { valid: boolean }
}
