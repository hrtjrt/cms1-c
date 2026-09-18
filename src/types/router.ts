import 'vue-router'

/**
 * 扩展 vue-router 的 RouteMeta。
 * hjc 原项目通过独立 HTML 承载页面，此处用 meta 表达同等信息。
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题，路由守卫中写入 document.title */
    title: string
    /** 与 NAV_ITEMS.key 对应，决定导航栏高亮项 */
    navKey?: string
  }
}

export {}
