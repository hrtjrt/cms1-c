/* ==========================================================================
   实体类型
   字段与后端 cms1_backend/src/types/index.ts 逐字段对齐（camelCase）。
   前台从 v2 起不再使用本地 mock，所有数据都来自 /api/public/*，
   所以这里的类型就是接口契约本身。
   ========================================================================== */

/* ---------------- 通用 ---------------- */

/** 统一响应结构，与后端 utils/response.ts 一致 */
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/* ---------------- 首页 ---------------- */

/** 首页轮播图 */
export interface Banner {
  id: number
  title: string
  image: string
  /** 点击后跳转的前台路由 path；为空表示不可点击 */
  link: string
  sort: number
  status: number
}

/* ---------------- 商品 ---------------- */

/** 产品分类 */
export interface ProductCategory {
  id: number
  name: string
  sort: number
  status: number
  /** 该分类下前台可见（已上产品中心且启用）的商品数 */
  productCount: number
}

/**
 * 商品
 * 展示层级由后端保证：
 *   showInProductCenter = 1 → 出现在产品中心
 *   showOnHomepage       = 1 → 出现在首页产品位（必然是前者为 1）
 * 前台拿到的数据一定满足这两条，不需要再判断。
 */
export interface Product {
  id: number
  name: string
  categoryId: number
  /** 分类名，由后端 JOIN 得出 */
  category: string
  price: number
  /** 一句话卖点 */
  description: string
  image: string
  /** 商品详情（HTML），详情页正文 */
  detail: string
  status: number
  showInProductCenter: number
  showOnHomepage: number
  sort: number
  homeSort: number
}

/* ---------------- 新闻 ---------------- */

/** 新闻 */
export interface NewsItem {
  id: number
  title: string
  /** YYYY-MM-DD 纯日期字符串 */
  date: string
  /** 列表页摘要 */
  summary: string
  /** 详情页正文（HTML），可能为空 */
  content: string
  image: string
  /** 1 表示置顶 */
  isTop: number
  status: number
  sort: number
}

/* ---------------- 关于我们 ---------------- */

export interface AboutIntro {
  id: number
  content: string
  image: string
}

export interface StatItem {
  id: number
  num: string
  unit: string
  label: string
  sort: number
}

export interface TimelineItem {
  id: number
  year: string
  content: string
  sort: number
}

export interface ValueItem {
  id: number
  icon: string
  title: string
  description: string
  sort: number
}

export interface HonorItem {
  id: number
  name: string
  image: string
  sort: number
}

export interface AboutData {
  intro: AboutIntro
  stats: StatItem[]
  history: TimelineItem[]
  values: ValueItem[]
  honors: HonorItem[]
}

/* ---------------- 站点 ---------------- */

export interface SiteContact {
  id: number
  address: string
  addressShort: string
  phoneMain: string
  phones: string
  email: string
  hours: string
}

export interface SiteConfig {
  id: number
  siteName: string
  footerText: string
  logoUrl: string
  mapEmbedUrl: string
  companyName: string
}

/** 页面顶部 Banner（关于我们 / 新闻动态 / 联系我们） */
export interface PageHeroConfig {
  id: number
  pageKey: string
  pageName: string
  title: string
  subtitle: string
  image: string
  height: string
  heightSm: string
  mask: string
  letterSpacing: string
  subtitleSize: string
  subtitleSpacing: string
  subtitleOpacity: string
  sort: number
}

/* ---------------- 首页聚合 ---------------- */

export interface HomeData {
  banners: Banner[]
  products: Product[]
  news: NewsItem[]
}

/* ---------------- 表单 ---------------- */

export interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactForm, string>>

/* ---------------- 导航 ---------------- */

export interface NavItem {
  key: string
  label: string
  to: string
}
