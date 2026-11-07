// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, useEvents } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { memoryElement } from './element.ts'
import { lazyControl } from './lazy'

const Root = lazyControl(
  () => import('./app/MemoryCreate.vue'),
  { loading: 'Loading the memory settings…', failed: 'Could not load the memory settings. Reload the page to try again.' },
  useEvents,
)

const MemoryCreateElement = memoryElement(
  { rootComponent: Root, plugins: [PrimeVuePlugin] },
  {
    type: 'object',
    properties: {
      config: { type: 'object', description: 'Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }' },
    },
  },
)

export async function webComponent() { return MemoryCreateElement }
define(import.meta.url, MemoryCreateElement)
