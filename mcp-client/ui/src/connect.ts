import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ConnectProps, ConnectEvents } from './types'
import { lazyControl } from './lazy'
import css from './styles.css?inline'
import pkg from '../package.json'

const Root = lazyControl(
  () => import('./app/Connect.vue'),
  { loading: 'Loading the MCP connection editor…', failed: 'Could not load the MCP connection editor. Reload the page to try again.' },
  useEvents,
)

class E extends WippyVueElement<ConnectProps, ConnectEvents> {
  static get wippyConfig(): WippyElementConfig<ConnectProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'],
      inlineCss: css,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return E }
define(import.meta.url, E)
