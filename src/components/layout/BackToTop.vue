<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/* ==========================================================================
   返回顶部
   搬运自 hjc/js/common.js：滚动超过 400px 出现，点击平滑回到顶部。
   ========================================================================== */

const VISIBLE_AFTER = 400

const visible = ref(false)

function handleScroll(): void {
  visible.value = window.scrollY > VISIBLE_AFTER
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <button
    type="button"
    class="back-to-top"
    :class="{ show: visible }"
    aria-label="返回顶部"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: var(--radius);
  background: var(--c-primary-a85);
  color: var(--c-white);
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all var(--dur-base) var(--ease);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background: var(--c-primary);
  transform: translateY(-4px);
}
</style>
