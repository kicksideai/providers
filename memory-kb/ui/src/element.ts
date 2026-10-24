// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { Component } from 'vue'
import stylesText from './styles.css?inline'

// The three memory elements share one stylesheet and the theme's PrimeVue CSS;
// each has its own root component and `config` prop schema.
export function memoryElement(root: Component, propsSchema: WippyPropsSchema) {
  return class extends WippyVueElement {
    static get wippyConfig(): WippyElementConfig {
      return { propsSchema, hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const, inlineCss: stylesText }
    }

    static get vueConfig() {
      return { rootComponent: root, plugins: [PrimeVuePlugin] }
    }
  }
}
