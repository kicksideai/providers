// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import Root from './app/MemoryCreate.vue'

// kickside-memory-create: the memory engine's pane of the knowledge base
// create/edit dialog. Emits { embedding_model, config } on mount and on edit.
const MemoryCreateElement = memoryElement(Root, {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }' },
  },
})

export async function webComponent() { return MemoryCreateElement }
define(import.meta.url, MemoryCreateElement)
