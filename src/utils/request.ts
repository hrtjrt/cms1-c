import type { ApiResult } from '@/types'

/* ==========================================================================
   请求层
   v2 起前台不再使用本地 mock，全部数据来自后端的公开接口 /api/public/*。
   调用方统一用 `get` / `post` 拿到「已验证的 data」：
   网络异常、HTTP 非 2xx、业务 code !== 0 都会抛 RequestError，
   页面按需 catch 后展示空态或错误提示。
   ========================================================================== */

/** 后端基址；留空时同源部署（dev 走 vite 代理）。可通过 .env 的 VITE_API_BASE_URL 覆盖 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/** 统一的请求错误 */
export class RequestError extends Error {
  constructor(
    message: string,
    readonly code = -1,
    readonly status = 0
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

/**
 * 真实 HTTP 请求
 * 响应体约定与 ApiResult 一致：{ code, message, data }
 */
export async function http<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers ?? {})
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new RequestError('网络异常，请确认后端服务已启动', -1, 0)
  }

  const text = await response.text()
  let result: ApiResult<T> | null = null
  if (text) {
    try {
      result = JSON.parse(text) as ApiResult<T>
    } catch {
      result = null
    }
  }

  if (!response.ok) {
    throw new RequestError(
      result?.message ?? `请求失败（HTTP ${response.status}）`,
      result?.code ?? -1,
      response.status
    )
  }

  if (!result) throw new RequestError('服务端返回了非 JSON 内容', -1, response.status)
  if (result.code !== 0) throw new RequestError(result.message || '请求失败', result.code, response.status)

  return result
}

/* ---------------- 快捷方法（直接返回 data） ---------------- */

/** 拼查询串：跳过 undefined / null / 空串 */
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

/** GET，返回 data */
export async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const result = await http<T>(`${path}${buildQuery(params)}`, { method: 'GET' })
  return result.data
}

/** POST，返回 data */
export async function post<T>(path: string, body?: unknown): Promise<T> {
  const result = await http<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  return result.data
}

/* ---------------- 资源地址 ---------------- */

/**
 * 把库里的相对地址（/uploads/xxx.svg）补成可访问的完整地址。
 * 种子占位图与后台管理员上传的图片都以相对地址入库，换域名不用改数据。
 */
export function assetUrl(path: string): string {
  if (!path) return ''
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** 富文本里的相对资源地址补全（新闻正文 / 商品详情用） */
export function resolveHtmlAssets(html: string): string {
  const text = String(html ?? '')
  if (!text || !API_BASE_URL) return text

  return text.replace(
    /(\s(?:src|href|data-src)\s*=\s*["'])(\/uploads\/[^"']*)(["'])/gi,
    (_match, head: string, path: string, tail: string) => `${head}${API_BASE_URL}${path}${tail}`
  )
}
