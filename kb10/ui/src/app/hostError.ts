import { host } from '@wippy-fe/proxy'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function reportHostError(error: unknown): void {
  const detail = isRecord(error) ? error : { message: String(error) }
  const response = detail.response
  const code = isRecord(response) && response.status === 401 ? 'auth-expired' : 'other'
  host.handleError(code, detail)
}
