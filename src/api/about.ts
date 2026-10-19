import { get } from '@/utils/request'
import type { AboutData } from '@/types'

/* ==========================================================================
   关于我们
   /api/public/about 是聚合接口：简介 + 统计数字 + 发展历程 + 核心价值观 + 荣誉资质
   一次拿全，前台页面只发一个请求。
   ========================================================================== */

export function fetchAbout(): Promise<AboutData> {
  return get<AboutData>('/api/public/about')
}
