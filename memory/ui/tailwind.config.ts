// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import themePreset from '@wippy-fe/theme/tailwind.config'

// Shadow-root PrimeVue styles use the theme preset and local Tailwind preflight.
export default {
  presets: [themePreset],
  content: ['./src/**/*.{vue,ts}'],
}
