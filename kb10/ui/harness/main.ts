import { createApp, ref, h } from 'vue'
import KbCreateConfig from '../src/app/KbCreateConfig.vue'
import styles from '../src/styles.css?inline'
import schemas from './schemas.json'
import { HARNESS_PROPS } from './stub-host'
import './pickers'

// Renders the create-config element at the widths the knowledge dialog's config
// pane actually has. .kx-dialog is width min(880px, 100vw - 40px) with a 360px
// left pane and 18px body padding on the right pane, so the pane content is
// 880 - 360 - 36 = 484px at the dialog's full size. Under the dialog's 720px
// media query the panes stack and the content is (100vw - 40) - 36 wide; 304px
// is that at a 380px-wide viewport.
const WIDTHS = [
  { id: 'typical', label: 'Typical — 484px (880px dialog, two panes)', px: 484 },
  { id: 'narrow', label: 'Narrow — 304px (380px viewport, stacked panes)', px: 304 },
]

const SCENARIOS = [
  {
    id: 'wiki-edit',
    label: 'wiki KB, edit mode',
    props: {
      config: {
        kb_type: 'wiki',
        id: 'kb_wiki_1',
        edit: true,
        embedding_model: 'text-embedding-3-small',
        config: {
          config_schema: (schemas as any).wiki,
          depth: 3,
          summary_model: 'class:fast',
          chunk_enrichment_model: 'class:fast',
          summary_prompt: '',
          summary_max_chars: 2400,
          embed_images: true,
          image_caption_model: 'class:fast',
          retrieval_model: 'class:nano',
          query_driver: 'agentic',
          max_retrieval_iterations: 3,
        },
      },
    },
  },
  {
    id: 'document-edit',
    label: 'document KB, edit mode',
    props: {
      config: {
        kb_type: 'document',
        id: 'kb_doc_1',
        edit: true,
        embedding_model: 'text-embedding-3-small',
        config: {
          config_schema: (schemas as any).document,
          summary_model: 'class:fast',
          chunk_enrichment_model: 'class:fast',
          summary_prompt: '',
          summary_max_chars: 2400,
          retrieval_model: 'class:nano',
          query_driver: 'built-in',
        },
      },
    },
  },
]

const style = document.createElement('style')
style.textContent = styles.replace(/:host/g, '.kb-host')
document.head.appendChild(style)

const board = document.getElementById('board')!
const want = new URLSearchParams(location.search)
const wantWidth = want.get('w')
const wantScenario = want.get('s')

for (const scenario of SCENARIOS) {
  if (wantScenario && wantScenario !== scenario.id) continue
  for (const width of WIDTHS) {
    if (wantWidth && wantWidth !== width.id) continue
    const cell = document.createElement('div')
    cell.className = 'cell'
    cell.innerHTML = `<div class="cap">${scenario.label} · ${width.label}</div>`
    const pane = document.createElement('div')
    pane.className = 'pane kb-host'
    pane.style.width = `${width.px}px`
    pane.id = `${scenario.id}-${width.id}`
    cell.appendChild(pane)
    board.appendChild(cell)

    const props = ref(scenario.props)
    const app = createApp({ render: () => h(KbCreateConfig) })
    app.provide(HARNESS_PROPS, props)
    app.config.compilerOptions = { isCustomElement: (t: string) => t.startsWith('wc-') }
    app.mount(pane)
  }
}
