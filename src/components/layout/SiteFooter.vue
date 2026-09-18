<script setup lang="ts">
import { useSiteStore } from '@/stores/site'

/* 页脚：原 5 个 HTML 各写一死文案，现由 store 统一提供 */
const site = useSiteStore()
</script>

<template>
  <footer class="site-footer">{{ site.footerText }}</footer>
</template>

<style scoped>
.site-footer {
  padding: 28px 0;
  background: var(--c-ink);
  color: var(--c-white);
  text-align: center;
  font-size: 0.9rem;
}
</style>
