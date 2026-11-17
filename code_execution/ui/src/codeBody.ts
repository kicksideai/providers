import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from './lazy'
import stylesText from './styles.css?inline'
import type { CodeBodyProps, CodeBodyEvents } from './codeExecutionTypes.ts'

const CodeBody = lazyControl(
  () => import('./app/CodeBody.vue'),
  { loading: 'Loading the code editor…', failed: 'Could not load the code editor. Reload the page to try again.' },
  useEvents,
)

// The Run Code Block authoring view (kickside-code-body): the rich editor the Workflow
// builder mounts through the Block declaration. It edits the complete canonical
// { code, tool_ids?, method? } config and reports user changes through `config-changed`.
// Mounted by tag through the shared WcMount bridge.
const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Run Code Block config: { code, tool_ids?, method? }.' },
  },
}

class KicksideCodeBodyElement extends WippyVueElement<CodeBodyProps, CodeBodyEvents> {
  static get wippyConfig(): WippyElementConfig<CodeBodyProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: CodeBody }
  }
}

export async function webComponent() {
  return KicksideCodeBodyElement
}

define(import.meta.url, KicksideCodeBodyElement)
