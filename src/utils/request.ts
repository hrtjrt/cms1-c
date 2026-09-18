import type { ApiResult } from '@/types'

/* ==========================================================================
   请求层
   原 hjc 项目没有任何 HTTP 调用，数据全部在页面脚本里现场生成。
   这里统一保留「取数」入口：现阶段走 mock()，后端就绪后把 api/*.ts 里的
   mock(...) 换成 http('真实路径', ...) 即可，调用方无需改动。
   ========================================================================== */

/** 后端基址；留空时同源部署。可通过 .env 的 VITE_API_BASE_URL 覆盖 */
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
 * 真实 HTTP 请求（当前未被调用，后端上线后启用）
 * 响应体约定与 ApiResult 一致：{ code, message, data }
 */
export async function http<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${path}`
  let response: Response
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      ...init
    })
  } catch (error) {
    throw new RequestError('网络异常，请稍后重试', -1, 0)
  }

  if (!response.ok) {
    throw new RequestError(`请求失败（HTTP ${response.status}）`, -1, response.status)
  }

  const result = (await response.json()) as ApiResult<T>
  if (result.code !== 0) {
    throw new RequestError(result.message || '请求失败', result.code, response.status)
  }
  return result
}

/**
 * mock 数据通道：模拟一次网络往返
 * @param data  要返回的数据
 * @param delay 模拟延迟，默认 300ms
 */
export function mock<T>(data: T, delay = 300): Promise<ApiResult<T>> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ code: 0, message: 'ok', data }), delay)
  })
}

/** 从 ApiResult 中取 data，并向上抛出业务错误 */
export async function unwrap<T>(promise: Promise<ApiResult<T>>): Promise<T> {
  const result = await promise
  if (result.code !== 0) {
    throw new RequestError(result.message || '请求失败', result.code)
  }
  return result.data
}
