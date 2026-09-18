<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HomeSlider from '@/components/home/HomeSlider.vue'
import HomeProductStage from '@/components/home/HomeProductStage.vue'
import HomeNewsPanel from '@/components/home/HomeNewsPanel.vue'
import { fetchBanners, fetchHomeNews, fetchHomeProducts } from '@/api/home'
import { unwrap } from '@/utils/request'
import type { Banner, HomeProduct, NewsPreview } from '@/types'

/* 首页：三个模块整体对应 hjc/index.html + js/home.js */

const banners = ref<Banner[]>([])
const homeProducts = ref<HomeProduct[]>([])
const homeNews = ref<NewsPreview[]>([])

onMounted(async () => {
  const [bannerData, productData, newsData] = await Promise.all([
    unwrap(fetchBanners()),
    unwrap(fetchHomeProducts()),
    unwrap(fetchHomeNews())
  ])
  banners.value = bannerData
  homeProducts.value = productData
  homeNews.value = newsData
})
</script>

<template>
  <main class="home-page">
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
