import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/Connect.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

// kickside-atlassian-connect — the Connections picker mounts this (the provider's
// component.create.view) to set up an Atlassian connection: OAuth (3LO) or a stored
// credential (Cloud API token / Server PAT). It signals completion to the host
// with a connection-saved / oauth-result DOM event.
interface P { providerId?: string; componentId?: string }
interface E {
  'connection-saved': { success: boolean; error?: string }
  'oauth-result': { success: boolean; error?: string }
}

class AtlassianConnectElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return AtlassianConnectElement }
define(import.meta.url, AtlassianConnectElement)
