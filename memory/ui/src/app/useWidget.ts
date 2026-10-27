// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { onMounted, ref } from 'vue'
import { loadByTagName } from '@wippy-fe/proxy'
import { errorText } from './types'

export function useWidget(tag: string) {
  const ready = ref(!!customElements.get(tag))
  const failed = ref('')
  onMounted(async () => {
    if (ready.value) return
    try {
      await loadByTagName(tag, { timeoutMs: 8000 })
      ready.value = true
    } catch (err) {
      failed.value = errorText(err)
    }
  })
  return { ready, failed }
}
