// Throwaway harness seams: the host props/events injection and the proxy api.
import { inject, ref, type Ref } from 'vue'

export const HARNESS_PROPS = Symbol('harness-props')

export function useProps<P>(): Ref<P> {
  return inject(HARNESS_PROPS, ref({}) as Ref<P>) as Ref<P>
}
export function useEvents<E>() {
  return (_e: keyof E, _d?: unknown) => {}
}

export const api = {
  get: () => Promise.resolve({ data: { success: true, resummarize: null, reembed: null } }),
  post: () => Promise.resolve({ data: { success: true } }),
  put: () => Promise.resolve({ data: { success: true } }),
  patch: () => Promise.resolve({ data: { success: true } }),
  delete: () => Promise.resolve({ data: { success: true } }),
}
export const host = { toast: () => {}, handleError: () => {} }
export const on = () => () => {}
export const loadByTagName = () => Promise.resolve()
