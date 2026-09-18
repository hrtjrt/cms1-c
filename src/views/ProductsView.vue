<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadSentinel from '@/components/common/LoadSentinel.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useSiteStore } from '@/stores/site'
import { fetchProducts } from '@/api/product'
import { unwrap } from '@/utils/request'
import type { Product } from '@/types'

/* ==========================================================================
   产品中心
   对应 hjc/products.html + js/products.js：
   分类筛选（支持 ?category= 预选）、关键词搜索（防抖 300ms）、无限滚动（每批 8 件）
   ========================================================================== */

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE = 300
const ALL = 'all'

const route = useRoute()
const site = useSiteStore()

const allProducts = ref<Product[]>([])
const category = ref<string>(ALL)
const searchInput = ref('')
const keyword = ref('')

const sentinelRef = ref<InstanceType<typeof LoadSentinel> | null>(null)
const sentinelEl = computed(() => sentinelRef.value?.root ?? null)

const filteredProducts = computed<Product[]>(() =>
  allProducts.value.filter((product) => {
    const matchCategory = category.value === ALL || product.category === category.value
    const matchKeyword =
      !keyword.value || product.name.toLowerCase().includes(keyword.value.toLowerCase())
    return matchCategory && matchKeyword
  })
)

const { displayedItems, statusText, done, reload } = useInfiniteScroll<Product>({
  sentinel: sentinelEl,
  items: filteredProducts,
  pageSize: PAGE_SIZE
})

const pageTitle = computed(
  () => site.categoryOptions.find((item) => item.value === category.value)?.label ?? '全部产品'
)

const productsCount = computed(() => `共 ${filteredProducts.value.length} 件产品`)

/* ---------- 搜索防抖 ---------- */
let searchTimer: number | null = null
watch(searchInput, (value) => {
  if (searchTimer !== null) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    searchTimer = null
    keyword.value = value.trim()
  }, SEARCH_DEBOUNCE)
})

/* ---------- 筛选变化后重新加载 ---------- */
watch([category, keyword], () => {
  reload()
})

function selectCategory(value: string): void {
  if (category.value === value) return
  category.value = value
  // 与原实现一致：切换分类后回到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 读取 URL 上的 ?category=，仅接受已存在的分类 */
function resolveInitialCategory(): string {
  const raw = route.query.category
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value === 'string' && site.categoryOptions.some((item) => item.value === value)) {
    return value
  }
  return ALL
}

onMounted(async () => {
  allProducts.value = await unwrap(fetchProducts())
  category.value = resolveInitialCategory()
  reload()
})

onBeforeUnmount(() => {
  if (searchTimer !== null) window.clearTimeout(searchTimer)
})
</script>

<template>
  <main class="products-page">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="search-box">
        <input v-model="searchInput" type="text" placeholder="搜索产品..." />
        <button type="button" class="search-btn" aria-label="搜索">🔍</button>
      </div>

      <h3 class="sidebar-title">产品分类</h3>
      <ul class="category-list">
        <li
          v-for="item in site.categoryOptions"
          :key="item.value"
          :class="{ active: category === item.value }"
          :data-category="item.value"
          @click="selectCategory(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
    </aside>

    <!-- 右侧产品区 -->
    <section class="products-main">
      <div class="products-header">
        <h2 class="page-title">{{ pageTitle }}</h2>
        <span class="products-count">{{ productsCount }}</span>
      </div>

      <div class="products-grid">
        <ProductCard v-for="product in displayedItems" :key="product.id" :product="product" />
        <div v-if="filteredProducts.length === 0" class="empty-state">
          没有找到符合条件的产品，换个关键词试试～
        </div>
      </div>

      <LoadSentinel ref="sentinelRef" :status-text="statusText" :done="done" />
    </section>
  </main>
</template>

<style scoped>
.products-page {
  display: flex;
  gap: 32px;
  max-width: var(--container-wide);
  margin: 0 auto;
  padding: 130px 5% 60px;
  min-height: 100vh;
  background: var(--c-bg-soft);
}

/* 左侧边栏 */
.sidebar {
  flex: 0 0 240px;
  position: sticky;
  top: 120px;
  height: fit-content;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}

.search-box {
  position: relative;
  margin-bottom: 28px;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  font-size: 0.95rem;
  background: var(--c-bg);
  outline: none;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}

.search-box input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-a10);
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  color: var(--c-text-label);
}

.sidebar-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--c-text-weak);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  padding-left: 12px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--c-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-list li {
  padding: 14px 18px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--c-text);
  border-left: 3px solid transparent;
  transition: all var(--dur) var(--ease);
  position: relative;
}

.category-list li:hover {
  background: var(--c-primary-hover);
  color: var(--c-primary);
}

.category-list li.active {
  background: var(--c-primary-soft);
  color: var(--c-primary);
  border-left-color: var(--c-primary);
  font-weight: 600;
}

.category-list li + li {
  border-top: 1px solid var(--c-line-softer);
}

/* 右侧产品区 */
.products-main {
  flex: 1;
  min-width: 0;
}

.products-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--c-ink);
}

.products-count {
  font-size: 0.9rem;
  color: var(--c-text-weak);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--c-text-faint);
  font-size: 1rem;
}

/* 响应式 */
@media (max-width: 900px) {
  .products-page {
    flex-direction: column;
    padding: 120px 4% 40px;
  }

  .sidebar {
    position: static;
    flex: none;
    max-height: none;
    overflow: visible;
  }

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  .category-list li {
    border-radius: 20px;
    border: 1px solid var(--c-line);
    padding: 8px 16px;
    font-size: 0.85rem;
    border-left: 1px solid var(--c-line);
  }

  .category-list li.active {
    border-color: var(--c-primary);
  }

  .category-list li + li {
    border-top: 1px solid var(--c-line);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }

  .page-title {
    font-size: 1.2rem;
  }
}
</style>
