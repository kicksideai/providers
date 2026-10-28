// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { onScopeDispose, ref, watch, type Ref } from 'vue'
import { errorText, type Page } from './types'

export function useDebounced<T>(source: Ref<T>, delay: number, transform: (value: T) => T = (value) => value) {
  const value = ref(transform(source.value)) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(source, (next) => { clearTimeout(timer); timer = setTimeout(() => { value.value = transform(next) }, delay) })
  onScopeDispose(() => clearTimeout(timer))
  return value
}

export function usePaged<T>(key: () => unknown, load: (offset: number) => Promise<Page<T>>, revision?: Ref<number>) {
  const rows = ref<T[]>([]) as Ref<T[]>
  const next = ref<number | null>(null)
  const loading = ref(false)
  const error = ref('')
  let generation = 0
  async function fetchPage(offset: number) {
    const current = ++generation
    if (key() === null) { rows.value = []; next.value = null; loading.value = false; return }
    loading.value = true
    try {
      const page = await load(offset)
      if (current !== generation) return
      rows.value = offset ? [...rows.value, ...page.rows] : page.rows
      next.value = page.next; error.value = ''
    } catch (err) { if (current === generation) error.value = errorText(err) }
    finally { if (current === generation) loading.value = false }
  }
  watch(revision ? [key, revision] : [key], () => { void fetchPage(0) }, { immediate: true })
  return { rows, next, loading, error, more: () => { if (next.value !== null && !loading.value) void fetchPage(next.value) } }
}
