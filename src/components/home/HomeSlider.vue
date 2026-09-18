<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoPlay } from '@/composables/useAutoPlay'
import type { Banner } from '@/types'

/* ==========================================================================
   模块1：全屏轮播图
   行为搬运自 hjc/js/home.js 模块1：
   3s 自动播放、左右箭头、圆点跳转、悬停暂停、鼠标离开恢复、点击幻灯片跳转。
   ========================================================================== */

const props = defineProps<{ banners: Banner[] }>()

const INTERVAL = 3000

const router = useRouter()
const currentIndex = ref(0)

const trackOffset = computed(() => `-${currentIndex.value * 100}%`)

function goTo(index: number): void {
  let next = index
  if (next < 0) next = props.banners.length - 1
  if (next >= props.banners.length) next = 0
  currentIndex.value = next
}

const next = (): void => goTo(currentIndex.value + 1)
const prev = (): void => goTo(currentIndex.value - 1)

const { start, stop } = useAutoPlay(next, INTERVAL)

function handleSelect(index: number): void {
  goTo(index)
  start()
}

function handleStep(direction: 1 | -1): void {
  if (direction === 1) next()
  else prev()
  start()
}

function handleSlideClick(banner: Banner): void {
  if (banner.link) router.push(banner.link)
}
</script>

<template>
  <section class="slideshow_container" @mouseenter="stop" @mouseleave="start">
    <div class="slide_pictures">
      <div class="slide-track" :style="{ transform: `translateX(${trackOffset})` }">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-slide"
          :style="{ backgroundImage: `url('${banner.image}')` }"
          @click="handleSlideClick(banner)"
        >
          <div class="banner-text">{{ banner.title }}</div>
        </div>
      </div>
    </div>

    <div class="slide_dot">
      <span
        v-for="(banner, index) in banners"
        :key="`dot-${banner.id}`"
        class="dot"
        :class="{ active: index === currentIndex }"
        @click="handleSelect(index)"
      />
    </div>

    <button type="button" class="slide_left" aria-label="上一张" @click="handleStep(-1)">
      &lt;
    </button>
    <button type="button" class="slide_right" aria-label="下一张" @click="handleStep(1)">
      &gt;
    </button>
  </section>
</template>

<style scoped>
.slideshow_container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.slide_pictures {
  width: 100%;
  height: 100%;
}

.slide-track {
  display: flex;
  height: 100%;
  transition: transform var(--dur-slow) ease-in-out;
  will-change: transform;
}

.banner-slide {
  flex: 0 0 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.banner-text {
  color: var(--c-white);
  font-size: 3.5rem;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.3);
  padding: 16px 36px;
  border-radius: var(--radius);
}

.slide_left,
.slide_right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: var(--c-white);
  border: none;
  font-size: 1.8rem;
  padding: 12px 20px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--dur-fast);
  z-index: 10;
}

.slide_left:hover,
.slide_right:hover {
  background: rgba(0, 0, 0, 0.7);
}

.slide_left {
  left: 20px;
}

.slide_right {
  right: 20px;
}

.slide_dot {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--c-white-a50);
  border: 2px solid var(--c-white-a80);
  cursor: pointer;
  transition: background var(--dur-base), transform var(--dur-fast);
}

.dot.active {
  background: var(--c-white);
  transform: scale(1.3);
}
</style>
