// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { memoryElement } from './element.ts'
import { lazyControl } from './lazy'
import pkg from '../package.json'

const Root = lazyControl(
  () => import('./app/MemorySettings.vue'),
  { loading: 'Loading the memory settings…', failed: 'Could not load the memory settings. Reload the page to try again.' },
  useEvents,
)

const KicksideMemorySettingsElement = memoryElement(
  { rootComponent: Root, plugins: [PrimeVuePlugin] },
  pkg.wippy.props as WippyPropsSchema,
)

export async function webComponent() {
  return KicksideMemorySettingsElement
}

define(import.meta.url, KicksideMemorySettingsElement)
