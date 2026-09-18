<script setup lang="ts">
import type { Product } from '@/types'

/* ==========================================================================
   产品卡片 —— 对应 hjc/js/products.js 里 renderProductCard() 生成的 DOM
   ========================================================================== */

defineProps<{ product: Product }>()
</script>

<template>
  <article class="product-card">
    <img class="product-image" :src="product.image" :alt="product.name" loading="lazy" />
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <span class="product-category">{{ product.category }}</span>
      <div class="product-price">¥{{ product.price }}</div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
  animation: cardFadeIn 0.4s var(--ease);
}

.product-card:hover {
  transform: var(--hover-lift);
  box-shadow: var(--shadow-hover);
}

.product-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  background: var(--c-skeleton);
}

.product-info {
  padding: 14px 16px 18px;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-ink);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--c-primary);
  background: var(--c-primary-soft);
  padding: 2px 10px;
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
}

.product-price {
  color: var(--c-danger);
  font-weight: bold;
  font-size: 1.15rem;
}
</style>
