import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { FOOTER_TEXT, NAV_ITEMS, SITE_CATEGORIES, SITE_CONTACT } from '@/config/site'
import type { NavItem, SiteContact } from '@/types'

/* ==========================================================================
   站点公共状态
   hjc 把这些常量直接挂在 window 上，由各页面脚本读取；
   这里收进 Pinia，组件通过 store 访问，单一数据源。
   ========================================================================== */

export const useSiteStore = defineStore('site', () => {
  const categories = ref<readonly string[]>(SITE_CATEGORIES)
  const navItems = ref<NavItem[]>(NAV_ITEMS)
  const contact = ref<SiteContact>(SITE_CONTACT)
  const footerText = ref(FOOTER_TEXT)

  /** 侧栏分类项，第一项为「全部产品」，与 hjc/products.js renderCategoryList 一致 */
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

  return { categories, navItems, contact, footerText, categoryOptions, contactInfoList }
})
