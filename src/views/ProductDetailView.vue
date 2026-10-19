<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProductDetail, fetchProducts } from '@/api/product'
import { assetUrl, resolveHtmlAssets, RequestError } from '@/utils/request'
import type { Product } from '@/types'

/* ==========================================================================
   商品详情页  /products/:id

   v2 新增：原先商品卡片只是展示，点击没有任何行为（CSS 写了 cursor:pointer
   但没有绑定事件），商品详情字段也不存在。现在补齐了详情页与 detail 正文。

   数据只来自公开接口，商品未上产品中心 / 已停用时后端直接 404，
   页面给出「商品不存在或已下架」的兜底而不是空白。
   ========================================================================== */

const route = useRoute()
const router = useRouter()

const product = ref<Product | null>(null)
const related = ref<Product[]>([])
const loading = ref(true)
const notFound = ref(false)

/** 详情正文是富文本，展示前补全相对资源地址 */
const detailHtml = computed(() => resolveHtmlAssets(product.value?.detail ?? ''))

const hasDetail = computed(() => detailHtml.value.trim().length > 0)

function formatPrice(value: number): string {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 读取路由参数里的 id */
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

  try {
    product.value = await fetchProductDetail(id)
  } catch (error) {
    product.value = null
    notFound.value = error instanceof RequestError && error.status === 404
    loading.value = false
    return
  }

  loading.value = false

  // 详情页标题带上商品名（与 NewsDetailView 同一口径），
  // 否则会一直停留在路由 meta 的「商品详情 - 公司官网」
  document.title = `${product.value?.name ?? '商品详情'} - ${document.title.split(' - ').pop() ?? ''}`

  // 同分类的其他商品作为「相关产品」；失败不影响主内容
  try {
    const all = await fetchProducts()
    related.value = all
      .filter((item) => item.categoryId === product.value?.categoryId && item.id !== id)
      .slice(0, 4)
  } catch {
    related.value = []
  }
}

function goToProduct(id: number): void {
  void router.push('/products/' + id)
}

function goProducts(): void {
  void router.push('/products')
}

function goCategory(): void {
  const category = product.value?.category
  void router.push(category ? { path: '/products', query: { category } } : '/products')
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<template>
  <main class="detail-page">
    <div class="container">
      <div v-if="loading" class="state-box">加载中…</div>

      <div v-else-if="notFound" class="state-box">
        <h2>商品不存在或已下架</h2>
        <p>该商品可能已从产品中心下架，或者链接不正确。</p>
        <button type="button" class="btn-primary" @click="goProducts">返回产品中心</button>
      </div>

      <template v-else-if="product">
        <!-- 面包屑 -->
        <nav class="breadcrumb">
          <span class="link" @click="goProducts">产品中心</span>
          <span class="sep">/</span>
          <span class="link" @click="goCategory">{{ product.category }}</span>
          <span class="sep">/</span>
          <span class="current">{{ product.name }}</span>
        </nav>

        <!-- 主体 -->
        <section class="detail-main">
          <div class="detail-image">
            <img :src="assetUrl(product.image)" :alt="product.name" />
          </div>

          <div class="detail-info">
            <span class="detail-category">{{ product.category }}</span>
            <h1 class="detail-name">{{ product.name }}</h1>
            <p v-if="product.description" class="detail-desc">{{ product.description }}</p>

            <div class="detail-price">
              <span class="price-label">参考价</span>
              <span class="price-value">¥{{ formatPrice(product.price) }}</span>
            </div>

            <ul class="detail-meta">
              <li><span>所属分类</span>{{ product.category }}</li>
              <li><span>产品编号</span>NO.{{ String(product.id).padStart(3, '0') }}</li>
              <li><span>供货状态</span>{{ product.status === 1 ? '在售' : '暂停供货' }}</li>
            </ul>

            <div class="detail-actions">
              <button type="button" class="btn-primary" @click="router.push('/contact')">
                咨询报价
              </button>
              <button type="button" class="btn-ghost" @click="goProducts">返回列表</button>
            </div>
          </div>
        </section>

        <!-- 详情正文 -->
        <section class="detail-body">
          <h2 class="body-title">产品详情</h2>
          <div v-if="hasDetail" class="rich-content" v-html="detailHtml" />
          <p v-else class="body-empty">
            该商品暂未填写详细介绍，如需了解参数与报价请通过「联系我们」与我们沟通。
          </p>
        </section>

        <!-- 相关产品 -->
        <section v-if="related.length > 0" class="detail-related">
          <h2 class="body-title">相关产品</h2>
          <div class="related-grid">
            <div
              v-for="item in related"
              :key="item.id"
              class="related-card"
              @click="goToProduct(item.id)"
            >
              <img :src="assetUrl(item.image)" :alt="item.name" loading="lazy" />
              <div class="related-name">{{ item.name }}</div>
              <div class="related-price">¥{{ formatPrice(item.price) }}</div>
            </div>
          </div>
        </section>
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
  flex-wrap: wrap;
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

.breadcrumb .current {
  color: var(--c-text-sub);
}

.detail-main {
  display: flex;
  gap: 40px;
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.detail-image {
  flex: 0 0 420px;
}

.detail-image img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--c-skeleton);
  display: block;
}

.detail-info {
  flex: 1;
  min-width: 0;
}

.detail-category {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  padding: 3px 12px;
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
}

.detail-name {
  font-size: 1.7rem;
  color: var(--c-ink);
  margin-bottom: 10px;
  line-height: 1.3;
}

.detail-desc {
  color: var(--c-text-weak);
  margin-bottom: 18px;
  line-height: 1.7;
}

.detail-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid var(--c-line-softer);
  border-bottom: 1px solid var(--c-line-softer);
  margin-bottom: 18px;
}

.price-label {
  font-size: 0.85rem;
  color: var(--c-text-faint);
}

.price-value {
  font-size: 1.9rem;
  font-weight: bold;
  color: var(--c-danger);
}

.detail-meta {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: grid;
  gap: 10px;
}

.detail-meta li {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--c-text-sub);
}

.detail-meta li span {
  flex: 0 0 72px;
  color: var(--c-text-faint);
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.detail-body,
.detail-related {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  padding: 32px;
  margin-top: 24px;
  box-shadow: var(--shadow-card);
}

.body-title {
  font-size: 1.15rem;
  color: var(--c-ink);
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid var(--c-primary);
  line-height: 1.2;
}

.body-empty {
  color: var(--c-text-faint);
  line-height: 1.8;
}

.rich-content {
  line-height: 1.9;
  color: var(--c-text-sub);
}

.rich-content :deep(p) {
  margin-bottom: 14px;
}

.rich-content :deep(h2),
.rich-content :deep(h3) {
  margin: 22px 0 12px;
  color: var(--c-ink);
  font-size: 1.05rem;
}

.rich-content :deep(ul),
.rich-content :deep(ol) {
  padding-left: 22px;
  margin-bottom: 14px;
}

.rich-content :deep(li) {
  margin-bottom: 6px;
}

.rich-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius);
  margin: 8px 0;
}

.rich-content :deep(a) {
  color: var(--c-primary);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.related-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--c-bg-soft);
  transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}

.related-card:hover {
  transform: var(--hover-lift-sm);
  box-shadow: var(--shadow-hover);
}

.related-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.related-name {
  padding: 10px 12px 4px;
  font-size: 0.9rem;
  color: var(--c-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-price {
  padding: 0 12px 12px;
  font-size: 0.9rem;
  color: var(--c-danger);
  font-weight: 600;
}

@media (max-width: 900px) {
  .detail-main {
    flex-direction: column;
    gap: 24px;
    padding: 20px;
  }

  .detail-image {
    flex: none;
  }

  .detail-name {
    font-size: 1.35rem;
  }
}
</style>
