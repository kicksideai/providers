import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/MemoryCreate.vue'
import stylesText from './memory.css?inline'

// kickside-memory-create: the memory engine's pane of the knowledge base
// create/edit dialog. Emits { embedding_model, config } on mount and on edit.
interface P { config?: Record<string, unknown> | string | null }
interface E { 'config-changed': { embedding_model: string; config: Record<string, unknown> } }

const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Create context: { kb_type, id?, embedding_model?, config? (with config_schema), edit? }' },
  },
}

class MemoryCreateElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return MemoryCreateElement }
define(import.meta.url, MemoryCreateElement)
