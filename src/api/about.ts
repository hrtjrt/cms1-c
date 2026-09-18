import { mock } from '@/utils/request'
import type { ApiResult, HonorItem, TimelineItem, ValueItem } from '@/types'

/* ==========================================================================
   关于我们接口
   三组数据均搬运自 hjc/js/about.js 的 historyData / valuesData / honorsData。
   ========================================================================== */

const HISTORY: TimelineItem[] = [
  { year: '2010', content: '公司成立，专注于电子产品研发与销售。' },
  { year: '2013', content: '获得 ISO9001 质量管理体系认证，产品线扩展至家居领域。' },
  { year: '2016', content: '成立海外事业部，产品首次出口欧洲市场。' },
  { year: '2019', content: '获得 A 轮融资，研发中心正式落成。' },
  { year: '2022', content: '通过高新技术企业认定，出口国家突破 30 个。' },
  { year: '2026', content: '智能工厂正式投产，年产能提升 3 倍，出口 50+ 国家。' }
]

const VALUES: ValueItem[] = [
  { icon: '🎯', title: '客户至上', desc: '以客户需求为导向，持续提供超越期待的产品与服务。' },
  { icon: '💡', title: '创新驱动', desc: '持续研发投入，用技术创新引领行业发展。' },
  { icon: '🤝', title: '诚信合作', desc: '与客户、伙伴、员工建立长期互信的合作关系。' },
  { icon: '🏆', title: '追求卓越', desc: '对品质精益求精，对细节一丝不苟。' }
]

const HONORS: HonorItem[] = [
  { name: 'ISO9001 质量管理认证', image: 'https://picsum.photos/400/300?random=301' },
  { name: '国家高新技术企业', image: 'https://picsum.photos/400/300?random=302' },
  { name: 'CE 认证证书', image: 'https://picsum.photos/400/300?random=303' },
  { name: 'FCC 认证证书', image: 'https://picsum.photos/400/300?random=304' },
  { name: 'RoHS 环保认证', image: 'https://picsum.photos/400/300?random=305' },
  { name: '年度最佳供应商', image: 'https://picsum.photos/400/300?random=306' }
]

export function fetchCompanyHistory(): Promise<ApiResult<TimelineItem[]>> {
  return mock(HISTORY)
}

export function fetchCoreValues(): Promise<ApiResult<ValueItem[]>> {
  return mock(VALUES)
}

export function fetchHonors(): Promise<ApiResult<HonorItem[]>> {
  return mock(HONORS)
}
