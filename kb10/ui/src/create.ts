import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './styles.css?inline'



// kx-kb-create — the kb10 configuration element. The knowledge create/edit
// dialog mounts it by tag (the engine's create_ui_id) in its right pane and owns
// all kb10 type-specific config: embedding model, contextual embedding (document
// summary + per-chunk enrichment, with the summary settings those models read),
// and engine config fields (e.g. wiki link depth). It signals the dialog via the
// `config-changed` event with the full { embedding_model, config } payload on
// mount and on every edit. Over an existing knowledge base (`edit` with its
// `id`) it also carries kb10's maintenance actions.
interface CreateConfig {
  kb_type?: string
  id?: string
  embedding_model?: string
  config?: Record<string, unknown>
  edit?: boolean
}
interface P { config?: CreateConfig | null }
interface E { 'config-changed': { embedding_model: string; config: Record<string, unknown> } }

// The create element accepts a richer config object than the detail elements; a
// permissive object schema lets the host pass the full context as JSON.
const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Configuration context: { kb_type, id?, embedding_model?, config?, edit? }' },
  },
}

class KbCreateElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return lazyVueConfig(() => (() => import('./app/KbCreateConfig.vue'))().then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading the knowledge base settings…', failed: 'Could not load the knowledge base settings. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}

export async function webComponent() { return KbCreateElement }
define(import.meta.url, KbCreateElement)
