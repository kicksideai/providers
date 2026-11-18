// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn(async () => {}), api: {} }))

const host = vi.hoisted(() => ({ props: null as unknown, emit: vi.fn() }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => host.props,
  useEvents: () => host.emit,
}))

vi.mock('./useMaintenance', async () => {
  const { computed, ref: vueRef } = await import('vue')
  return {
    useMaintenance: () => ({
      runs: vueRef({}),
      statusError: vueRef(''),
      running: () => false,
      anyBusy: computed(() => false),
      start: vi.fn(),
      statusLine: () => ({ text: '', tone: '' }),
    }),
  }
})

const { default: KbCreateConfig } = await import('./KbCreateConfig.vue')

const schema = {
  properties: {
    analysis_model: { type: ['string', 'boolean'], default: 'class:fast', label: 'Query analysis model' },
    extra_prompt: { type: 'string', default: '', label: 'Retrieval instructions', format: 'textarea' },
    enable_reranking: { type: 'boolean', default: false, label: 'Rerank results' },
    query_strategy: { type: 'string', default: 'plain', label: 'Hypothetical answer retrieval' },
    self_tuning: { type: 'boolean', default: false, label: 'Autonomous retrieval tuning' },
    self_tuning_query_interval: { type: 'integer', default: 25, label: 'Tuning interval' },
    summary_prompt: { type: 'string', label: 'Summary instructions', format: 'textarea' },
    summary_max_chars: { type: 'integer', label: 'Summary length', minimum: 0, maximum: 8000, default: 2400 },
    max_document_content_chars: { type: 'integer', label: 'Document size limit', minimum: 0 },
  },
}

function render(config: Record<string, unknown>) {
  host.props = ref({ config })
  return mount(KbCreateConfig, {
    global: { stubs: { Icon: true }, config: { compilerOptions: { isCustomElement: (tag: string) => tag.startsWith('wc-') } } },
  })
}

function lastPublished(): Record<string, unknown> {
  const calls = host.emit.mock.calls.filter(([name]) => name === 'config-changed')
  return (calls[calls.length - 1][1] as { config: Record<string, unknown> }).config
}

describe('KbCreateConfig engine fields', () => {
  beforeEach(() => host.emit.mockReset())

  it('renders each schema key once: owned keys by their dedicated control, the rest as engine fields', async () => {
    const wrapper = render({ kb_type: 'document', config: { config_schema: schema } })
    await flushPromises()
    const labels = wrapper.findAll('.cx-label').map(l => l.text())

    expect(labels.filter(l => l === 'Document size limit')).toHaveLength(1)
    expect(labels.filter(l => l === 'Rerank results')).toHaveLength(1)
    expect(labels.filter(l => l === 'Hypothetical answer retrieval')).toHaveLength(1)
    expect(labels.filter(l => l === 'Search analysis model')).toHaveLength(1)
    expect(labels).not.toContain('Query analysis model')
    expect(labels).not.toContain('Retrieval instructions')
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('publishes reranking off when the toggle is switched off on a knowledge base that had it on', async () => {
    const wrapper = render({
      kb_type: 'document',
      edit: true,
      id: 'kb-1',
      embedding_model: 'class:embed',
      config: { config_schema: schema, analysis_model: 'class:fast', enable_reranking: true },
    })
    await flushPromises()
    expect(lastPublished()).toEqual({})

    const toggle = wrapper.get('[aria-label="Rerank results"]')
    await toggle.trigger('click')
    await flushPromises()
    expect(lastPublished()).toEqual({ enable_reranking: false })
    wrapper.unmount()
  })

  it('publishes disabled models instead of omitting them when contextual embedding is switched off', async () => {
    const wrapper = render({
      kb_type: 'document',
      edit: true,
      id: 'kb-1',
      config: { summary_model: 'summary-model', chunk_enrichment_model: 'chunk-model' },
    })
    const toggle = wrapper.get('[aria-label="Contextual embedding"]')
    expect(toggle.attributes('aria-checked')).toBe('true')

    await toggle.trigger('click')
    expect(lastPublished()).toEqual({ summary_model: false, chunk_enrichment_model: false })

    await toggle.trigger('click')
    expect(lastPublished()).toEqual({})
    wrapper.unmount()
  })

  it.each([
    { chunk: '', analysis: '', expectedChunk: 'class:fast', expectedAnalysis: '' },
    { chunk: false, analysis: false, expectedChunk: '', expectedAnalysis: '' },
    { chunk: undefined, analysis: undefined, expectedChunk: 'class:fast', expectedAnalysis: '' },
    { chunk: 'chunk-model', analysis: 'answer-model', expectedChunk: 'chunk-model', expectedAnalysis: 'answer-model' },
  ])('opens legacy model settings without publishing changes ($chunk, $analysis)', async ({ chunk, analysis, expectedChunk, expectedAnalysis }) => {
    const wrapper = render({
      kb_type: 'document',
      edit: true,
      config: { summary_model: 'custom-summary', chunk_enrichment_model: chunk, analysis_model: analysis },
    })
    await flushPromises()
    expect(lastPublished()).toEqual({})
    const toggle = wrapper.get('[aria-label="Contextual embedding"]')
    expect(toggle.attributes('aria-checked')).toBe('true')
    const pickers = wrapper.findAll('wc-model-picker').map(picker => picker.attributes('value') || '')
    expect(pickers).toEqual(['custom-summary', expectedChunk, expectedAnalysis])
    await toggle.trigger('click')
    expect(lastPublished()).toEqual(expectedChunk ? { summary_model: false, chunk_enrichment_model: false } : { summary_model: false })
    wrapper.unmount()
  })

  it('returns to an unchanged disabled configuration after enabling then disabling both models', async () => {
    const wrapper = render({
      kb_type: 'document',
      edit: true,
      id: 'kb-1',
      config: { summary_model: false, chunk_enrichment_model: false, analysis_model: 'answer-model' },
    })
    await flushPromises()
    const toggle = wrapper.get('[aria-label="Contextual embedding"]')
    expect(toggle.attributes('aria-checked')).toBe('false')

    await toggle.trigger('click')
    expect(toggle.attributes('aria-checked')).toBe('true')
    expect(lastPublished()).toEqual({ summary_model: 'class:fast', chunk_enrichment_model: 'class:fast' })

    await toggle.trigger('click')
    expect(toggle.attributes('aria-checked')).toBe('false')
    expect(lastPublished()).toEqual({})
    wrapper.unmount()
  })
})
