import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/KbDocument.vue'
import base from './styles.css?inline'
import extra from './document.css?inline'
import pkg from '../package.json'

const inlineCss = base + extra

// kx-kb-document — the kb10 document KB detail element. Knowledge mounts it by tag
// (the engine's manage_ui_id) for document KBs; it can also be the standalone kb10
// surface under the document profile. All three elements share one kb10 backend.
interface P { config?: { kb_id?: string; route?: string } }
interface E { 'kb-changed': { kb_id: string }; navigate: string }

class KbDocumentElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return KbDocumentElement }
define(import.meta.url, KbDocumentElement)
