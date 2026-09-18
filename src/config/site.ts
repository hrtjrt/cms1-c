import type { NavItem, SiteContact } from '@/types'

/* ==========================================================================
   站点共享常量
   全部来自 hjc/js/common.js 的顶部常量区，迁移后由 config 层统一导出，
   避免同一份文案/字典在多个组件里各写一遍。
   ========================================================================== */

/** 产品分类：产品中心侧栏、首页产品位、商品数据生成三处共用 */
export const SITE_CATEGORIES = [
  '电子产品',
  '家居用品',
  '办公设备',
  '户外运动',
  '安防系统'
] as const

/** 新闻标题：首页预览（前 5 条）与新闻列表页共用 */
export const NEWS_TITLES = [
  '公司获得 A 轮融资，加速全球化布局',
  '新产品发布会在上海圆满举行',
  '与欧洲合作伙伴签署战略协议',
  '公司荣获"年度最佳供应商"称号',
  '智能工厂正式投产，产能提升 3 倍',
  '公司参展第 128 届广交会',
  '与东南亚经销商达成战略合作',
  '研发中心新实验室正式启用',
  '公司通过 ISO14001 环境管理体系认证',
  '海外客户代表团来访参观',
  '新一代产品荣获红点设计奖',
  '公司入选"专精特新"企业名单',
  '与高校共建产学研合作基地',
  '2026 年上半年业绩同比增长 45%',
  '公司蝉联"行业十强"称号',
  '智能制造案例入选行业白皮书',
  '海外官网正式上线多语言版本',
  '公司员工突破 200 人',
  '与头部电商平台达成战略合作',
  '产品成功进入中东市场'
] as const

/** 联系方式：联系我们页左栏与新闻页侧栏共用 */
export const SITE_CONTACT: SiteContact = {
  address: '上海市浦东新区xx路xx号xx大厦 20 楼',
  addressShort: '上海市浦东新区',
  phoneMain: '400-888-8888',
  phones: '400-888-8888 / 021-1234-5678',
  email: 'contact@company.com',
  hours: '周一至周五 9:00 - 18:00'
}

/** 页脚文案 */
export const FOOTER_TEXT = '© 2026 公司名称. All rights reserved.'

/** 导航 LOGO */
export const LOGO_URL = 'https://placehold.co/600x400/white/blue?text=LOGO'

/** 联系我们页的高德地图内嵌地址 */
export const MAP_EMBED_URL =
  'https://ditu.amap.com/ssr/embed/place?id=B000A8VSPT&name=%E6%96%B0%E4%B8%AD%E5%B9%BF%E5%9C%BA&lng=116.447081&lat=39.857384&address=%E6%88%90%E5%AF%BF%E5%AF%BA%E8%B7%AF2%E5%8F%B7&zoom=16&source=poi_detail&platform=pc'

/** 站点名称后缀，与 hjc 各页 <title> 保持一致 */
export const SITE_NAME = '公司官网'

/** 导航菜单项，顺序与 hjc/common.js 注入的 <ul class="nav-links"> 完全一致 */
export const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', to: '/' },
  { key: 'about', label: '关于我们', to: '/about' },
  { key: 'products', label: '产品中心', to: '/products' },
  { key: 'news', label: '新闻动态', to: '/news' },
  { key: 'contact', label: '联系我们', to: '/contact' }
]
