import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps, ConnectionSaved } from './types.ts'

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
    return lazyVueConfig(() => (() => import('./app/Connect.vue'))().then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading SimpleFIN connection…', failed: 'Could not load the SimpleFIN connection form. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideSimplefinConnectElement
}

define(import.meta.url, KicksideSimplefinConnectElement)
