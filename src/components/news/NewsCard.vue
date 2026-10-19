<script setup lang="ts">
import { assetUrl } from '@/utils/request'
import type { NewsItem } from '@/types'

/* ==========================================================================
   新闻卡片 —— 对应 hjc/js/news.js 里 renderNewsCard() 生成的 DOM

   v2 起整卡可点击，emit('select', id) 由列表页跳转到新闻详情页
   （原实现是跳回本列表做 ?id= 定位高亮，因为当时没有详情页）
   ========================================================================== */

defineProps<{ news: NewsItem }>()

const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <article class="news-card" :data-news-id="news.id" @click="emit('select', news.id)">
    <div class="news-card-image">
      <img :src="assetUrl(news.image)" :alt="news.title" loading="lazy" />
    </div>
    <div class="news-card-body">
      <div class="news-card-date">{{ news.date }}</div>
      <h3 class="news-card-title">{{ news.title }}</h3>
      <p class="news-card-summary">{{ news.summary }}</p>
      <div class="news-card-more">阅读全文</div>
    </div>
  </article>
</template>

<style scoped>
.news-card {
  display: flex;
  gap: 24px;
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
  animation: cardFadeIn 0.4s var(--ease);
}

.news-card:hover {
  transform: var(--hover-lift-sm);
  box-shadow: var(--shadow-hover);
}

.news-card-image {
  flex: 0 0 260px;
  overflow: hidden;
}

.news-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--dur-slow) var(--ease);
}

.news-card:hover .news-card-image img {
  transform: scale(1.06);
}

.news-card-body {
  flex: 1;
  padding: 24px 24px 24px 0;
  display: flex;
  flex-direction: column;
}

.news-card-date {
  font-size: 0.85rem;
  color: var(--c-primary);
  font-weight: 600;
  margin-bottom: 10px;
}

.news-card-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--c-ink);
  margin-bottom: 12px;
  line-height: 1.4;
  transition: color var(--dur-base);
}

.news-card:hover .news-card-title {
  color: var(--c-primary);
}

.news-card-summary {
  color: var(--c-text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.news-card-more {
  margin-top: auto;
  color: var(--c-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

.news-card-more::after {
  content: ' →';
  transition: margin-left var(--dur-base);
}

.news-card:hover .news-card-more::after {
  margin-left: 6px;
}

@media (max-width: 600px) {
  .news-card {
    flex-direction: column;
  }

  .news-card-image {
    flex: none;
    height: 180px;
  }

  .news-card-body {
    padding: 18px;
  }

  .news-card-title {
    font-size: 1.1rem;
  }
}
</style>
