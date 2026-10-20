import { api } from '@wippy-fe/proxy'

// Only the popup we opened, the configured callback origin and this attempt's
// state can complete a connection. No token crosses the browser message channel.
export function createOAuthFlow() {
  let cancel = () => {}
  async function start(body: Record<string, unknown>): Promise<void> {
    cancel()
    const popup = window.open('about:blank', '_blank', 'width=540,height=720')
    if (!popup) throw new Error('Allow popups for KickSide and try signing in again.')
    let stopped = false
    let rejectPending: (error: Error) => void = () => {}
    let listener: ((event: MessageEvent) => void) | undefined
    let timer: ReturnType<typeof setInterval> | undefined
    function cleanup() {
      stopped = true
      if (listener) window.removeEventListener('message', listener)
      if (timer) clearInterval(timer)
      popup?.close()
    }
    cancel = () => { cleanup(); rejectPending(new Error('Authorization cancelled.')) }
    try {
      const { data } = await api.post('/api/v1/oauth/providers/mcp_remote/init', body)
      if (stopped) throw new Error('Authorization cancelled.')
      if (!data?.success || !data.authorization_url || !data.state_token || !data.redirect_uri) {
        throw new Error(data?.error || 'The server could not start OAuth authorization.')
      }
      const callback = new URL(data.redirect_uri)
      const authorization = new URL(data.authorization_url)
      if (!['https:', 'http:'].includes(callback.protocol) || !['https:', 'http:'].includes(authorization.protocol)) {
        throw new Error('Invalid OAuth authorization response.')
      }
      await new Promise<void>((resolve, reject) => {
        rejectPending = reject
        listener = (event: MessageEvent) => {
          if (event.source !== popup || event.origin !== callback.origin || event.data?.type !== 'oauth_result'
              || event.data?.state_token !== data.state_token) return
          if (event.data.success === true) resolve()
          else reject(new Error(event.data.error || 'Authorization was declined.'))
        }
        window.addEventListener('message', listener)
        const deadline = Date.now() + 300_000
        timer = setInterval(() => {
          if (popup.closed) reject(new Error('Authorization window closed before completion.'))
          else if (Date.now() > deadline) reject(new Error('Authorization timed out. Try signing in again.'))
        }, 500)
        popup.location.href = authorization.href
      })
    } finally { cleanup() }
  }
  return { start, cancel: () => cancel() }
}
