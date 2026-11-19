// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils'
import type { Component } from 'vue'
import KbSearch from './KbSearch.vue'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post }, host: { handleError: vi.fn() } }))
vi.mock('@iconify/vue', () => ({ Icon: { render: () => null } }))

const bundles = import.meta.glob('../../../../static/AddPanel.vue_vue_type_script_setup_true_lang-*.js', { eager: true })
const packed = Object.values(bundles).flatMap((module) => Object.values(module as object))
  .find((value) => value?.__name === 'KbSearch') as Component

enableAutoUnmount(afterEach)

describe.each([['source', KbSearch], ['served bundle', packed]] as const)('%s Ask capability', (_, component) => {
  beforeEach(() => {
    vi.clearAllMocks()
    get.mockResolvedValue({ data: { success: true, results: [{ id: 'passage', content: 'Search passage' }] } })
    post.mockResolvedValue({ data: { success: true, answer: 'Grounded answer', results: [{ id: 'passage', content: 'Answer source' }] } })
  })

  it.each([undefined, false])(
    'uses search in panels without Ask enabled: %j', async (ask) => {
      const wrapper = mount(component, { props: { kbId: 'kb', ask } })
      expect(wrapper.find('.kc-search-modes').exists()).toBe(false)
      await wrapper.get('input').setValue('question')
      await wrapper.get('input').trigger('keyup.enter')
      await flushPromises()
      expect(get).toHaveBeenCalledWith('/api/v1/kb10/kb/search?q=question&limit=20')
      expect(post).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Search passage')
    },
  )

  it('uses the answer endpoint and question placeholder with an Answer model', async () => {
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    expect(wrapper.get('input').attributes('placeholder')).toBe('Ask this knowledge base a question…')
    await wrapper.get('input').setValue('question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/knowledge/kb/ask', { query: 'question', limit: 8 })
    expect(get).not.toHaveBeenCalled()
    expect(wrapper.get('.kc-ans-body').text()).toBe('Grounded answer')
  })

  it.each([
    'Answers are disabled. Returning query results.',
    'No answer model is available. Returning query results.',
  ])('shows every passage in Ask query mode: %s', async (notice) => {
    post.mockResolvedValueOnce({ data: {
      success: true, mode: 'query', answer: notice,
      results: [
        { id: 'first', content: 'First passage' },
        { id: 'second', content: 'Second passage' },
      ],
    } })
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.get('input').setValue('question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe(notice)
    expect(wrapper.find('.kc-ans').exists()).toBe(false)
    expect(wrapper.findAll('.kc-search-r-body').map((row) => row.text())).toEqual(['First passage', 'Second passage'])
    expect(get).not.toHaveBeenCalled()
  })

  it('shows relevance and result navigation without retrieval jargon', async () => {
    get.mockResolvedValue({ data: { success: true, results: [
      { id: 'passage', parent_id: 'document', content: 'Relevant passage', llm_score: 82.4, similarity: 0.91 },
    ] } })
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    expect(wrapper.text()).not.toMatch(/Two-stage|vector|LLM/)
    await wrapper.get('input').setValue('question')
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    const result = wrapper.get('.kc-search-result')
    expect(result.text()).toContain('Relevance 82')
    expect(result.text()).toContain('91%')
    expect(result.text()).not.toContain('LLM')
    await result.trigger('click')
    expect(wrapper.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'passage', parent_id: 'document' })
  })

  it.each(['panel', 'rail'] as const)('explains unassigned analysis beside direct matches in %s', async (layout) => {
    get.mockResolvedValueOnce({ data: { success: true,
      retrieval: { strategy: 'plain', analysis: { status: 'unavailable', reason: 'no_models_for_class', model: 'class:fast' } },
      results: [{ id: 'passage', content: 'Direct match' }],
    } })
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true, layout } })
    await wrapper.get('input').trigger('focusin')
    await wrapper.get('input').setValue('question')
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    expect(wrapper.text()).toContain('Direct match')
    expect(wrapper.find('.kc-search-modes').exists()).toBe(layout === 'panel')
    expect(wrapper.get('[role="status"]').text()).toBe('Showing direct matches. No model is assigned to class:fast.')
    if (layout === 'panel') {
      post.mockResolvedValueOnce({ data: { success: true, mode: 'query',
        answer: 'No answer model is available. Returning query results.',
        results: [{ id: 'passage', content: 'Direct match' }],
      } })
      await wrapper.get('.kc-search-mode:last-child').trigger('click')
      await flushPromises()
      expect(post).toHaveBeenCalledWith('/api/v1/knowledge/kb/ask', { query: 'question', limit: 8 })
      expect(wrapper.get('[role="status"]').text()).toBe('No answer model is available. Returning query results.')
      expect(wrapper.text()).toContain('Direct match')
      await wrapper.get('.kc-search-mode:first-child').trigger('click')
      await flushPromises()
    }
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    expect(wrapper.text()).toContain('Search passage')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    if (layout === 'panel') expect(wrapper.find('.kc-search-modes').exists()).toBe(true)
  })

  it.each(['response', 'rejection'] as const)('keeps Ask available after an unavailable Ask %s', async (outcome) => {
    const data = { success: false, error: 'ask failed: answer generation failed: No models found for class: fast',
      retrieval: { strategy: 'plain', analysis: { status: 'unavailable', reason: 'no_models_for_class', model: 'class:fast' } } }
    if (outcome === 'response') post.mockResolvedValueOnce({ data })
    else post.mockRejectedValueOnce({ response: { status: 503, data } })
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.get('input').setValue('question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(get).not.toHaveBeenCalled()
    expect(wrapper.find('.kc-search-modes').exists()).toBe(true)
    expect(wrapper.text()).toContain(data.error)
    expect(wrapper.get('input').attributes('placeholder')).toBe('Ask this knowledge base a question…')
  })

  it('keeps Ask available after a concrete provider fails', async () => {
    post.mockRejectedValueOnce({ response: { status: 503, data: {
      success: false, error: 'ask failed: provider unavailable',
    } } })
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.get('input').setValue('question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('ask failed: provider unavailable')
    expect(wrapper.find('.kc-search-modes').exists()).toBe(true)
    expect(wrapper.get('input').attributes('placeholder')).toBe('Ask this knowledge base a question…')
  })

  it('shows a provider failure without presenting stale passages as an answer', async () => {
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.get('input').setValue('first question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('.kc-ans-body').text()).toBe('Grounded answer')

    post.mockRejectedValueOnce({ response: { status: 503, data: {
      success: false, error: 'Model provider profile is unavailable',
    } } })
    await wrapper.get('input').setValue('second question')
    await wrapper.get('button[aria-label="Ask"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('.kc-search-err').text()).toContain('Model provider profile is unavailable')
    expect(wrapper.find('.kc-ans').exists()).toBe(false)
    expect(wrapper.find('.kc-search-result').exists()).toBe(false)
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('returns to search when the Answer capability is removed', async () => {
    const wrapper = mount(component, { props: { kbId: 'kb', ask: true } })
    await wrapper.get('.kc-search-mode:last-child').trigger('click')
    await wrapper.setProps({ ask: false })
    expect(wrapper.find('.kc-search-modes').exists()).toBe(false)
    expect(wrapper.get('input').attributes('placeholder')).toBe('Search every indexed passage…')
    await wrapper.get('input').setValue('question')
    await wrapper.get('input').trigger('keyup.enter')
    await flushPromises()
    expect(get).toHaveBeenCalledOnce()
    expect(post).not.toHaveBeenCalled()
  })
})
