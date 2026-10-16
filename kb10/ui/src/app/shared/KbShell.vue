<script setup lang="ts">
// Borderless two-zone shell: a navigation rail flush against an open content
// area. The rail slot is the hierarchy/list; the default slot is the reading
// area. The rail collapses on narrow widths.
</script>

<template>
  <div class="kc-shell">
    <aside class="kc-rail"><slot name="rail" /></aside>
    <main class="kc-main"><slot /></main>
  </div>
</template>
