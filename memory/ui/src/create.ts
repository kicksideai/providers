// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import Root from './app/MemoryCreate.vue'

const MemoryCreateElement = memoryElement(Root, {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }' },
  },
})

export async function webComponent() { return MemoryCreateElement }
define(import.meta.url, MemoryCreateElement)
