import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, MemoryEvents } from './types.ts'
import KnowledgeMemory from './app/knowledge-memory.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

// The Knowledge Base Memory trait config component (kickside-knowledge-memory).
// The trait config host passes the activation context + checkpoint policy as the
// `config` prop and folds edits back through the `config-changed` event.
class KicksideKnowledgeMemoryElement extends WippyVueElement<ComponentProps, MemoryEvents> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
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
