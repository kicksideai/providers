// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { define } from '@wippy-fe/webcomponent-vue'
import type { WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { memoryElement } from './element.ts'
import KnowledgeMemory from './app/knowledge-memory.vue'
import pkg from '../package.json'

// kickside-memory-kb-agent: explicit typed Memory settings in the agent editor.
// The editor passes the trait context as `config` and takes edits back through
// `config-changed`.
const KicksideKnowledgeMemoryElement = memoryElement(KnowledgeMemory, pkg.wippy.props as WippyPropsSchema)

export async function webComponent() {
  return KicksideKnowledgeMemoryElement
}

define(import.meta.url, KicksideKnowledgeMemoryElement)
