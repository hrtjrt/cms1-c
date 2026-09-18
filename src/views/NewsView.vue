<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadSentinel from '@/components/common/LoadSentinel.vue'
import NewsCard from '@/components/news/NewsCard.vue'
import PageHero from '@/components/common/PageHero.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { fetchNewsList } from '@/api/news'
import { unwrap } from '@/utils/request'
import { useSiteStore } from '@/stores/site'
import type { NewsItem } from '@/types'

/* ==========================================================================
   新闻动态
   对应 hjc/news.html + js/news.js：
   无限滚动（每批 6 条）、热门文章前 5 条、侧栏联系方式、?id= 定位并高亮 2s
   ========================================================================== */

const PAGE_SIZE = 6
/** 目标新闻未出现在列表中时的轮询间隔，与原实现一致 */
const LOCATE_INTERVAL = 500
/** 高亮描边持续时间 */
const HIGHLIGHT_DURATION = 2000
const HOT_COUNT = 5

const route = useRoute()
const router = useRouter()
const site = useSiteStore()

const allNews = ref<NewsItem[]>([])
const highlightedId = ref<number | null>(null)
/** 是否已经完成过定位：避免后续滚动加载再次触发滚动定位 */
const located = ref(false)

const sentinelRef = ref<InstanceType<typeof LoadSentinel> | null>(null)
const sentinelEl = computed(() => sentinelRef.value?.root ?? null)

const { displayedItems, statusText, done, loadMore, reload } = useInfiniteScroll<NewsItem>({
  sentinel: sentinelEl,
  items: allNews,
  pageSize: PAGE_SIZE
})

const hotList = computed(() => allNews.value.slice(0, HOT_COUNT))

let locateTimer: number | null = null
let highlightTimer: number | null = null

function clearTimers(): void {
  if (locateTimer !== null) {
    window.clearTimeout(locateTimer)
    locateTimer = null
  }
  if (highlightTimer !== null) {
    window.clearTimeout(highlightTimer)
    highlightTimer = null
  }
}

/** 读取 URL 上的 ?id= */
function resolveTargetId(): number | null {
  const raw = route.query.id
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * 轮询加载直到目标新闻出现在列表中，然后滚动到视野中央并描边 2s。
 * 与原实现 loadUntilTarget() 的节奏一致（500ms 一轮）。
 */
function locateTarget(): void {
  const targetId = resolveTargetId()
  if (targetId === null || located.value) return

  if (displayedItems.value.some((item) => item.id === targetId)) {
    located.value = true
    highlightedId.value = targetId
    if (highlightTimer !== null) window.clearTimeout(highlightTimer)
    highlightTimer = window.setTimeout(() => {
      highlightTimer = null
      highlightedId.value = null
    }, HIGHLIGHT_DURATION)
    return
  }

  if (displayedItems.value.length < allNews.value.length) {
    if (locateTimer !== null) window.clearTimeout(locateTimer)
    locateTimer = window.setTimeout(() => {
      locateTimer = null
      loadMore()
    }, LOCATE_INTERVAL)
  }
}

watch(displayedItems, locateTarget)

// 路由上 id 变化时重新定位
watch(
  () => route.query.id,
  () => {
    clearTimers()
    located.value = false
    highlightedId.value = null
    locateTarget()
  }
)

function goToNews(id: number): void {
  router.push({ path: '/news', query: { id: String(id) } })
}

onMounted(async () => {
  allNews.value = await unwrap(fetchNewsList())
  reload()
  locateTarget()
})

onBeforeUnmount(clearTimers)
</script>

<template>
  <main class="news-page">
    <PageHero
      title="新闻动态"
      subtitle="NEWS & EVENTS"
      image="https://picsum.photos/1920/600?random=400&blur=3"
      height="380px"
      height-sm="280px"
      mask="rgba(26, 42, 58, 0.6)"
    />

    <section class="news-page-section">
      <div class="container">
        <div class="news-layout">
          <!-- 左侧：新闻列表 -->
          <div class="news-main">
            <div class="news-list">
              <NewsCard
                v-for="item in displayedItems"
                :key="item.id"
                :news="item"
                :highlight="highlightedId === item.id"
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
