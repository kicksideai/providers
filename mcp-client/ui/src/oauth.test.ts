import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createOAuthFlow } from './oauth'
const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { post } }))

describe('OAuth popup identity', () => {
  let popup: { closed: boolean; close: ReturnType<typeof vi.fn>; location: { href: string } }
  beforeEach(() => {
    vi.useFakeTimers()
    popup = { closed: false, close: vi.fn(), location: { href: '' } }
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
    post.mockResolvedValue({ data: { success: true, authorization_url: 'https://issuer.example/authorize',
      redirect_uri: 'https://kickside.example/api/public/oauth/callback', state_token: 'expected-state' } })
  })
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); post.mockReset() })
  function message(source: unknown, origin: string, state: string, success = true) {
    window.dispatchEvent(new MessageEvent('message', { source: source as Window, origin,
      data: { type: 'oauth_result', state_token: state, success } }))
  }
  it('ignores forged windows, origins and state before accepting the actual consent result', async () => {
    const flow = createOAuthFlow()
    const completed = vi.fn()
    const pending = flow.start({ provider_options: { endpoint_url: 'https://mcp.example/mcp' } }).then(completed)
    await Promise.resolve()
    message({}, 'https://kickside.example', 'expected-state')
    message(popup, 'https://attacker.example', 'expected-state')
    message(popup, 'https://kickside.example', 'different-attempt')
    await Promise.resolve()
    expect(completed).not.toHaveBeenCalled()
    message(popup, 'https://kickside.example', 'expected-state')
    await pending
    expect(completed).toHaveBeenCalledOnce()
    expect(popup.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('reports denied consent and cleans up the popup listener', async () => {
    const flow = createOAuthFlow()
    const pending = flow.start({}).catch(error => error.message)
    await Promise.resolve()
    message(popup, 'https://kickside.example', 'expected-state', false)
    expect(await pending).toContain('declined')
    expect(popup.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('does not initialize an authorization when popups are blocked', async () => {
    vi.mocked(window.open).mockReturnValue(null)
    await expect(createOAuthFlow().start({})).rejects.toThrow('Allow popups')
    expect(post).not.toHaveBeenCalled()
  })
  it('cancels an outstanding request when the editor is unmounted', async () => {
    const flow = createOAuthFlow()
    const pending = flow.start({}).catch(error => error.message)
    await Promise.resolve()
    flow.cancel()
    expect(await pending).toContain('cancelled')
    expect(vi.getTimerCount()).toBe(0)
  })
  it('times out consent and releases all polling', async () => {
    const pending = createOAuthFlow().start({}).catch(error => error.message)
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(300_501)
    expect(await pending).toContain('timed out')
    expect(popup.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('detects a closed popup and isolates separate editors', async () => {
    const pending = createOAuthFlow().start({}).catch(error => error.message)
    await Promise.resolve()
    expect(window.open).toHaveBeenCalledWith('about:blank', '_blank', expect.any(String))
    popup.closed = true
    await vi.advanceTimersByTimeAsync(500)
    expect(await pending).toContain('window closed')
    expect(vi.getTimerCount()).toBe(0)
  })
  it('closes the popup on an invalid initialization response', async () => {
    post.mockResolvedValue({data: {success: true, authorization_url: 'javascript:alert(1)',
      redirect_uri: 'https://kickside.example/callback', state_token: 'state'}})
    await expect(createOAuthFlow().start({})).rejects.toThrow('Invalid OAuth')
    expect(popup.location.href).toBe('')
    expect(popup.close).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
