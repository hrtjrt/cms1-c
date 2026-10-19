import type { NavItem, SiteConfig, SiteContact } from '@/types'

/* ==========================================================================
   站点默认值（兜底常量）

   v2 起这些内容由后端统一管理（后台「站点管理」可改），前台启动时通过
   stores/site.ts 拉取。这里保留一份默认值，作用有两个：
     1. 后端未启动 / 请求失败时，页面仍然能渲染出完整骨架，而不是白屏
     2. 提供分类顺序等「结构性」常量，作为后端数据缺失时的兜底

   注意：不要在组件里直接 import 这些默认值 —— 请从 useSiteStore 取，
   否则后台改了站点配置前台不会生效。
   ========================================================================== */

/** 产品分类（兜底顺序，真实数据来自 /api/public/categories） */
export const SITE_CATEGORIES = [
  '电子产品',
  '家居用品',
  '办公设备',
  '户外运动',
  '安防系统'
] as const

/** 联系方式默认值（真实数据来自 /api/public/site） */
export const SITE_CONTACT: SiteContact = {
  id: 1,
  address: '上海市浦东新区xx路xx号xx大厦 20 楼',
  addressShort: '上海市浦东新区',
  phoneMain: '400-888-8888',
  phones: '400-888-8888 / 021-1234-5678',
  email: 'contact@company.com',
  hours: '周一至周五 9:00 - 18:00'
}

/** 站点配置默认值（真实数据来自 /api/public/site） */
export const SITE_CONFIG: SiteConfig = {
  id: 1,
  siteName: '公司官网',
  footerText: '© 2026 公司名称. All rights reserved.',
  logoUrl: '/uploads/seed/logo.svg',
  mapEmbedUrl:
    'https://ditu.amap.com/ssr/embed/place?id=B000A8VSPT&name=%E6%96%B0%E4%B8%AD%E5%B9%BF%E5%9C%BA&lng=116.447081&lat=39.857384&address=%E6%88%90%E5%AF%BF%E5%AF%BA%E8%B7%AF2%E5%8F%B7&zoom=16&source=poi_detail&platform=pc',
  companyName: '公司名称'
}

/** 页脚文案默认值 */
export const FOOTER_TEXT = SITE_CONFIG.footerText

/** 导航 LOGO 默认值 */
export const LOGO_URL = SITE_CONFIG.logoUrl

/** 联系我们页的高德地图内嵌地址默认值 */
export const MAP_EMBED_URL = SITE_CONFIG.mapEmbedUrl

/** 站点名称后缀 */
export const SITE_NAME = SITE_CONFIG.siteName

/** 导航菜单项，顺序与 hjc/common.js 注入的 <ul class="nav-links"> 完全一致 */
export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', to: '/' },
  { key: 'about', label: '关于我们', to: '/about' },
  { key: 'products', label: '产品中心', to: '/products' },
  { key: 'news', label: '新闻动态', to: '/news' },
  { key: 'contact', label: '联系我们', to: '/contact' }
]
