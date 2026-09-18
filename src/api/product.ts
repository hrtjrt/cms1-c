import { SITE_CATEGORIES } from '@/config/site'
import { mock } from '@/utils/request'
import { cycle } from '@/utils/cycle'
import type { ApiResult, Product } from '@/types'

/* ==========================================================================
   产品接口
   数据生成逻辑逐行搬运自 hjc/js/products.js（40 件、分类轮转、名词/形容词轮转、
   随机价格、random=100+i 的占位图），保证 Vue 版与原版数据规模与顺序一致。
   ========================================================================== */

/** 各分类下的产品名词 */
const PRODUCT_NOUNS: Record<string, readonly string[]> = {
  电子产品: ['平板电脑', '无线耳机', '智能手表', '蓝牙音箱', '电子书阅读器'],
  家居用品: ['空气净化器', '扫地机器人', '智能台灯', '加湿器', '智能门锁'],
  办公设备: ['激光打印机', '投影仪', '人体工学椅', '文件柜', '碎纸机'],
  户外运动: ['登山背包', '运动水壶', '折叠帐篷', '运动手环', '登山鞋'],
  安防系统: ['监控摄像头', '智能门铃', '声光报警器', '门禁系统', '指纹锁']
}

const ADJECTIVES = ['智能', '高端', '便携', '专业', '家用', '商务', '旗舰', '轻奢'] as const

const TOTAL = 40

/**
 * 生成全量产品列表。
 * 模块级缓存：单页应用不会重新加载脚本，列表需要在多次进出页面时保持稳定，
 * 否则每次进入产品中心价格都会重掷。
 */
const ALL_PRODUCTS: Product[] = Array.from({ length: TOTAL }, (_, i) => {
  const category = cycle(SITE_CATEGORIES, i)
  const noun = cycle(PRODUCT_NOUNS[category] ?? [], i)
  const adjective = cycle(ADJECTIVES, i)
  return {
    id: i + 1,
    name: `${adjective}${noun}`,
    category,
    price: Math.floor(Math.random() * 2000) + 99,
    image: `https://picsum.photos/400/300?random=${100 + i}`
  }
})

/** 查询产品列表 */
export function fetchProducts(): Promise<ApiResult<Product[]>> {
  return mock(ALL_PRODUCTS)
}
