// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { onScopeDispose, ref, watch, type Ref } from 'vue'
import { api } from '@wippy-fe/proxy'
import { errorText, pageOf } from './types'

export function useDebounced<T>(source: Ref<T>, delay: number, transform: (value: T) => T = (value) => value) {
  const value = ref(transform(source.value)) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(source, (next) => { clearTimeout(timer); timer = setTimeout(() => { value.value = transform(next) }, delay) })
  onScopeDispose(() => clearTimeout(timer))
  return value
}

export function usePaged<T>(url: () => string | null, field: string, revision?: Ref<number>) {
  const rows = ref<T[]>([]) as Ref<T[]>
  const next = ref<number | null>(null)
  const loading = ref(false)
  const error = ref('')
  let generation = 0
  async function fetchPage(offset: number) {
    const target = url(); const current = ++generation
    if (!target) { rows.value = []; next.value = null; loading.value = false; return }
    loading.value = true
    try {
      const sep = target.includes('?') ? '&' : '?'
      const { data } = await api.get(offset ? `${target}${sep}offset=${offset}` : target)
      if (current !== generation) return
      const page = pageOf<T>(data, field)
      rows.value = offset ? [...rows.value, ...page.rows] : page.rows
      next.value = page.next; error.value = ''
    } catch (err) { if (current === generation) error.value = errorText(err) }
    finally { if (current === generation) loading.value = false }
  }
  watch(revision ? [url, revision] : [url], () => { void fetchPage(0) }, { immediate: true })
  return { rows, next, loading, error, more: () => { if (next.value !== null && !loading.value) void fetchPage(next.value) } }
}
