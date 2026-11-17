// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'


const MemoryKbElement = memoryElement(
  {
    ...lazyVueConfig(() => import('./lazy-mount').then((module) => module.mountConfig), { surface: 'page', loading: 'Loading…', failed: 'Could not load the memory knowledge base. Reload the page to try again.', timeout: 30000 }),
  },
  {
    type: 'object',
    properties: {
      config: { type: 'object', description: 'Memory page context: { kb_id: string, route?: string }' },
    },
  },
)

export async function webComponent() { return MemoryKbElement }
define(import.meta.url, MemoryKbElement)
