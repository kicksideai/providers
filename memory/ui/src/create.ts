// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { memoryElement } from './element.ts'




const MemoryCreateElement = memoryElement(
  lazyVueConfig(() => (() => import('./app/MemoryCreate.vue'))().then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading the memory settings…', failed: 'Could not load the memory settings. Reload the page to try again.', delay: 200, timeout: 30000 }),
  {
    type: 'object',
    properties: {
      config: { type: 'object', description: 'Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }' },
    },
  },
)

export async function webComponent() { return MemoryCreateElement }
define(import.meta.url, MemoryCreateElement)
