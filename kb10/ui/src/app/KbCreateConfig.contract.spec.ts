import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import KbCreateConfig from './KbCreateConfig.vue'
import { PAIR_HINT_MAX, PAIR_LABEL_MAX } from './pairing'

// kx-kb-create is the one surface that configures a kb10 knowledge base: the
// knowledge dialog mounts it for create and for edit, and it publishes the whole
// { embedding_model, config } payload the dialog writes. Over an existing
// knowledge base it also carries kb10's maintenance actions.

// The engine's declared config surface, as the dialog hands it over.
const CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    summary_prompt: {
      type: 'string',
      label: 'Summary instructions',
      description: 'How every document in this knowledge base is summarized.',
      format: 'textarea',
    },
    summary_max_chars: {
      type: 'integer',
      label: 'Summary length',
      description: 'How long each document summary may be.',
      minimum: 0,
      maximum: 8000,
      default: 2400,
    },
    depth: { type: 'integer', label: 'Link depth', minimum: 1, maximum: 8, default: 3 },
    // Declared by both engines, and the longest words on the pane: the field
    // whose placement the budget below decides.
    max_document_content_chars: {
      type: 'integer',
      label: 'Document size limit',
      description: 'Documents longer than this many characters are marked failed instead of indexed; the uploaded file is kept. Empty means no limit.',
      minimum: 0,
      maximum: 268435456,
    },
  },
}

function setContext(over: Record<string, unknown> = {}, config: Record<string, unknown> = {}) {
  ;(globalThis as any).__kbProps__ = {
    config: {
      kb_type: 'document',
      config: { config_schema: CONFIG_SCHEMA, ...config },
      ...over,
    },
  }
}

function published(): Record<string, unknown> {
  const calls = vi.mocked((globalThis as any).__kbEmitEvent__).mock.calls
  expect(calls.length).toBeGreaterThan(0)
  return (calls[calls.length - 1][1] as any).config
}

function field(w: ReturnType<typeof mount>, label: string) {
  const found = w.findAll('.cx-field').find((d) => {
    const l = d.find('.cx-label')
    return l.exists() && l.text().startsWith(label)
  })
  expect(found, `field "${label}"`).toBeTruthy()
  return found!
}

// The switch that gates one of the optional index-time passes, found by the pass
// it gates rather than by its position among them.
function passSwitch(w: ReturnType<typeof mount>, title: string) {
  const sub = w.findAll('.cx-sub').find((d) => {
    const l = d.find('.cx-label')
    return l.exists() && l.text().startsWith(title)
  })
  expect(sub, `pass "${title}"`).toBeTruthy()
  return sub!.get('.cx-switch')
}

function findButton(w: ReturnType<typeof mount>, text: string) {
  return w.findAll('button').find((b) => b.text().includes(text))!
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__kbApi__ = {}
  setContext()
})

describe('KbCreateConfig ask settings', () => {
  // max_retrieval_iterations is read only by the agentic driver, so the control
  // that writes it exists only where the value is spent. Concept-graph
  // traversal depth is the engine's own Link depth field, a separate key.
  it('offers the round budget only to the driver that spends it', async () => {
    setContext({ edit: true, id: 'kb1' }, { query_driver: 'agentic' })
    const agentic = mount(KbCreateConfig)
    await flushPromises()
    expect(agentic.findAll('.cx-field').some((d) => d.find('.cx-label').exists()
      && d.find('.cx-label').text().startsWith('Max rounds'))).toBe(true)
    agentic.unmount()

    setContext({ edit: true, id: 'kb1' }, { kb_type: 'wiki' })
    const singleShot = mount(KbCreateConfig)
    await flushPromises()
    expect(singleShot.findAll('.cx-field').some((d) => d.find('.cx-label').exists()
      && d.find('.cx-label').text().startsWith('Max rounds'))).toBe(false)
    singleShot.unmount()
  })
})

describe('KbCreateConfig summary settings', () => {
  it('seeds both settings from the knowledge base config it is editing', async () => {
    setContext({ edit: true, id: 'kb1' }, {
      summary_model: 'class:fast',
      chunk_enrichment_model: 'class:fast',
      summary_prompt: 'Capture pricing and dates.',
      summary_max_chars: 500,
    })
    const w = mount(KbCreateConfig)
    await flushPromises()

    expect((field(w, 'Summary instructions').get('textarea').element as HTMLTextAreaElement).value)
      .toBe('Capture pricing and dates.')
    expect((field(w, 'Summary length').get('input[type=number]').element as HTMLInputElement).value)
      .toBe('500')
    w.unmount()
  })

  it('shows the engine default length as a placeholder instead of writing it into the config', async () => {
    setContext({ edit: true, id: 'kb1' }, { summary_model: 'class:fast', chunk_enrichment_model: 'class:fast' })
    const w = mount(KbCreateConfig)
    await flushPromises()

    const input = field(w, 'Summary length').get('input[type=number]').element as HTMLInputElement
    expect(input.value).toBe('')
    expect(input.placeholder).toBe('2400')
    expect(published().summary_max_chars).toBeUndefined()
    w.unmount()
  })

  it('publishes both settings into the payload the dialog saves', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    await field(w, 'Summary instructions').get('textarea').setValue('Lead with the customer goal.')
    await field(w, 'Summary length').get('input[type=number]').setValue('900')
    await flushPromises()

    expect(published()).toMatchObject({
      summary_prompt: 'Lead with the customer goal.',
      summary_max_chars: 900,
      summary_model: 'class:fast',
    })
    w.unmount()
  })

  it('sends an emptied prompt so clearing it unsets the stored one', async () => {
    setContext({ edit: true, id: 'kb1' }, {
      summary_model: 'class:fast',
      chunk_enrichment_model: 'class:fast',
      summary_prompt: 'Capture pricing and dates.',
    })
    const w = mount(KbCreateConfig)
    await flushPromises()

    await field(w, 'Summary instructions').get('textarea').setValue('')
    await flushPromises()
    expect(published().summary_prompt).toBe('')
    w.unmount()
  })

  it('refuses a length beyond the engine bound rather than clamping it', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    await field(w, 'Summary length').get('input[type=number]').setValue('9000')
    await flushPromises()

    expect(w.text()).toContain('Summary length must be a whole number between 0 and 8000 characters.')
    expect(published().summary_max_chars).toBeUndefined()
    w.unmount()
  })

  it('refuses a negative length', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    await field(w, 'Summary length').get('input[type=number]').setValue('-1')
    await flushPromises()

    expect(w.text()).toContain('Summary length must be a whole number between 0 and 8000 characters.')
    expect(published().summary_max_chars).toBeUndefined()
    w.unmount()
  })

  it('keeps an explicit zero — no fallback summary text at all', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    await field(w, 'Summary length').get('input[type=number]').setValue('0')
    await flushPromises()

    expect(published().summary_max_chars).toBe(0)
    w.unmount()
  })

  // They belong to the summary the contextual models produce: with contextual
  // embedding off, chunks are embedded as-is and there is no summary to shape.
  it('drops both settings when contextual embedding is switched off', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()
    await field(w, 'Summary length').get('input[type=number]').setValue('900')
    await flushPromises()

    await passSwitch(w, 'Contextual embedding').trigger('click')
    await flushPromises()

    const cfg = published()
    expect(cfg.summary_prompt).toBeUndefined()
    expect(cfg.summary_max_chars).toBeUndefined()
    expect(cfg.summary_model).toBeUndefined()
    w.unmount()
  })

  // One control per setting: the summary settings are rendered beside the model
  // that reads them, so the generic options list leaves them out.
  it('renders each summary setting once and keeps the other engine fields generic', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    const labels = w.findAll('.cx-label').map((l) => l.text())
    expect(labels.filter((t) => t.startsWith('Summary instructions'))).toHaveLength(1)
    expect(labels.filter((t) => t.startsWith('Summary length'))).toHaveLength(1)
    expect(labels.some((t) => t.startsWith('Link depth'))).toBe(true)
    w.unmount()
  })
})

// ── Row placement ────────────────────────────────────────────────────────────
// Two controls share a row only while both fit a half column. A cell that
// overruns it wraps, lifts its own input out of line with its partner's and
// carries every section under the row down with it, so placement answers to what
// a control renders rather than to the kind of value it holds.
type Cell = { label: string; hint: string; span: boolean }

function rowCells(w: ReturnType<typeof mount>): Cell[][] {
  return w.findAll('.cx-row').map((row) =>
    Array.from(row.element.children).map((cell) => ({
      label: (cell.querySelector('.cx-label')?.textContent || '').trim(),
      hint: (cell.querySelector('.st-hint')?.textContent || '').trim(),
      span: cell.classList.contains('cx-span'),
    })))
}

describe('KbCreateConfig row placement', () => {
  it('gives a field whose words overrun a half column the whole row', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    const cells = rowCells(w).flat()
    const long = cells.find((c) => c.label === 'Document size limit')!
    const short = cells.find((c) => c.label === 'Link depth')!
    expect(long.hint.length).toBeGreaterThan(PAIR_HINT_MAX)
    expect(long.span).toBe(true)
    expect(short.span).toBe(false)
    w.unmount()
  })

  // Every pair on the pane, engine-declared or written into the template, holds
  // to the same budget — a hint grown past it moves its field to its own row
  // instead of dragging the pane down.
  it('pairs no control whose label or hint overruns the half column', async () => {
    for (const driver of ['built-in', 'agentic']) {
      setContext({ edit: true, id: 'kb1' }, {
        summary_model: 'class:fast',
        chunk_enrichment_model: 'class:fast',
        embed_images: true,
        query_driver: driver,
      })
      const w = mount(KbCreateConfig)
      await flushPromises()

      const rows = rowCells(w)
      expect(rows.length).toBeGreaterThan(0)
      for (const cells of rows) {
        for (const cell of cells.filter((c) => !c.span)) {
          expect(cell.label.length, `label "${cell.label}"`).toBeLessThanOrEqual(PAIR_LABEL_MAX)
          expect(cell.hint.length, `hint of "${cell.label}"`).toBeLessThanOrEqual(PAIR_HINT_MAX)
        }
      }
      w.unmount()
    }
  })
})

// ── Maintenance ──────────────────────────────────────────────────────────────
// A maintenance action starts a job and the element polls the run record; the
// server's record is the source of truth for what is in flight, which is why a
// dialog reopened in the middle of a run still finds it running.
type Run = Record<string, unknown>

function run(over: Run = {}): Run {
  return {
    id: 'run-1',
    run_type: 'resummarize',
    status: 'scheduled',
    in_flight: true,
    stale: false,
    total: 0,
    scanned: 0,
    resummarized: 0,
    chunks_reenriched: 0,
    chunks_failed: 0,
    documents_skipped: 0,
    embedded: 0,
    last_error: null,
    ...over,
  }
}

function setStatus(over: { resummarize?: Run | null; reembed?: Run | null }) {
  ;(globalThis as any).__kbApi__['/maintenance'] = {
    success: true, kb_id: 'kb1', resummarize: null, reembed: null, ...over,
  }
}

function mountEditing() {
  setContext({ edit: true, id: 'kb1' }, { summary_model: 'class:fast', chunk_enrichment_model: 'class:fast' })
  return mount(KbCreateConfig)
}

describe('KbCreateConfig maintenance', () => {
  it('starts a run instead of waiting for the work, and reports it as in flight', async () => {
    const scheduled = run()
    ;(globalThis as any).__kbApi__['/resummarize'] = {
      success: true, kb_id: 'kb1', job_id: 'job-1', scheduled: true, run: scheduled,
    }
    setStatus({})

    const w = mountEditing()
    await flushPromises()
    setStatus({ resummarize: scheduled })
    await findButton(w, 'Regenerate summaries').trigger('click')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/api/v1/kb10/kb1/resummarize')
    expect(api.get).toHaveBeenCalledWith('/api/v1/kb10/kb1/maintenance')
    expect(w.text()).toContain('Scheduled — the run starts shortly')
    expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeDefined()
    expect(findButton(w, 'Re-embed vectors').attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('polls the run to live counts and then to its terminal line', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const scheduled = run()
      ;(globalThis as any).__kbApi__['/resummarize'] = {
        success: true, kb_id: 'kb1', job_id: 'job-1', scheduled: true, run: scheduled,
      }
      setStatus({})

      const w = mountEditing()
      await flushPromises()
      setStatus({ resummarize: scheduled })
      await findButton(w, 'Regenerate summaries').trigger('click')
      await flushPromises()

      setStatus({ resummarize: run({ status: 'running', total: 700, scanned: 128, resummarized: 128 }) })
      await vi.advanceTimersByTimeAsync(3000)
      await flushPromises()
      expect(w.text()).toContain('128 of 700 documents…')
      expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeDefined()

      setStatus({
        resummarize: run({
          status: 'succeeded', in_flight: false, total: 700, scanned: 700, resummarized: 690,
          chunks_reenriched: 2100, documents_skipped: 10, chunks_failed: 4,
        }),
      })
      await vi.advanceTimersByTimeAsync(3000)
      await flushPromises()
      expect(w.text()).toContain(
        '690 summaries regenerated, 2100 chunks re-situated, 10 documents skipped, 4 chunks failed',
      )
      expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeUndefined()
      w.unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('re-embeds vectors and renders the run record terminal counts', async () => {
    const scheduled = run({ id: 'run-2', run_type: 'reembed' })
    ;(globalThis as any).__kbApi__['/reembed'] = {
      success: true, kb_id: 'kb1', job_id: 'job-2', scheduled: true, run: scheduled,
    }
    setStatus({})

    const w = mountEditing()
    await flushPromises()
    setStatus({
      reembed: run({
        id: 'run-2', run_type: 'reembed', status: 'succeeded', in_flight: false,
        total: 140, scanned: 140, embedded: 140,
      }),
    })
    await findButton(w, 'Re-embed vectors').trigger('click')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/api/v1/kb10/kb1/reembed')
    expect(w.text()).toContain('140 vectors re-embedded, 140 scanned')
    w.unmount()
  })

  // The dialog is remounted, not resumed: nothing about the run lives in the
  // element, so the record has to be what says it is still going.
  it('shows a run still in flight when the dialog is reopened', async () => {
    setStatus({ resummarize: run({ status: 'running', total: 700, scanned: 42 }) })

    const w = mountEditing()
    await flushPromises()

    expect(api.post).not.toHaveBeenCalled()
    expect(w.text()).toContain('42 of 700 documents…')
    expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeDefined()
    expect(findButton(w, 'Re-embed vectors').attributes('disabled')).toBeDefined()
    w.unmount()
  })

  it('renders the reason the server gives for a failed run', async () => {
    setStatus({
      resummarize: run({
        status: 'failed', in_flight: false,
        last_error: 'kb has no summary_model configured -- nothing to regenerate with',
      }),
    })

    const w = mountEditing()
    await flushPromises()
    expect(w.text()).toContain('kb has no summary_model configured -- nothing to regenerate with')
    w.unmount()
  })

  it('renders the server error text when the start is refused', async () => {
    vi.mocked(api.post).mockImplementationOnce(() =>
      Promise.reject({ response: { status: 409, data: { error: 'a resummarize run is already in flight for this knowledge base' } } }))
    const w = mountEditing()
    await flushPromises()
    await findButton(w, 'Regenerate summaries').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('a resummarize run is already in flight for this knowledge base')
    w.unmount()
  })

  it('says so when a run stops reporting', async () => {
    setStatus({ resummarize: run({ status: 'running', in_flight: false, stale: true }) })
    const w = mountEditing()
    await flushPromises()
    expect(w.text()).toContain('This run stopped reporting')
    expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeUndefined()
    w.unmount()
  })

  // A run reads the settings the knowledge base has SAVED, so spending full model
  // cost under settings the dialog has not written yet is refused.
  it('closes both actions while the form holds unsaved changes', async () => {
    setStatus({})
    const w = mountEditing()
    await flushPromises()
    expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeUndefined()

    await field(w, 'Summary instructions').get('textarea').setValue('A prompt that has not been saved yet.')
    await flushPromises()

    expect(findButton(w, 'Regenerate summaries').attributes('disabled')).toBeDefined()
    expect(findButton(w, 'Re-embed vectors').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Save your changes first')

    await findButton(w, 'Regenerate summaries').trigger('click')
    await flushPromises()
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })

  // A knowledge base being created holds nothing to rewrite.
  it('carries no maintenance actions while a knowledge base is being created', async () => {
    const w = mount(KbCreateConfig)
    await flushPromises()

    expect(findButton(w, 'Regenerate summaries')).toBeUndefined()
    expect(findButton(w, 'Re-embed vectors')).toBeUndefined()
    expect(api.get).not.toHaveBeenCalled()
    w.unmount()
  })

  // The poll loop belongs to the element that started it: a read still in flight
  // when the dialog closes must not resolve into a dead component.
  it('stops polling once the dialog is gone', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      setStatus({ resummarize: run({ status: 'running', total: 700, scanned: 42 }) })
      const w = mountEditing()
      await flushPromises()

      const reads = vi.mocked(api.get).mock.calls.length
      w.unmount()
      await vi.advanceTimersByTimeAsync(30000)
      await flushPromises()
      expect(vi.mocked(api.get).mock.calls.length).toBe(reads)
    } finally {
      vi.useRealTimers()
    }
  })

  // A status read that fails says nothing about the runs, so the element keeps
  // asking instead of holding a spinner it can no longer check.
  it('keeps polling after a failed status read and recovers', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      setStatus({ resummarize: run({ status: 'running', total: 700, scanned: 42 }) })
      vi.mocked(api.get).mockImplementationOnce(() =>
        Promise.reject({ response: { data: { error: 'maintenance status unavailable' } } }))

      const w = mountEditing()
      await flushPromises()
      expect(w.text()).toContain('maintenance status unavailable')

      // The retry backs off past the healthy interval, then reports the run.
      await vi.advanceTimersByTimeAsync(6000)
      await flushPromises()
      expect(w.text()).toContain('42 of 700 documents…')
      expect(w.text()).not.toContain('maintenance status unavailable')
      w.unmount()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('KbCreateConfig declared retrieval optimization', () => {
  it.each([{}, { edit: true, id: 'kb1' }])('defaults HyDE and tuning off for new and existing KBs', async (context) => {
    setContext(context)
    const w = mount(KbCreateConfig)
    await flushPromises()
    expect(published().query_strategy).toBe('plain')
    expect(published().self_tuning).toBe(false)
    w.unmount()
  })
  it('seeds the saved choice and publishes changes through the existing configuration event', async () => {
    setContext({ edit: true, id: 'kb1' }, { query_strategy: 'hyde', self_tuning: true, analysis_model: 'class:fast' })
    const w = mount(KbCreateConfig)
    await flushPromises()
    const hyde = w.get('[aria-label="Hypothetical answer retrieval"]')
    const tuning = w.get('[aria-label="Autonomous retrieval tuning"]')
    expect(hyde.attributes('aria-checked')).toBe('true')
    expect(tuning.attributes('aria-checked')).toBe('true')
    await hyde.trigger('click')
    await tuning.trigger('click')
    await flushPromises()
    expect(published().query_strategy).toBe('plain')
    expect(published().self_tuning).toBe(false)
    expect(published().analysis_model).toBe('class:fast')
    w.unmount()
  })
})
