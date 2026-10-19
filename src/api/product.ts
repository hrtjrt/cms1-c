import { get } from '@/utils/request'
import type { PageResult, Product, ProductCategory } from '@/types'

/* ==========================================================================
   产品
   后端只返回「已上产品中心且已启用」的商品（show_in_product_center = 1），
   首页产品位则是这批数据里 show_on_homepage = 1 的子集，
   因此前台不会拿到不该展示的商品，URL 直接访问被下架商品也会 404。
   ========================================================================== */

/**
 * 产品中心列表
 *
 * 本项目只有 40 件商品，前台一次性取全（all=1），
 * 分类筛选与关键字搜索继续在本地做，保留原有的「哨兵无限滚动」交互。
 * 数据量增长后把 all 去掉、改用 page/pageSize 即可，接口本来就支持。
 */
export async function fetchProducts(): Promise<Product[]> {
  const result = await get<PageResult<Product>>('/api/public/products', { all: 1 })
  return result.list
}

/** 商品详情；商品未上架时后端返回 404，抛 RequestError */
export function fetchProductDetail(id: number): Promise<Product> {
  return get<Product>(`/api/public/products/${id}`)
}

/** 前台可见的产品分类（带商品数） */
export function fetchCategories(): Promise<ProductCategory[]> {
  return get<ProductCategory[]>('/api/public/categories')
}
