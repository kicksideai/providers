import { on } from '@wippy-fe/proxy'

export interface ComponentMetaEvent {
  event: 'component.meta.changed'
  component_id: string
  meta: Record<string, unknown>
  deleted: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function componentMetaEvent(msg: unknown, componentId: string): ComponentMetaEvent | null {
  if (!componentId) return null
  const root = isRecord(msg) ? msg : {}
  const candidates = [
    root,
    isRecord(root.data) ? root.data : null,
    isRecord(root.payload) ? root.payload : null,
    isRecord(root.detail) ? root.detail : null,
  ].filter(Boolean) as Record<string, unknown>[]

  for (const item of candidates) {
    if (item.event !== 'component.meta.changed') continue
    const id = String(item.component_id || '')
    const topic = String(root.topic || item.topic || '')
    if (id && id !== componentId) continue
    if (!id && topic !== `component.${componentId}`) continue
    return {
      event: 'component.meta.changed',
      component_id: id || componentId,
      meta: isRecord(item.meta) ? item.meta : {},
      deleted: Array.isArray(item.deleted) ? item.deleted.map(String) : [],
    }
  }
  return null
}

export function subscribeComponentMeta(
  componentId: string,
  cb: (event: ComponentMetaEvent) => void,
): (() => void) | null {
  if (!componentId) return null
  const off = on(`component.${componentId}`, (msg: unknown) => {
    const event = componentMetaEvent(msg, componentId)
    if (event) cb(event)
  })
  return typeof off === 'function' ? off : null
}
