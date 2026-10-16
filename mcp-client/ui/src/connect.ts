import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ConnectProps, ConnectEvents } from './types'
import Root from './app/Connect.vue'
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
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return E }
define(import.meta.url, E)
