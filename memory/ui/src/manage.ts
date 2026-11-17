// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define, useEvents } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import { lazyPage } from './lazy'

const MemoryKbElement = memoryElement(
  {
    lazyConfig: lazyPage(
      () => import('./lazy-mount').then((module) => module.mountConfig),
      'Could not load the memory knowledge base. Reload the page to try again.',
      useEvents,
    ),
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
