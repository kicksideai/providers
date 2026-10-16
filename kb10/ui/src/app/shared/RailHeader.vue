<script setup lang="ts">
// Rail header: an uppercase section title with an optional count, plus a slot
// for icon actions on the right.
defineProps<{ title: string; count?: number }>()
</script>

<template>
  <div class="kc-railhead">
    <span class="kc-railhead-title">{{ title }}<b v-if="count !== undefined">{{ count }}</b></span>
    <div class="kc-railhead-acts"><slot name="actions" /></div>
  </div>
</template>
