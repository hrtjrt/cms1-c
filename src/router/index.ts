import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useSiteStore } from '@/stores/site'
import { SITE_NAME } from '@/config/site'

/* ==========================================================================
   路由表
   与 hjc 的多页结构对应，并在 v2 补齐两个详情页：
     index.html    -> /
     about.html    -> /about
     products.html -> /products（支持 ?category=）
     news.html     -> /news
     contact.html  -> /contact
     （新增）       -> /news/:id      新闻详情
     （新增）       -> /products/:id  商品详情
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
    path: '/products/:id',
    name: 'productDetail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { title: '商品详情', navKey: 'products' }
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: '新闻动态', navKey: 'news' }
  },
  {
    path: '/news/:id',
    name: 'newsDetail',
    component: () => import('@/views/NewsDetailView.vue'),
    meta: { title: '新闻详情', navKey: 'news' }
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

/* 站点公共数据（分类 / 联系方式 / 页脚）在首次导航时拉一次 */
let siteLoaded = false

router.beforeEach(async () => {
  if (siteLoaded) return true
  siteLoaded = true
  // 失败也不阻塞导航：store 内部会退回本地默认值
  await useSiteStore().load()
  return true
})

router.afterEach((to) => {
  // 标题格式沿用 hjc：「页面名 - 公司官网」
  document.title = `${to.meta.title ?? ''} - ${useSiteStore().siteName || SITE_NAME}`
})

export default router
