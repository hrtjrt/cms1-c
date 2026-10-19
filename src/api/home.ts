import { get } from '@/utils/request'
import type { HomeData, PageHeroConfig } from '@/types'

/* ==========================================================================
   首页 / 页面 Banner
   /api/public/home 是一个聚合接口：一次拿到轮播图 + 首页产品位 + 最新新闻，
   避免首屏发 3 个请求（原 mock 版本也是一次拿全）。
   ========================================================================== */

/** 首页聚合数据 */
export function fetchHomeData(): Promise<HomeData> {
  return get<HomeData>('/api/public/home')
}

/** 页面顶部 Banner（about / news / contact） */
export function fetchPageHero(pageKey: string): Promise<PageHeroConfig> {
  return get<PageHeroConfig>('/api/public/page-hero', { key: pageKey })
}
