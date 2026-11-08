import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig } from '@wippy-fe/webcomponent-vue'
import Root from './app/JiraPicker.vue'
import stylesText from './styles.css?inline'

// kickside-atlassian-jira-picker — the agent editor mounts this as the Jira
// traits' meta.web_component to bind a connection (and optional project) into the
// trait context.
interface P { config?: { connection_id?: string; project_key?: string } | null }
interface E { 'config-changed': { connection_id?: string; project_key?: string } }

class JiraPickerElement extends WippyVueElement<P, E> {
  static get wippyConfig(): WippyElementConfig<P> {
    return {
      propsSchema: { type: 'object', properties: { config: { type: 'object' } } },
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: Root } }
}

export async function webComponent() { return JiraPickerElement }
define(import.meta.url, JiraPickerElement)
