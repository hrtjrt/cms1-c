<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoPlay } from '@/composables/useAutoPlay'
import { assetUrl } from '@/utils/request'
import type { Product } from '@/types'

/* ==========================================================================
   模块2：产品介绍舞台
   行为搬运自 hjc/js/home.js 模块2：
   - 中间卡片 current、左右相邻 side-left / side-right、其余 hidden
   - 3.5s 自动轮播，悬停暂停
   - 点击中间卡片进入该商品的详情页；点击两侧卡片先切到中间
   数据来自 /api/public/home 的 products（show_on_homepage = 1 的那 5 件）
   ========================================================================== */

const props = defineProps<{ products: Product[] }>()

const PRODUCT_INTERVAL = 3500

const router = useRouter()
const currentIndex = ref(0)

/**
 * 计算每张卡片相对当前中心位置的偏移量，并归一化到 [-total/2, total/2]，
 * 与原实现 updateProductClasses() 的逻辑一致。
 */
const items = computed(() => {
  const total = props.products.length
  return props.products.map((product, index) => {
    let diff = index - currentIndex.value
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    let state = 'hidden'
    if (diff === 0) state = 'current'
    else if (diff === -1) state = 'side-left'
    else if (diff === 1) state = 'side-right'

    return { product, index, state }
  })
})

const nextProduct = (): void => {
  currentIndex.value = (currentIndex.value + 1) % props.products.length
}

const { start, stop } = useAutoPlay(nextProduct, PRODUCT_INTERVAL)

function handleClick(item: { product: Product; index: number; state: string }): void {
  if (item.state === 'current') {
    // v2：直接进入商品详情页（原实现只能跳到产品中心并带上分类）
    router.push('/products/' + item.product.id)
    return
  }
  if (item.index === currentIndex.value) return
  currentIndex.value = item.index
  start()
}
</script>

<template>
  <div class="product-stage" @mouseenter="stop" @mouseleave="start">
    <div
      v-for="item in items"
      :key="item.product.id"
      class="product-item"
      :class="item.state"
      :style="{ backgroundImage: `url('${assetUrl(item.product.image)}')` }"
      @click="handleClick(item)"
    >
      <div class="product-overlay">
        <h3>{{ item.product.name }}</h3>
        <p>{{ item.product.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-stage {
  position: relative;
  width: 100%;
  max-width: var(--container-w);
  height: 520px;
  margin: 0 auto;
  perspective: 1400px;
  perspective-origin: center center;
}

.product-item {
  position: absolute;
  top: 50%;
  left: 50%;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.product-item.current {
  width: 46%;
  height: 100%;
  transform: translate(-50%, -50%) translateZ(100px);
  z-index: 3;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  opacity: 1;
}

.product-item.side-left,
.product-item.side-right {
  width: 30%;
  height: 76%;
  z-index: 2;
  opacity: 0.8;
}

.product-item.side-left {
  transform: translate(-180%, -50%) translateZ(-220px) scale(0.92);
  transform-origin: right center;
}

.product-item.side-right {
  transform: translate(80%, -50%) translateZ(-220px) scale(0.92);
  transform-origin: left center;
}

.product-item.side-left:hover,
.product-item.side-right:hover {
  opacity: 1;
}

.product-item.hidden {
  width: 30%;
  height: 76%;
  transform: translate(-50%, -50%) translateZ(-600px) scale(0.4);
  z-index: 0;
  opacity: 0;
  pointer-events: none;
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px;
  color: var(--c-white);
}

.product-overlay h3 {
  font-size: 1.1rem;
}

.product-overlay p {
  display: none;
}

.current .product-overlay h3 {
  font-size: 1.6rem;
  margin-bottom: 8px;
}

.current .product-overlay p {
  font-size: 1rem;
  opacity: 0.9;
  display: block;
}

@media (max-width: 900px) {
  .product-item.current {
    width: 60%;
    height: 340px;
  }
}

@media (max-width: 600px) {
  .product-item.current {
    width: 90%;
  }
}
</style>
