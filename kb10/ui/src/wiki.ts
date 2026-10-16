import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/KbWiki.vue'
import base from './styles.css?inline'
import extra from './wiki.css?inline'
import graphExtra from './graph.css?inline'
import pkg from '../package.json'

// kx-kb-wiki — the kb10 concept-graph KB detail element. Knowledge mounts it by
// tag (the engine's manage_ui_id) for wiki KBs; it can also be the standalone kb10
// surface under the wiki profile. It hosts both the wiki reader and the graph
// canvas behind a view switch, so it carries both stylesheets.
interface P { config?: { kb_id?: string; route?: string; view?: 'wiki' | 'graph' } }
interface E { 'kb-changed': { kb_id: string }; navigate: string }

class KbWikiElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: base + extra + graphExtra,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return KbWikiElement }
define(import.meta.url, KbWikiElement)
