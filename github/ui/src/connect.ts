import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

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
  static get vueConfig() { return lazyVueConfig(() => (() => import('./app/Connect.vue'))().then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading GitHub connection…', failed: 'Could not load the GitHub connection form. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}

export async function webComponent() { return GitHubConnectElement }
define(import.meta.url, GitHubConnectElement)
