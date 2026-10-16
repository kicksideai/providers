import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { PickerProps, PickerEvents } from './types'
import Root from './app/Picker.vue'
import css from './styles.css?inline'
import pkg from '../package.json'

class E extends WippyVueElement<PickerProps, PickerEvents> {
  static get wippyConfig(): WippyElementConfig<PickerProps> {
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
