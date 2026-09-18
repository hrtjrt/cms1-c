import { NEWS_TITLES, SITE_CATEGORIES } from '@/config/site'
import { NEWS_DATES } from '@/api/news'
import { mock } from '@/utils/request'
import { cycle } from '@/utils/cycle'
import type { ApiResult, Banner, NewsPreview, HomeProduct } from '@/types'

/* ==========================================================================
   首页接口：轮播图 / 产品舞台 / 新闻预览
   数据搬运自 hjc/js/home.js 的三个模块常量。
   ========================================================================== */

/** 轮播图：图片尺寸 1920x1080，自动间隔 3000ms，带跳转链接 */
const BANNERS: Banner[] = [
  { id: 1, image: 'https://picsum.photos/1920/1080?random=10', title: '欢迎来到我们的公司', link: '/about' },
  { id: 2, image: 'https://picsum.photos/1920/1080?random=20', title: '优质产品，值得信赖', link: '/products' },
  { id: 3, image: 'https://picsum.photos/1920/1080?random=30', title: '联系我们，获取报价', link: '/contact' }
]

/** 首页五张产品卡的静态文案，category 由 SITE_CATEGORIES 按序绑定 */
const HOME_PRODUCT_META = [
  { name: '智能电子产品', desc: '高性能 · 低功耗 · 全球认证', random: 11 },
  { name: '现代家居用品', desc: '简约设计 · 环保材质', random: 12 },
  { name: '专业办公设备', desc: '高效稳定 · 企业首选', random: 13 },
  { name: '户外运动装备', desc: '耐用轻便 · 探险必备', random: 14 },
  { name: '智能安防系统', desc: '24 小时守护 · 智能联动', random: 15 }
] as const

/**
 * 首页五条新闻的配图编号（800x600）。
 * 日期不再单独硬编码，统一取 api/news.ts 的 NEWS_DATES，
 * 保证同一条新闻在首页与列表页显示的日期完全一致。
 */
const HOME_NEWS_META = [{ random: 21 }, { random: 22 }, { random: 23 }, { random: 24 }, { random: 25 }] as const

export function fetchBanners(): Promise<ApiResult<Banner[]>> {
  return mock(BANNERS)
}

export function fetchHomeProducts(): Promise<ApiResult<HomeProduct[]>> {
  const data: HomeProduct[] = HOME_PRODUCT_META.map((meta, i) => ({
    id: i + 1,
    name: meta.name,
    desc: meta.desc,
    category: cycle(SITE_CATEGORIES, i),
    image: `https://picsum.photos/800/900?random=${meta.random}`
  }))
  return mock(data)
}

export function fetchHomeNews(): Promise<ApiResult<NewsPreview[]>> {
  const data: NewsPreview[] = HOME_NEWS_META.map((meta, i) => ({
    id: i + 1,
    title: cycle(NEWS_TITLES, i),
    date: cycle(NEWS_DATES, i),
    image: `https://picsum.photos/800/600?random=${meta.random}`
  }))
  return mock(data)
}
