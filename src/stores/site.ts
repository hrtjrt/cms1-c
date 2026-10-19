import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  FOOTER_TEXT,
  LOGO_URL,
  MAP_EMBED_URL,
  NAV_ITEMS,
  SITE_CATEGORIES,
  SITE_CONFIG,
  SITE_CONTACT,
  SITE_NAME
} from '@/config/site'
import { fetchCategories } from '@/api/product'
import { get } from '@/utils/request'
import type { NavItem, PageHeroConfig, ProductCategory, SiteConfig, SiteContact } from '@/types'

/* ==========================================================================
   站点公共状态

   v2 起这些信息来自后端（/api/public/categories 与 /api/public/site），
   后台改一次前台全站生效；同时保留 config/site.ts 里的本地默认值，
   后端没起来时页面仍然能渲染出骨架（而不是白屏），只是数据是旧的。
   ========================================================================== */

interface SitePublicInfo {
  site: SiteConfig
  contact: SiteContact
}

export const useSiteStore = defineStore('site', () => {
  /** 分类（带商品数）；后端不可用时退化为本地常量 */
  const categoryList = ref<ProductCategory[]>([])
  const categories = ref<readonly string[]>([...SITE_CATEGORIES])
  const navItems = ref<NavItem[]>(NAV_ITEMS)
  const contact = ref<SiteContact>(SITE_CONTACT)
  const siteConfig = ref<SiteConfig>(SITE_CONFIG)
  const footerText = ref(FOOTER_TEXT)
  const logoUrl = ref(LOGO_URL)
  const mapEmbedUrl = ref(MAP_EMBED_URL)
  const siteName = ref(SITE_NAME)

  /** 页面 Banner（about / news / contact），由各页面按 key 取 */
  const pageHeroes = ref<Record<string, PageHeroConfig>>({})

  /** 是否成功连上后端（用于页面提示「后端未启动」） */
  const online = ref(false)
  const loaded = ref(false)

  /** 侧栏分类项，第一项为「全部产品」 */
  const categoryOptions = computed(() => [
    { value: 'all', label: '全部产品' },
    ...categories.value.map((item) => ({ value: item, label: item }))
  ])

  /** 联系我们左栏的展示序列 */
  const contactInfoList = computed(() => [
    { icon: '📍', label: '公司地址', value: contact.value.address },
    { icon: '📞', label: '联系电话', value: contact.value.phones },
    { icon: '✉️', label: '电子邮箱', value: contact.value.email },
    { icon: '🕐', label: '工作时间', value: contact.value.hours }
  ])

  /**
   * 拉取站点公共数据。
   * 失败时不清空已有值（继续用本地默认值），只把 online 置 false。
   */
  async function load(): Promise<void> {
    if (loaded.value) return

    try {
      const [categoryData, siteData] = await Promise.all([
        fetchCategories(),
        get<SitePublicInfo>('/api/public/site')
      ])

      categoryList.value = categoryData
      categories.value = categoryData.map((item) => item.name)

      siteConfig.value = siteData.site
      contact.value = siteData.contact
      footerText.value = siteData.site.footerText || FOOTER_TEXT
      logoUrl.value = siteData.site.logoUrl || LOGO_URL
      mapEmbedUrl.value = siteData.site.mapEmbedUrl || MAP_EMBED_URL
      siteName.value = siteData.site.siteName || SITE_NAME

      online.value = true
    } catch {
      // 后端未启动时保持本地默认值，页面照常渲染
      online.value = false
    } finally {
      loaded.value = true
    }
  }

  /** 页面 Banner：同一页只请求一次，结果缓存 */
  async function loadPageHero(key: string): Promise<PageHeroConfig | null> {
    const cached = pageHeroes.value[key]
    if (cached) return cached

    try {
      const hero = await get<PageHeroConfig>('/api/public/page-hero', { key })
      pageHeroes.value = { ...pageHeroes.value, [key]: hero }
      void load()
      return hero
    } catch {
      return null
    }
  }

  return {
    online,
    loaded,
    categoryList,
    categories,
    navItems,
    contact,
    siteConfig,
    footerText,
    logoUrl,
    mapEmbedUrl,
    siteName,
    pageHeroes,
    categoryOptions,
    contactInfoList,
    load,
    loadPageHero
  }
})
