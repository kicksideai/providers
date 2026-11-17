// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { memoryElement } from './element.ts'

import pkg from '../package.json'



const KicksideMemorySettingsElement = memoryElement(
  lazyVueConfig(() => (() => import('./app/MemorySettings.vue'))().then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading the memory settings…', failed: 'Could not load the memory settings. Reload the page to try again.', delay: 200, timeout: 30000 }),
  pkg.wippy.props as WippyPropsSchema,
)

export async function webComponent() {
  return KicksideMemorySettingsElement
}

define(import.meta.url, KicksideMemorySettingsElement)
