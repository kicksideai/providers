<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'

// The summary / overview card shared by all three detail views (document, wiki,
// graph). When collapsible, a long body clamps to a few lines with a show-more
// toggle; non-collapsible callers always show the full text.
const props = withDefaults(defineProps<{
  text: string
  label?: string
  icon?: string
  collapsible?: boolean
}>(), { label: 'Summary', icon: 'tabler:file-description' })

const expanded = ref(false)
const clampable = computed(() => props.collapsible === true && props.text.length > 320)
</script>

<template>
  <section class="kc-docsum">
    <div class="kc-docsum-h"><Icon :icon="icon" aria-hidden="true" /> {{ label }}</div>
    <p class="kc-docsum-b" :class="{ clamp: clampable && !expanded }">{{ text }}</p>
    <button v-if="clampable" class="kc-docsum-more" type="button" @click="expanded = !expanded">
      {{ expanded ? 'Show less' : 'Show more' }}
    </button>
  </section>
</template>
