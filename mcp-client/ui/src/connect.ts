import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ConnectProps, ConnectEvents } from './types'

import css from './styles.css?inline'
import pkg from '../package.json'



class E extends WippyVueElement<ConnectProps, ConnectEvents> {
  static get wippyConfig(): WippyElementConfig<ConnectProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'],
      inlineCss: css,
    }
  }
  static get vueConfig() { return lazyVueConfig(() => (() => import('./app/Connect.vue'))().then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading the MCP connection editor…', failed: 'Could not load the MCP connection editor. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}

export async function webComponent() { return E }
define(import.meta.url, E)
