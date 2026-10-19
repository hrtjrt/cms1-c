<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHero from '@/components/common/PageHero.vue'
import { fetchAbout } from '@/api/about'
import { assetUrl, resolveHtmlAssets } from '@/utils/request'
import { useSiteStore } from '@/stores/site'
import type { HonorItem, PageHeroConfig, StatItem, TimelineItem, ValueItem } from '@/types'

/* 关于我们：整体对应 hjc/about.html + js/about.js

   v2 起所有内容（简介正文、统计数字、发展历程、核心价值观、荣誉资质）
   都来自后台的「关于我们」模块，页面只发一个聚合请求。*/

const site = useSiteStore()

const introText = ref('')
const introImage = ref('')
const stats = ref<StatItem[]>([])
const history = ref<TimelineItem[]>([])
const values = ref<ValueItem[]>([])
const honors = ref<HonorItem[]>([])
const hero = ref<PageHeroConfig | null>(null)
const failed = ref(false)

/** 简介正文是富文本，展示前补全相对资源地址 */
const introHtml = computed(() => resolveHtmlAssets(introText.value))

/** 页面 Banner 文案来自后台配置，字段缺失时用本地默认值兜底 */
const heroProps = computed(() => ({
  title: hero.value?.title || '关于我们',
  subtitle: hero.value?.subtitle || '专业 · 创新 · 值得信赖',
  image: hero.value?.image || '',
  height: hero.value?.height || '420px',
  heightSm: hero.value?.heightSm || '320px',
  mask: hero.value?.mask || 'rgba(10, 23, 218, 0.55)',
  letterSpacing: hero.value?.letterSpacing || '2px',
  subtitleSize: hero.value?.subtitleSize || '1.2rem',
  subtitleSpacing: hero.value?.subtitleSpacing || '4px',
  subtitleOpacity: hero.value?.subtitleOpacity || '0.9'
}))

onMounted(async () => {
  hero.value = await site.loadPageHero('about')
  try {
    const data = await fetchAbout()
    introText.value = data.intro.content
    introImage.value = data.intro.image
    stats.value = data.stats
    history.value = data.history
    values.value = data.values
    honors.value = data.honors
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <main class="about-page">
    <PageHero v-bind="heroProps" />

    <div v-if="failed" class="offline-tip">
      数据加载失败：请确认后端服务已启动（默认 http://localhost:3000）
    </div>

    <!-- 公司简介 -->
    <section class="about-section intro-section">
      <div class="container">
        <div class="intro-layout">
          <div class="intro-image">
            <img :src="assetUrl(introImage)" alt="公司环境" />
          </div>
          <div class="intro-text">
            <h2 class="about-title">公司简介</h2>
            <div class="intro-rich" v-html="introHtml" />

            <div class="intro-stats">
              <div v-for="stat in stats" :key="stat.label" class="stat-item">
                <div class="stat-num">{{ stat.num }}<span>{{ stat.unit }}</span></div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程 -->
    <section class="about-section history-section">
      <div class="container">
        <h2 class="about-title center">发展历程</h2>
        <div class="timeline">
          <div v-for="item in history" :key="item.year" class="timeline-item">
            <div class="timeline-year">{{ item.year }}</div>
            <div class="timeline-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心价值观 -->
    <section class="about-section values-section">
      <div class="container">
        <h2 class="about-title center">核心价值观</h2>
        <div class="values-grid">
          <div v-for="item in values" :key="item.title" class="value-card">
            <span class="value-icon">{{ item.icon }}</span>
            <h3 class="value-title">{{ item.title }}</h3>
            <p class="value-desc">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 荣誉资质 -->
    <section class="about-section honors-section">
      <div class="container">
        <h2 class="about-title center">荣誉资质</h2>
        <div class="honors-grid">
          <div v-for="item in honors" :key="item.name" class="honor-card">
            <img :src="assetUrl(item.image)" :alt="item.name" loading="lazy" />
            <div class="honor-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-section {
  padding: var(--gap-section, 80px) 0;
}

.about-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--c-ink);
  margin-bottom: 40px;
  position: relative;
  padding-left: 20px;
}

.about-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 30px;
  background: var(--c-primary);
  border-radius: var(--radius-xs);
}

.about-title.center {
  text-align: center;
  padding-left: 0;
}

.about-title.center::before {
  display: none;
}

/* 公司简介 */
.intro-section {
  background: var(--c-bg);
}

.intro-layout {
  display: flex;
  gap: 60px;
  align-items: center;
}

.intro-image {
  flex: 1;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-strong);
}

.intro-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.intro-image:hover img {
  transform: scale(1.05);
}

.intro-text {
  flex: 1.2;
}

.intro-text p {
  color: var(--c-text-sub);
  line-height: 1.9;
  margin-bottom: 16px;
  font-size: 1rem;
}

.offline-tip {
  background: #fff4e6;
  color: #b45309;
  border-bottom: 1px solid #ffe0b2;
  padding: 10px 5%;
  font-size: 0.9rem;
  text-align: center;
}

/* 公司简介正文来自富文本，段落间距统一交给这里 */
.intro-rich p {
  margin-bottom: 14px;
  color: var(--c-text-sub);
  line-height: 1.9;
}

.intro-rich h3 {
  margin: 18px 0 10px;
  font-size: 1.05rem;
  color: var(--c-ink);
}

.intro-rich img {
  max-width: 100%;
  border-radius: var(--radius);
}

.intro-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--c-line-soft);
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 2rem;
  font-weight: bold;
  color: var(--c-primary);
  line-height: 1;
}

.stat-num span {
  font-size: 1.2rem;
  margin-left: 2px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--c-text-weak);
  margin-top: 8px;
}

/* 发展历程 */
.history-section {
  background: var(--c-bg-soft);
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: var(--c-line-timeline);
}

.timeline-item {
  position: relative;
  width: 50%;
  padding: 20px 40px;
  box-sizing: border-box;
}

.timeline-item:nth-child(odd) {
  left: 0;
  text-align: right;
}

.timeline-item:nth-child(even) {
  left: 50%;
  text-align: left;
}

.timeline-item::after {
  content: '';
  position: absolute;
  top: 32px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--c-bg);
  border: 3px solid var(--c-primary);
  z-index: 1;
}

.timeline-item:nth-child(odd)::after {
  right: -8px;
}

.timeline-item:nth-child(even)::after {
  left: -8px;
}

.timeline-year {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--c-primary);
  margin-bottom: 8px;
}

.timeline-content {
  background: var(--c-bg);
  padding: 18px 22px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-timeline);
  color: var(--c-text-sub);
  line-height: 1.7;
  font-size: 0.95rem;
  transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}

.timeline-content:hover {
  transform: var(--hover-lift-sm);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

/* 核心价值观 */
.values-section {
  background: var(--c-bg);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 28px;
}

.value-card {
  background: var(--c-bg-softer);
  padding: 36px 24px;
  border-radius: var(--radius-xl);
  text-align: center;
  transition: all var(--dur-base) var(--ease);
  border: 2px solid transparent;
}

.value-card:hover {
  background: var(--c-bg);
  border-color: var(--c-primary);
  transform: var(--hover-lift);
  box-shadow: var(--shadow-primary);
}

.value-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
  display: block;
}

.value-title {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--c-ink);
  margin-bottom: 12px;
}

.value-desc {
  font-size: 0.9rem;
  color: var(--c-text-muted);
  line-height: 1.7;
}

/* 荣誉资质 */
.honors-section {
  background: var(--c-bg-soft);
}

.honors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}

.honor-card {
  background: var(--c-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}

.honor-card:hover {
  transform: var(--hover-lift);
  box-shadow: var(--shadow-hover);
}

.honor-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.honor-name {
  padding: 14px 12px;
  font-size: 0.9rem;
  color: var(--c-text);
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 900px) {
  .intro-layout {
    flex-direction: column;
    gap: 32px;
  }

  .intro-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .timeline::before {
    left: 16px;
  }

  .timeline-item {
    width: 100%;
    left: 0;
    text-align: left;
    padding-left: 48px;
    padding-right: 0;
  }

  .timeline-item:nth-child(odd),
  .timeline-item:nth-child(even) {
    left: 0;
    text-align: left;
  }

  .timeline-item:nth-child(odd)::after,
  .timeline-item:nth-child(even)::after {
    left: 8px;
    right: auto;
  }
}

@media (max-width: 600px) {
  .about-section {
    padding: 50px 0;
  }

  .about-title {
    font-size: 1.5rem;
  }

  .stat-num {
    font-size: 1.6rem;
  }

  .values-grid,
  .honors-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .value-card {
    padding: 24px 16px;
  }

  .value-icon {
    font-size: 2rem;
  }
}
</style>
