<script setup lang="ts">
import { ref } from 'vue'

/* ==========================================================================
   滚动加载哨兵
   对应 hjc 各页 HTML 里的：
   <div class="load-sentinel" id="loadSentinel">
     <span class="loading-text">加载中...</span>
   </div>
   done 为真时隐藏转圈（原文案见 hjc/css/common.css .load-sentinel.done）。
   root 通过 defineExpose 暴露，供 useInfiniteScroll 观察。
   ========================================================================== */

defineProps<{
  /** 哨兵下方显示的文案 */
  statusText: string
  /** 是否加载完成 */
  done: boolean
}>()

const root = ref<HTMLElement | null>(null)
defineExpose({ root })
</script>

<template>
  <div ref="root" class="load-sentinel" :class="{ done }">
    <span class="loading-text">{{ statusText }}</span>
  </div>
</template>

<style scoped>
.load-sentinel {
  text-align: center;
  padding: 32px 0;
  color: var(--c-text-weak);
  font-size: 0.9rem;
}

.loading-text::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border: 2px solid var(--c-line);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  vertical-align: middle;
  animation: spin 0.8s linear infinite;
}

/* 加载完成时隐藏小圆圈 */
.done .loading-text::before {
  display: none;
}
</style>
