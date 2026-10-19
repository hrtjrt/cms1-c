<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadSentinel from '@/components/common/LoadSentinel.vue'
import NewsCard from '@/components/news/NewsCard.vue'
import PageHero from '@/components/common/PageHero.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { fetchNewsList } from '@/api/news'
import { useSiteStore } from '@/stores/site'
import type { NewsItem, PageHeroConfig } from '@/types'

/* ==========================================================================
   新闻动态
   对应 hjc/news.html + js/news.js：无限滚动（每批 6 条）+ 热门文章 + 侧栏联系方式

   v2 的变化：
     · 数据来自 /api/public/news（一次性取全，前端继续用它做分批渲染）
     · 热门文章改成「置顶新闻」（isTop = 1），语义比「取前 5 条」明确
     · 点击卡片跳到 /news/:id 详情页，不再做 ?id= 定位高亮（已有正文可看）
   ========================================================================== */

const PAGE_SIZE = 6

const router = useRouter()
const site = useSiteStore()

const allNews = ref<NewsItem[]>([])
const hero = ref<PageHeroConfig | null>(null)
const failed = ref(false)

const sentinelRef = ref<InstanceType<typeof LoadSentinel> | null>(null)
const sentinelEl = computed(() => sentinelRef.value?.root ?? null)

const { displayedItems, statusText, done, reload } = useInfiniteScroll<NewsItem>({
  sentinel: sentinelEl,
  items: allNews,
  pageSize: PAGE_SIZE
})

/** 热门文章 = 置顶新闻；没有置顶时退化为最新 5 条 */
const hotList = computed(() => {
  const top = allNews.value.filter((item) => item.isTop === 1)
  return (top.length > 0 ? top : allNews.value).slice(0, 5)
})

/** 页面 Banner 文案来自后台的「页面 Banner」配置 */
const heroProps = computed(() => ({
  title: hero.value?.title || '新闻动态',
  subtitle: hero.value?.subtitle || 'NEWS & EVENTS',
  image: hero.value?.image || '',
  height: hero.value?.height || '380px',
  heightSm: hero.value?.heightSm || '280px',
  mask: hero.value?.mask || 'rgba(26, 42, 58, 0.6)'
}))

function goToNews(id: number): void {
  void router.push('/news/' + id)
}

onMounted(async () => {
  hero.value = await site.loadPageHero('news')
  try {
    allNews.value = await fetchNewsList()
  } catch {
    failed.value = true
  }
  reload()
})
</script>

<template>
  <main class="news-page">
    <PageHero v-bind="heroProps" />

    <section class="news-page-section">
      <div class="container">
        <div v-if="failed" class="offline-tip">
          数据加载失败：请确认后端服务已启动（默认 http://localhost:3000）
        </div>

        <div class="news-layout">
          <!-- 左侧：新闻列表 -->
          <div class="news-main">
            <div class="news-list">
              <NewsCard
                v-for="item in displayedItems"
                :key="item.id"
                :news="item"
                @select="goToNews"
              />
            </div>

            <LoadSentinel ref="sentinelRef" :status-text="statusText" :done="done" />
          </div>

          <!-- 右侧边栏 -->
          <aside class="news-sidebar">
            <h3 class="sidebar-title">热门文章</h3>
            <ul class="hot-list">
              <li v-for="item in hotList" :key="item.id" @click="goToNews(item.id)">
                {{ item.title }}
              </li>
            </ul>

            <h3 class="sidebar-title contact-title">联系我们</h3>
            <div class="sidebar-contact">
              <p>📞 {{ site.contact.phoneMain }}</p>
              <p>✉️ {{ site.contact.email }}</p>
              <p>📍 {{ site.contact.addressShort }}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.news-page-section {
  padding: 60px 0;
  background: var(--c-bg-soft);
}

.offline-tip {
  background: #fff4e6;
  color: #b45309;
  border: 1px solid #ffe0b2;
  border-radius: var(--radius);
  padding: 10px 16px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.news-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* 左侧新闻列表 */
.news-main {
  flex: 1;
  min-width: 0;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 右侧边栏 */
.news-sidebar {
  flex: 0 0 280px;
  position: sticky;
  top: 120px;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--c-ink);
  padding-left: 12px;
  border-left: 4px solid var(--c-primary);
  margin-bottom: 18px;
}

.contact-title {
  margin-top: 32px;
}

.hot-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.hot-list li {
  padding: 16px 18px;
  font-size: 0.92rem;
  color: var(--c-text);
  cursor: pointer;
  transition: all var(--dur) var(--ease);
  line-height: 1.5;
}

.hot-list li:hover {
  background: var(--c-primary-hover);
  color: var(--c-primary);
  padding-left: 24px;
}

.hot-list li + li {
  border-top: 1px solid var(--c-line-softer);
}

.hot-list li::before {
  content: '· ';
  color: var(--c-primary);
  font-weight: bold;
  margin-right: 4px;
}

.sidebar-contact {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.sidebar-contact p {
  font-size: 0.9rem;
  color: var(--c-text-sub);
  line-height: 2;
}

/* 响应式 */
@media (max-width: 900px) {
  .news-layout {
    flex-direction: column;
  }

  .news-sidebar {
    position: static;
    flex: none;
    width: 100%;
  }
}
</style>
