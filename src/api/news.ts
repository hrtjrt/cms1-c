import { NEWS_TITLES } from '@/config/site'
import { mock } from '@/utils/request'
import { cycle } from '@/utils/cycle'
import type { ApiResult, NewsItem } from '@/types'

/* ==========================================================================
   新闻接口
   生成逻辑搬运自 hjc/js/news.js：30 条、7 天一条往前推、标题/摘要轮转取值。
   ========================================================================== */

const SUMMARIES = [
  '本次会议围绕行业发展趋势展开深入讨论，与会嘉宾一致认为，技术创新将成为未来竞争的核心驱动力。',
  '公司将持续加大研发投入，推动产品迭代升级，为全球客户提供更优质的解决方案。',
  '双方将在技术研发、市场开拓等方面开展深度合作，共同开拓海外市场。',
  '凭借稳定的产品质量和优质的服务，公司在众多供应商中脱颖而出，获得客户高度认可。',
  '新工厂采用全自动化生产线，大幅提升了生产效率和产品一致性。',
  '展会现场吸引了众多海外客户驻足洽谈，达成多项合作意向。'
] as const

const TOTAL = 30

/** 基准日期 2026-09-01，与原实现 new Date(2026, 8, 1) 一致 */
const BASE_YEAR = 2026
const BASE_MONTH = 8 // 月份从 0 开始
const BASE_DAY = 1
const DAY_STEP = 7

/** 全站唯一的新闻数据源：标题 / 日期 / 摘要 / 排序都以这里为准，首页预览复用同一份日期 */
export const ALL_NEWS: NewsItem[] = Array.from({ length: TOTAL }, (_, i) => {
  const date = new Date(BASE_YEAR, BASE_MONTH, BASE_DAY)
  date.setDate(date.getDate() - i * DAY_STEP)
  return {
    id: i + 1,
    title: cycle(NEWS_TITLES, i),
    date: date.toISOString().slice(0, 10),
    summary: cycle(SUMMARIES, i),
    image: `https://picsum.photos/600/400?random=${500 + i}`
  }
})

/**
 * 新闻日期序列（新 -> 旧，与 ALL_NEWS 顺序一致）。
 * 首页预览与新闻列表页共用，避免两处各写一套日期导致同一条新闻显示不一致。
 */
export const NEWS_DATES: readonly string[] = ALL_NEWS.map((item) => item.date)

/** 查询新闻列表 */
export function fetchNewsList(): Promise<ApiResult<NewsItem[]>> {
  return mock(ALL_NEWS)
}
