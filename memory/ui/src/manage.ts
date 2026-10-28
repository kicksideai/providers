// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import Root from './app/MemoryManage.vue'

const MemoryKbElement = memoryElement(Root, {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Memory page context: { kb_id: string, route?: string }' },
  },
})

export async function webComponent() { return MemoryKbElement }
define(import.meta.url, MemoryKbElement)
