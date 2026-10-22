import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/MemoryManage.vue'
import stylesText from './memory.css?inline'

// kickside-memory-kb: the memory knowledge base page the knowledge surface
// mounts for kb_type memory.
interface P { config?: { kb_id?: string; route?: string } | string | null }
type E = Record<string, never>

const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Memory page context: { kb_id: string, route?: string }' },
  },
}

class MemoryKbElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return { propsSchema, hostCssKeys: ['themeConfigUrl'] as const, inlineCss: stylesText }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return MemoryKbElement }
define(import.meta.url, MemoryKbElement)
