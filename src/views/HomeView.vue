<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HomeSlider from '@/components/home/HomeSlider.vue'
import HomeProductStage from '@/components/home/HomeProductStage.vue'
import HomeNewsPanel from '@/components/home/HomeNewsPanel.vue'
import { fetchHomeData } from '@/api/home'
import type { Banner, NewsItem, Product } from '@/types'

/* 首页：三个模块整体对应 hjc/index.html + js/home.js
   数据来自聚合接口 /api/public/home，一次请求拿全（轮播图 + 首页产品位 + 最新新闻）*/

/** 首页新闻位固定展示 5 条（与 hjc 首页「新闻资讯」模块的条数一致） */
const HOME_NEWS_LIMIT = 5

const banners = ref<Banner[]>([])
const homeProducts = ref<Product[]>([])
const homeNews = ref<NewsItem[]>([])
const failed = ref(false)

onMounted(async () => {
  try {
    const data = await fetchHomeData()
    banners.value = data.banners
    homeProducts.value = data.products
    // 聚合接口给的是最新 6 条（新闻列表页每批也是 6 条），首页只取前 5 条
    homeNews.value = data.news.slice(0, HOME_NEWS_LIMIT)
  } catch {
    // 后端未启动时保持空数据，页面骨架仍在，不会白屏
    failed.value = true
  }
})
</script>

<template>
  <main class="home-page">
    <div v-if="failed" class="offline-tip">
      数据加载失败：请确认后端服务已启动（默认 http://localhost:3000）
    </div>

    <HomeSlider :banners="banners" />

    <section class="section products-section">
      <h2 class="section-title">我们的产品</h2>
      <HomeProductStage :products="homeProducts" />
    </section>

    <section class="section news-section">
      <h2 class="section-title">新闻资讯</h2>
      <HomeNewsPanel :news="homeNews" />
    </section>
  </main>
</template>

<style scoped>
.offline-tip {
  background: #fff4e6;
  color: #b45309;
  border-bottom: 1px solid #ffe0b2;
  padding: 10px 5%;
  font-size: 14px;
  text-align: center;
  margin-top: var(--nav-h);
}

.section {
  padding: var(--gap-section, 80px) 0;
  background: var(--c-bg);
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--c-ink);
  margin-bottom: 40px;
  padding-left: 8%;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 4%;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 28px;
  background: var(--c-primary);
  border-radius: var(--radius-xs);
}

.products-section {
  background: var(--c-bg-soft);
}

.news-section {
  background: var(--c-bg);
}

@media (max-width: 600px) {
  .section-title {
    padding-left: 12%;
    font-size: 1.5rem;
  }

  .section-title::before {
    left: 6%;
  }
}
</style>
