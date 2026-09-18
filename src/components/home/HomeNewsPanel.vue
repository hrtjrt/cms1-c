<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoPlay } from '@/composables/useAutoPlay'
import type { NewsPreview } from '@/types'

/* ==========================================================================
   模块3：新闻资讯
   行为搬运自 hjc/js/home.js 模块3：
   - 鼠标移入标题：高亮该条并淡出/淡入左侧配图，同时暂停自动播放
   - 鼠标移出整个列表：恢复自动播放
   - 4s 自动轮播切换高亮
   - 点击标题 / 图片：跳转新闻列表页并携带 id
   ========================================================================== */

const props = defineProps<{ news: NewsPreview[] }>()

const NEWS_INTERVAL = 4000
const FADE_DELAY = 200

const router = useRouter()
const currentIndex = ref(0)
const imageOpacity = ref(1)
/** 实际显示在左侧的图：切换时先淡出，等 FADE_DELAY 后才换成新图再淡入 */
const displayedSrc = ref('')

let fadeTimer: number | null = null

function switchNews(index: number): void {
  if (index === currentIndex.value) return
  currentIndex.value = index

  // 淡出 -> 换图 -> 淡入，与原实现 switchNews() 的顺序一致
  imageOpacity.value = 0
  if (fadeTimer !== null) window.clearTimeout(fadeTimer)
  fadeTimer = window.setTimeout(() => {
    fadeTimer = null
    displayedSrc.value = props.news[currentIndex.value]?.image ?? ''
    imageOpacity.value = 1
  }, FADE_DELAY)
}

function handleItemEnter(index: number): void {
  switchNews(index)
  stop()
}

function goToNews(index: number): void {
  const item = props.news[index]
  if (!item) return
  router.push({ path: '/news', query: { id: String(item.id) } })
}

const next = (): void => {
  if (props.news.length === 0) return
  switchNews((currentIndex.value + 1) % props.news.length)
}

const { start, stop } = useAutoPlay(next, NEWS_INTERVAL)

onBeforeUnmount(() => {
  if (fadeTimer !== null) window.clearTimeout(fadeTimer)
})

// 数据到达后重置到第一条（对应原实现 newsImage.src = newsData[0].image 的初始化）
watch(
  () => props.news,
  (list) => {
    currentIndex.value = 0
    displayedSrc.value = list[0]?.image ?? ''
    imageOpacity.value = 1
  },
  { immediate: true }
)
</script>

<template>
  <div class="news-layout">
    <div class="news-image-box" @click="goToNews(currentIndex)">
      <img :src="displayedSrc" alt="新闻图片" :style="{ opacity: imageOpacity }" />
    </div>

    <div class="news-list" @mouseleave="start">
      <div
        v-for="(item, index) in news"
        :key="item.id"
        class="news-item"
        :class="{ active: index === currentIndex }"
        @mouseenter="handleItemEnter(index)"
        @click="goToNews(index)"
      >
        <h3>{{ item.title }}</h3>
        <div class="news-date">{{ item.date }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-layout {
  display: flex;
  gap: 40px;
  padding: 0 8%;
  align-items: stretch;
}

.news-image-box {
  flex: 1.2;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-img);
  min-height: 400px;
  cursor: pointer;
}

.news-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* 过渡 opacity（0.4s）与 transform（0.5s），与原实现一致 */
  transition: opacity 0.4s var(--ease), transform var(--dur-slow) var(--ease);
}

.news-image-box:hover img {
  transform: scale(1.04);
}

.news-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.news-item {
  padding: 18px 22px;
  border-left: 4px solid transparent;
  background: var(--c-bg-soft);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--dur-base) var(--ease);
}

.news-item:hover,
.news-item.active {
  background: var(--c-primary);
  color: var(--c-white);
  border-left-color: var(--c-accent);
  transform: translateX(8px);
}

.news-item h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
  font-weight: 600;
}

.news-date {
  font-size: 0.85rem;
  opacity: 0.7;
}

.news-item:hover .news-date,
.news-item.active .news-date {
  opacity: 0.85;
}

@media (max-width: 900px) {
  .news-layout {
    flex-direction: column;
    padding: 0 5%;
  }

  .news-image-box {
    min-height: 260px;
  }
}
</style>
