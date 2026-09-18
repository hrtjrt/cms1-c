/* ================= 站点业务实体类型 ================= */

/** 首页轮播图 */
export interface Banner {
  id: number
  image: string
  title: string
  /** 点击后跳转的路由 path */
  link: string
}

/** 首页产品舞台里的一张卡片 */
export interface HomeProduct {
  id: number
  name: string
  desc: string
  category: string
  image: string
}

/** 首页新闻预览条目（无摘要） */
export interface NewsPreview {
  id: number
  title: string
  date: string
  image: string
}

/** 产品中心商品 */
export interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
}

/** 新闻列表条目（含摘要） */
export interface NewsItem {
  id: number
  title: string
  date: string
  summary: string
  image: string
}

/** 发展历程节点 */
export interface TimelineItem {
  year: string
  content: string
}

/** 核心价值观卡片 */
export interface ValueItem {
  icon: string
  title: string
  desc: string
}

/** 荣誉资质项 */
export interface HonorItem {
  name: string
  image: string
}

/** 公司简介里的统计数字 */
export interface StatItem {
  num: string
  unit: string
  label: string
}

/** 导航栏菜单项 */
export interface NavItem {
  key: string
  label: string
  to: string
}

/** 站点联系方式 */
export interface SiteContact {
  address: string
  addressShort: string
  phoneMain: string
  phones: string
  email: string
  hours: string
}

/** 联系我们表单 */
export interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

/** 表单字段级错误：键为字段名，值为错误文案 */
export type ContactFormErrors = Partial<Record<keyof ContactForm, string>>

/** 统一响应结构：后端接入后由 utils/request.ts 的 http() 返回同构结果 */
export interface ApiResult<T> {
  code: number
  message: string
  data: T
}
