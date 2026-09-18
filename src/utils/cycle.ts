/**
 * 从只读数组中按下标循环取值。
 * 项目开启了 noUncheckedIndexedAccess，直接 arr[i] 会得到 T | undefined，
 * 对于「下标必定落在范围内」的循环取模场景用此辅助函数收敛类型。
 */
export function cycle<T>(list: readonly T[], index: number): T {
  const size = list.length
  return list[((index % size) + size) % size] as T
}
