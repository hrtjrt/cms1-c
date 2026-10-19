import { get } from '@/utils/request'
import type { NewsItem, PageResult } from '@/types'

/* ==========================================================================
   新闻
   列表接口支持 page / pageSize / keyword / top / all。
   前台一次性取全（all=1），继续用本地的哨兵无限滚动分批渲染。
   ========================================================================== */

/**
 * 新闻列表（已发布）
 * @param topOnly 只取置顶（首页「热门文章」）
 */
export async function fetchNewsList(topOnly = false): Promise<NewsItem[]> {
  const result = await get<PageResult<NewsItem>>('/api/public/news', {
    all: 1,
    top: topOnly ? 1 : undefined
  })
  return result.list
}

/** 新闻详情；未发布或不存在时后端返回 404 */
export function fetchNewsDetail(id: number): Promise<NewsItem> {
  return get<NewsItem>(`/api/public/news/${id}`)
}
