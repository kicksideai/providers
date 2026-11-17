import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { PickerProps, PickerEvents } from './types'
import { lazyControl } from './lazy'
import css from './styles.css?inline'
import pkg from '../package.json'

const Root = lazyControl(
  () => import('./app/Picker.vue'),
  { loading: 'Loading the MCP tool picker…', failed: 'Could not load the MCP tool picker. Reload the page to try again.' },
  useEvents,
)

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
