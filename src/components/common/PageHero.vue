<script setup lang="ts">
/* ==========================================================================
   通用页面 Banner
   hjc 里 about / news / contact 三页的 Hero 结构完全相同，公共声明曾被合并到
   common.css，差异（高度 / 背景图 / 遮罩色 / 字间距）留在各自 CSS。
   这里收敛为一个组件，差异值通过 CSS 变量从外部传入。
   ========================================================================== */

withDefaults(
  defineProps<{
    title: string
    subtitle: string
    image: string
    /** 常规高度 */
    height?: string
    /** 窄屏高度（<=900px） */
    heightSm?: string
    /** 遮罩色 */
    mask?: string
    /** 标题字间距 */
    letterSpacing?: string
    /** 副标题字号 */
    subtitleSize?: string
    /** 副标题字间距 */
    subtitleSpacing?: string
    /** 副标题不透明度 */
    subtitleOpacity?: string
  }>(),
  {
    height: '380px',
    heightSm: '280px',
    mask: 'rgba(10, 23, 218, 0.55)',
    letterSpacing: '4px',
    subtitleSize: '1rem',
    subtitleSpacing: '6px',
    subtitleOpacity: '0.85'
  }
)
</script>

<template>
  <section
    class="page-hero"
    :style="{
      '--hero-h': height,
      '--hero-h-sm': heightSm,
      '--hero-bg': `url('${image}')`,
      '--hero-mask': mask,
      '--hero-ls': letterSpacing,
      '--hero-sub-size': subtitleSize,
      '--hero-sub-ls': subtitleSpacing,
      '--hero-sub-opacity': subtitleOpacity
    }"
  >
    <div class="page-hero-content">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  position: relative;
  height: var(--hero-h);
  margin-top: var(--nav-h);
  background-image: var(--hero-bg);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.page-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hero-mask);
}

.page-hero-content {
  position: relative;
  z-index: 1;
  color: var(--c-white);
}

.page-hero-content h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: var(--hero-ls);
}

.page-hero-content p {
  font-size: var(--hero-sub-size);
  letter-spacing: var(--hero-sub-ls);
  opacity: var(--hero-sub-opacity);
}

@media (max-width: 900px) {
  .page-hero {
    height: var(--hero-h-sm);
    margin-top: 90px;
  }

  .page-hero-content h1 {
    font-size: 2rem;
  }

  .page-hero-content p {
    font-size: 0.9rem;
    letter-spacing: 4px;
  }
}
</style>
