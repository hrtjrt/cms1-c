import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { SITE_NAME } from '@/config/site'

/* ==========================================================================
   路由表
   与 hjc 的多页结构一一对应：
     index.html    -> /
     about.html    -> /about
     products.html -> /products（支持 ?category=）
     news.html     -> /news（支持 ?id=）
     contact.html  -> /contact
   ========================================================================== */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页', navKey: 'home' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于我们', navKey: 'about' }
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductsView.vue'),
    meta: { title: '产品中心', navKey: 'products' }
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: '新闻动态', navKey: 'news' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: '联系我们', navKey: 'contact' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 原项目为整页跳转，进入新页面必然回到顶部
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  // 标题格式沿用 hjc：「页面名 - 公司官网」
  document.title = `${to.meta.title ?? ''} - ${SITE_NAME}`
})

export default router
