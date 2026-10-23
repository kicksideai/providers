// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, MemoryEvents } from './legacy-types.ts'
import KnowledgeMemory from './app/legacy-memory.vue'
import stylesText from './legacy-memory.css?inline'
const propsSchema = { type: 'object', properties: { config: { type: 'object', description: 'Existing KB memory context and checkpoint policy.' } } }

// The Knowledge Base Memory trait config component (kickside-knowledge-memory).
// The trait config host passes the activation context + checkpoint policy as the
// `config` prop and folds edits back through the `config-changed` event.
class KicksideKnowledgeMemoryElement extends WippyVueElement<ComponentProps, MemoryEvents> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: KnowledgeMemory }
  }
}

export async function webComponent() {
  return KicksideKnowledgeMemoryElement
}

define(import.meta.url, KicksideKnowledgeMemoryElement)
