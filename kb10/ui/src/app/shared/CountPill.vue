<script setup lang="ts">
// Tabular count pill (tab counts, relation counts).
defineProps<{ value: number | string }>()
</script>

<template>
  <span class="kc-count">{{ value }}</span>
</template>
