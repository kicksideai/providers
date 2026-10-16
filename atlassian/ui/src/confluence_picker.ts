import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import Root from './app/ConfluencePicker.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

// kickside-atlassian-confluence-picker — the agent editor mounts this as the
// Confluence traits' meta.web_component to bind a connection (and optional space)
// into the trait context.
interface P { config?: { connection_id?: string; space_key?: string } | null }
interface E { 'config-changed': { connection_id?: string; space_key?: string } }

class ConfluencePickerElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return ConfluencePickerElement }
define(import.meta.url, ConfluencePickerElement)
