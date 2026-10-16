import { api, host } from '@wippy-fe/proxy'
import type { AssistResult, SdkReference, SdkTool } from './codeExecutionTypes.ts'

// Shape of the error objects the proxy api throws (axios-like), narrowed so the
// helper can pull a server message and route auth-expired through the host.
interface ApiError {
  response?: { data?: { error?: unknown }; status?: number }
  message?: string
}

// Resolve a user-facing message from a thrown api error, routing 401s through the
// host's auth handler. Falls back to the supplied default.
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    if (ax.response?.status === 401) host.handleError('auth-expired', ax as Record<string, unknown>)
  }
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    const server = ax.response?.data?.error
    if (typeof server === 'string' && server.trim()) return server
    if (typeof ax.message === 'string' && ax.message.trim()) return ax.message
  }
  return fallback
}

// The reference panel requests schemas explicitly and follows every catalog page.
export async function fetchSdkReference(toolIds: string[]): Promise<SdkReference> {
  try {
    const tools: SdkTool[] = []
    let cursor: string | undefined
    do {
      const query = new URLSearchParams({tool_ids: toolIds.join(','), fields: '*', limit: '100'})
      if (cursor) query.set('cursor', cursor)
      const { data } = await api.get(`/api/v1/code-execution/sdk-reference?${query}`)
      if (data?.success === false) throw new Error(data.error || 'failed to load SDK reference')
      tools.push(...data.tools)
      cursor = data.next_cursor
    } while (cursor)
    return { tools }
  } catch (e) {
    throw new Error(errMsg(e, 'could not load SDK reference'))
  }
}

// Ask the generator for Lua that satisfies `intent` against the current tool
// whitelist. The server validates it (sandbox dry-run with a simulation SDK) before
// returning: `validated: true` carries runnable `code`; `validated: false` carries the
// gate `errors`. tool_ids is the effective whitelist (empty = all).
export async function generateCode(req: {
  intent: string
  tool_ids: string[]
  sample?: unknown
}): Promise<AssistResult> {
  try {
    const { data } = await api.post('/api/v1/code-execution/assist', req)
    if (data && data.success === false) throw new Error(data.error || 'could not generate code')
    const body = (data || {}) as Record<string, unknown>
    return {
      code: typeof body.code === 'string' ? body.code : undefined,
      validated: body.validated === true,
      errors: Array.isArray(body.errors) ? (body.errors as unknown[]).map(String) : undefined,
    }
  } catch (e) {
    throw new Error(errMsg(e, 'could not generate code'))
  }
}
