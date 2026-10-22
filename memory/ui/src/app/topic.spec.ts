import { describe, expect, it } from 'vitest'
import { canonicalTopicKey, isCanonicalTopicKey, topicSuggestions } from './topic'

describe('memory topics', () => {
  it('offers stable canonical suggestions for each owner-managed kind', () => {
    expect(topicSuggestions('identity')).toContain('agent_identity')
    expect(topicSuggestions('rule')).toContain('response_style')
    expect(topicSuggestions('skill')).toContain('capability')
    expect(topicSuggestions('lesson')).toContain('operating_principle')
  })

  it('normalizes a topic key without deriving it from memory text', () => {
    expect(canonicalTopicKey('Response style')).toBe('response_style')
    expect(isCanonicalTopicKey('response_style')).toBe(true)
    expect(isCanonicalTopicKey('Response style')).toBe(false)
  })

  it('rejects empty, content-sized, and invalid topic keys', () => {
    expect(isCanonicalTopicKey('')).toBe(false)
    expect(isCanonicalTopicKey('the_agent_should_answer_every_customer_question_with_a_full_explanation_and_follow_up')).toBe(false)
    expect(isCanonicalTopicKey('response-style')).toBe(false)
  })
})
