<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '@/config/site'
import { useSiteStore } from '@/stores/site'
import { assetUrl } from '@/utils/request'

/* ==========================================================================
   站点导航栏
   行为搬运自 hjc/js/common.js 的 DOMContentLoaded 回调：
   - 滚动超过 100px 时，向下滚动隐藏、向上滚动显示
   - 鼠标靠近页面顶部 80px 时强制显示导航栏
   ========================================================================== */

const SCROLL_THRESHOLD = 100
const TOP_SENSITIVE_ZONE = 80

const route = useRoute()
const site = useSiteStore()

const navHidden = ref(false)

let lastScrollY = 0

const activeKey = computed(() => route.meta.navKey ?? '')

function handleScroll(): void {
  const currentY = window.scrollY
  if (currentY > SCROLL_THRESHOLD) {
    navHidden.value = currentY > lastScrollY
  } else {
    navHidden.value = false
  }
  lastScrollY = currentY
}

function handleMouseMove(event: MouseEvent): void {
  if (event.clientY < TOP_SENSITIVE_ZONE) {
    navHidden.value = false
  }
}

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <header class="site-header">
    <div class="all_nav" :class="{ 'nav-hidden': navHidden }">
      <img :src="assetUrl(site.logoUrl)" alt="LOGO" class="h-logo" />

      <nav class="main-nav">
        <ul class="nav-links">
          <li v-for="item in NAV_ITEMS" :key="item.key">
            <RouterLink :to="item.to" :class="{ active: activeKey === item.key }">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.all_nav {
  background-color: var(--c-white-a75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  height: var(--nav-h);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: transform 0.35s var(--ease);
}

.nav-hidden {
  transform: translateY(-100%);
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  font: 1.2em sans-serif;
  display: flex;
  gap: 40px;
}

.nav-links a {
  color: var(--c-black);
  text-decoration: none;
  transition: color var(--dur-base);
}

.nav-links a:hover {
  color: var(--c-primary);
}

.nav-links a.active {
  color: var(--c-primary);
  font-weight: bold;
}

.h-logo {
  width: 160px;
  aspect-ratio: 16 / 9;
}

@media (max-width: 900px) {
  .all_nav {
    padding: 0 1rem;
  }

  .nav-links {
    gap: 20px;
    font-size: 1rem;
  }

  .h-logo {
    width: 110px;
  }
}
</style>
