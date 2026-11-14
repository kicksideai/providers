import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from './lazy'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

const Root = lazyControl(
  () => import('./app/Connect.vue'),
  { loading: 'Loading GitHub connection…', failed: 'Could not load the GitHub connection form. Reload the page to try again.' },
  useEvents,
)

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
