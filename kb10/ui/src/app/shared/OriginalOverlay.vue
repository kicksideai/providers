<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import IconButton from './IconButton.vue'
import { api } from '@wippy-fe/proxy'

// Original-file viewer: the ingested document's raw bytes (pdf / image / office /
// html) rendered through the shared <wc-resource-view>.
//
// Two modes. The default promotes the overlay to the browser's top layer with the
// Fullscreen API: the component lives in a shadow root whose ancestors establish a
// containing block (transforms in the app shell), so a plain position:fixed overlay
// is trapped to the panel, not the viewport; fullscreen ignores those ancestors and
// fills the screen. The `contained` mode is the opposite intent — it stays an
// absolute overlay scoped to whatever positioned container it is mounted in (e.g.
// the graph view), rendered as a centered modal card, and never goes fullscreen.
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  contentType: string
  sourceUrl: string
  filename?: string
  contained?: boolean
}>(), { contained: false })
const emit = defineEmits<{ (e: 'close'): void }>()

const maskRef = ref<HTMLElement | null>(null)

function enterFullscreen() {
  if (props.contained) return
  const el = maskRef.value
  if (el && el.requestFullscreen && !document.fullscreenElement) {
    el.requestFullscreen().catch(() => { /* stays a panel overlay */ })
  }
}
function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
// Native Escape exits fullscreen rather than reaching our handler; mirror that to
// a close so the overlay state stays in sync when the user backs out that way.
function onFsChange() {
  if (props.open && !document.fullscreenElement) emit('close')
}

watch(() => props.open, (open) => {
  if (open) {
    window.addEventListener('keydown', onKeydown)
    nextTick(enterFullscreen)
  } else {
    window.removeEventListener('keydown', onKeydown)
    exitFullscreen()
  }
})

// sourceUrl is the node's /source endpoint: it authorizes (KB read) and returns a
// tokened bytes URL as JSON (the proxy client can't follow its redirect). Resolve it
// here, then render the bytes through <wc-resource-view> — one place for every view
// that opens an original, instead of each resolving it itself.
const resolvedUrl = ref('')
const resolvedType = ref('')
async function resolveSource() {
  resolvedUrl.value = ''
  resolvedType.value = ''
  if (!props.open || !props.sourceUrl) return
  try {
    const { data } = await api.get(props.sourceUrl)
    if (data?.success && typeof data.url === 'string') {
      resolvedUrl.value = data.url
      resolvedType.value = typeof data.content_type === 'string' ? data.content_type : ''
    }
  } catch { /* the renderer shows its own empty/error state */ }
}
watch(() => [props.open, props.sourceUrl], resolveSource, { immediate: true })

onMounted(() => { if (!props.contained) document.addEventListener('fullscreenchange', onFsChange) })
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
  window.removeEventListener('keydown', onKeydown)
  exitFullscreen()
})
</script>

<template>
  <Transition name="kc-orig">
    <div
      v-if="open"
      ref="maskRef"
      class="kc-orig-mask"
      :class="{ 'kc-orig-contained': contained }"
      @click.self="emit('close')"
    >
      <section class="kc-orig" role="dialog" :aria-label="title">
        <header class="kc-orig-h">
          <span class="kc-orig-title"><Icon icon="tabler:file-search" aria-hidden="true" /><span class="kc-orig-title-t">{{ title }}</span></span>
          <IconButton icon="tabler:x" label="Close" @click="emit('close')" />
        </header>
        <div class="kc-orig-b">
          <wc-resource-view
            v-if="resolvedUrl"
            :key="resolvedUrl"
            class="kc-orig-rv"
            :content-type="resolvedType || contentType"
            :source-url="resolvedUrl"
            :filename="filename"
          />
        </div>
      </section>
    </div>
  </Transition>
</template>
