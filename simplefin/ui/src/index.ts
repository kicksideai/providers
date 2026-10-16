import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, ConnectionSaved } from './types.ts'
import ConnectView from './app/Connect.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideSimplefinConnectElement extends WippyVueElement<ComponentProps, { 'connection-saved': ConnectionSaved }> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ConnectView }
  }
}

export async function webComponent() {
  return KicksideSimplefinConnectElement
}

define(import.meta.url, KicksideSimplefinConnectElement)
