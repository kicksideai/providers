// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LegacyMemory from './knowledge-memory.vue'

const host = vi.hoisted(() => ({ props: {} as { config?: unknown }, emit: vi.fn() }))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return { useProps: () => ref(host.props), useEvents: () => host.emit }
})
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn().mockResolvedValue(undefined) }))

describe('published document-backed Memory settings', () => {
  beforeEach(() => { host.emit.mockClear() })

  it('preserves every saved KB and advanced checkpoint control when a checkbox changes', async () => {
    const context = {
      kb_ids: ['document-a', 'document-b'], write_kb_id: 'document-b',
      read_enabled: true, write_enabled: true, recall_limit: 7, recall_max_chars: 4567,
      recall_prompt: 'Saved recall guidance', checkpoint_model: 'saved-model',
      checkpoint_prompt: 'Saved checkpoint guidance', checkpoint_temperature: 0.7,
      checkpoint_max_tokens: 123, checkpoint_source_max_chars: 9876,
    }
    host.props = { config: { context, agent_options: { checkpoint: {
      token_threshold: 12345, model: 'saved-model', max_tokens: 222,
    } } } }
    const wrapper = mount(LegacyMemory)
    expect(host.emit).not.toHaveBeenCalled()
    await wrapper.get('input[name="read_enabled"]').setValue(false)
    const [event, config] = host.emit.mock.calls[host.emit.mock.calls.length - 1]!
    expect(event).toBe('config-changed')
    expect(config.context).toEqual({ ...context, read_enabled: false })
    expect(config.context).not.toHaveProperty('memory_id')
    expect(config.agent_options.checkpoint).toEqual({ token_threshold: 12345, model: 'saved-model', max_tokens: 222 })
    wrapper.unmount()
  })

  it('keeps a flat legacy context and explicit write target when editing a recall limit', async () => {
    host.props = { config: JSON.stringify({ kb_ids: ['a', 'b'], write_kb_id: 'b',
      recall_limit: 8, checkpoint_temperature: 0.3, checkpoint_source_max_chars: 7654 }) }
    const wrapper = mount(LegacyMemory)
    await wrapper.get('input[name="recall_limit"]').setValue(9)
    const config = host.emit.mock.calls[host.emit.mock.calls.length - 1]![1]
    expect(config.context.kb_ids).toEqual(['a', 'b'])
    expect(config.context.write_kb_id).toBe('b')
    expect(config.context.recall_limit).toBe(9)
    expect(config.context.checkpoint_temperature).toBe(0.3)
    expect(config.context.checkpoint_source_max_chars).toBe(7654)
    expect(config.context).not.toHaveProperty('memory_id')
    wrapper.unmount()
  })
})
