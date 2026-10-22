import { describe, expect, it } from 'vitest'
import { savedConfig, shownConfig } from './settings'

describe('memory settings', () => {
  const defaults = { judge_model: 'class:fast', recall_max_items: 5, consolidation_interval_hours: 24 }
  const stored = { judge_model: 'class:premium' }

  it('shows stored values over the engine defaults', () => {
    expect(shownConfig(defaults, stored)).toEqual({ judge_model: 'class:premium', recall_max_items: 5, consolidation_interval_hours: 24 })
  })

  it('saves stored values and edits only, so engine defaults are never frozen into the memory', () => {
    expect(savedConfig(stored, { recall_max_items: 7 })).toEqual({ judge_model: 'class:premium', recall_max_items: 7 })
  })
})
