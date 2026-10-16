import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/Connect.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

interface P { providerId?: string; componentId?: string }
interface E {
  'connection-saved': { success: boolean; error?: string }
  'oauth-result': { success: boolean; error?: string }
}

class GitHubConnectElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return GitHubConnectElement }
define(import.meta.url, GitHubConnectElement)
