// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from './lazy'
import stylesText from './styles.css?inline'
import pkg from '../package.json'
import type { PanelEvents, PanelProps } from './types'

const Root = lazyControl(
  () => import('./app/MailgunSettings.vue'),
  { loading: 'Loading Mailgun settings…', failed: 'Could not load the Mailgun settings. Reload the page to try again.' },
  useEvents,
)

class MailgunSettingsElement extends WippyVueElement<PanelProps, PanelEvents> {
  static get wippyConfig(): WippyElementConfig<PanelProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() {
    return { rootComponent: Root, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return MailgunSettingsElement
}
define(import.meta.url, MailgunSettingsElement)
