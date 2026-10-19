<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchNewsDetail, fetchNewsList } from '@/api/news'
import { assetUrl, resolveHtmlAssets, RequestError } from '@/utils/request'
import type { NewsItem } from '@/types'

/* ==========================================================================
   新闻详情页  /news/:id

   v2 新增。原先「阅读全文」只是回到列表页做 ?id= 定位高亮 —— 因为没有正文
   可看。现在后台可以编辑新闻正文（content），前台用详情页真正展示。

   正文为空时给出兜底文案，而不是留一片空白（种子数据全部带正文，
   但后台允许存草稿 / 不填正文，所以这个分支必须处理）。
   ========================================================================== */

const route = useRoute()
const router = useRouter()

const news = ref<NewsItem | null>(null)
const loading = ref(true)
const notFound = ref(false)
const failed = ref(false)

/** 同列表里的上一条 / 下一条（便于连续阅读） */
const prev = ref<NewsItem | null>(null)
const next = ref<NewsItem | null>(null)

const contentHtml = computed(() => resolveHtmlAssets(news.value?.content ?? ''))
const hasContent = computed(() => contentHtml.value.trim().length > 0)

function resolveId(): number {
  const raw = route.params.id
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

async function load(): Promise<void> {
  const id = resolveId()
  if (!id) {
    notFound.value = true
    loading.value = false
    return
  }

  loading.value = true
  notFound.value = false
  failed.value = false
  prev.value = null
  next.value = null

  try {
    news.value = await fetchNewsDetail(id)
  } catch (error) {
    news.value = null
    if (error instanceof RequestError && error.status === 404) notFound.value = true
    else failed.value = true
    loading.value = false
    return
  }

  loading.value = false

  // 上下篇：拉一次列表（30 条）在本地算，失败不影响正文
  try {
    const list = await fetchNewsList()
    const index = list.findIndex((item) => item.id === id)
    if (index >= 0) {
      prev.value = index < list.length - 1 ? (list[index + 1] as NewsItem) : null
      next.value = index > 0 ? (list[index - 1] as NewsItem) : null
    }
  } catch {
    /* 忽略 */
  }

  document.title = `${news.value?.title ?? '新闻详情'} - ${document.title.split(' - ').pop() ?? ''}`
}

function goNews(id: number): void {
  void router.push('/news/' + id)
}

function goList(): void {
  void router.push('/news')
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<template>
  <main class="detail-page">
    <div class="container">
      <div v-if="loading" class="state-box">加载中…</div>

      <div v-else-if="notFound" class="state-box">
        <h2>新闻不存在或未发布</h2>
        <p>这条新闻可能已被删除，或者还处于草稿状态。</p>
        <button type="button" class="btn-primary" @click="goList">返回新闻动态</button>
      </div>

      <div v-else-if="failed" class="state-box">
        <h2>数据加载失败</h2>
        <p>请确认后端服务已启动（默认 http://localhost:3000）。</p>
        <button type="button" class="btn-primary" @click="load">重试</button>
      </div>

      <template v-else-if="news">
        <nav class="breadcrumb">
          <span class="link" @click="goList">新闻动态</span>
          <span class="sep">/</span>
          <span class="current">正文</span>
        </nav>

        <article class="article">
          <header class="article-head">
            <h1 class="article-title">{{ news.title }}</h1>
            <div class="article-meta">
              <span>📅 {{ news.date }}</span>
              <span v-if="news.isTop === 1" class="top-flag">置顶</span>
            </div>
          </header>

          <img class="article-cover" :src="assetUrl(news.image)" :alt="news.title" />

          <p v-if="news.summary" class="article-lead">{{ news.summary }}</p>

          <div v-if="hasContent" class="rich-content" v-html="contentHtml" />
          <p v-else class="article-empty">
            这条新闻暂无正文内容，如有疑问欢迎通过「联系我们」与我们沟通。
          </p>

          <footer class="article-foot">
            <button type="button" class="btn-ghost" @click="goList">← 返回新闻动态</button>
          </footer>
        </article>

        <nav v-if="prev || next" class="article-nav">
          <div
            v-if="prev"
            class="nav-item"
            @click="goNews(prev.id)"
          >
            <div class="nav-label">上一篇</div>
            <div class="nav-title">{{ prev.title }}</div>
          </div>
          <div v-else class="nav-item disabled">
            <div class="nav-label">上一篇</div>
            <div class="nav-title">已经是第一篇</div>
          </div>

          <div
            v-if="next"
            class="nav-item align-end"
            @click="goNews(next.id)"
          >
            <div class="nav-label">下一篇</div>
            <div class="nav-title">{{ next.title }}</div>
          </div>
          <div v-else class="nav-item align-end disabled">
            <div class="nav-label">下一篇</div>
            <div class="nav-title">已经是最后一篇</div>
          </div>
        </nav>
      </template>
    </div>
  </main>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: calc(var(--nav-h, 100px) + 32px) 0 60px;
  background: var(--c-bg-soft);
}

.state-box {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  padding: 60px 24px;
  text-align: center;
  color: var(--c-text-weak);
}

.state-box h2 {
  font-size: 1.3rem;
  color: var(--c-ink);
  margin-bottom: 10px;
}

.state-box p {
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--c-text-weak);
  margin-bottom: 20px;
}

.breadcrumb .link {
  cursor: pointer;
  color: var(--c-primary);
}

.breadcrumb .link:hover {
  text-decoration: underline;
}

.breadcrumb .sep {
  color: var(--c-line);
}

.article {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  padding: 40px 48px 32px;
  box-shadow: var(--shadow-card);
  max-width: 900px;
  margin: 0 auto;
}

.article-head {
  text-align: center;
  margin-bottom: 24px;
}

.article-title {
  font-size: 1.75rem;
  color: var(--c-ink);
  line-height: 1.4;
  margin-bottom: 14px;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  font-size: 0.85rem;
  color: var(--c-text-faint);
}

.top-flag {
  color: var(--c-danger);
  border: 1px solid var(--c-danger);
  border-radius: var(--radius-xs);
  padding: 0 6px;
  font-size: 0.75rem;
}

.article-cover {
  width: 100%;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  background: var(--c-skeleton);
  display: block;
}

.article-lead {
  font-size: 1rem;
  color: var(--c-text-sub);
  line-height: 1.9;
  padding: 14px 18px;
  background: var(--c-bg-softer);
  border-left: 3px solid var(--c-primary);
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
}

.article-empty {
  color: var(--c-text-faint);
  line-height: 1.9;
}

.rich-content {
  line-height: 1.95;
  color: var(--c-text);
}

.rich-content :deep(p) {
  margin-bottom: 16px;
}

.rich-content :deep(h2),
.rich-content :deep(h3) {
  margin: 26px 0 12px;
  color: var(--c-ink);
  font-size: 1.12rem;
  padding-left: 10px;
  border-left: 3px solid var(--c-primary);
  line-height: 1.3;
}

.rich-content :deep(ul),
.rich-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.rich-content :deep(li) {
  margin-bottom: 8px;
}

.rich-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius);
  margin: 10px 0;
}

.rich-content :deep(a) {
  color: var(--c-primary);
}

.rich-content :deep(blockquote) {
  margin: 16px 0;
  padding: 10px 18px;
  background: var(--c-bg-soft);
  border-left: 3px solid var(--c-line);
  color: var(--c-text-weak);
}

.article-foot {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--c-line-softer);
}

.btn-primary,
.btn-ghost {
  padding: 11px 28px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--dur) var(--ease);
}

.btn-primary {
  background: var(--c-primary);
  color: var(--c-white);
}

.btn-primary:hover {
  background: var(--c-primary-dark);
}

.btn-ghost {
  background: var(--c-bg);
  color: var(--c-text-sub);
  border-color: var(--c-line);
}

.btn-ghost:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}

.article-nav {
  display: flex;
  gap: 20px;
  max-width: 900px;
  margin: 20px auto 0;
}

.nav-item {
  flex: 1;
  min-width: 0;
  background: var(--c-bg);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: transform var(--dur) var(--ease);
}

.nav-item:hover {
  transform: var(--hover-lift-sm);
}

.nav-item.disabled {
  cursor: default;
  color: var(--c-text-faint);
  box-shadow: none;
}

.nav-item.disabled:hover {
  transform: none;
}

.nav-item.align-end {
  text-align: right;
}

.nav-label {
  font-size: 0.78rem;
  color: var(--c-text-faint);
  margin-bottom: 6px;
}

.nav-title {
  font-size: 0.92rem;
  color: var(--c-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .article {
    padding: 24px 20px;
  }

  .article-title {
    font-size: 1.3rem;
  }

  .article-nav {
    flex-direction: column;
  }
}
</style>
