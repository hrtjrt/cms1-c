import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/* ==========================================================================
   无限滚动加载
   由 hjc/js/common.js 的 createInfiniteScroller() 改写而来。
   原实现操作的是 DOM（innerHTML 追加节点 + classList 切换 done），
   这里改为维护响应式数组 displayedItems，哨兵仍用 IntersectionObserver，
   保留全部可观测行为：每批 pageSize 条、delay 毫秒延迟、
   到底显示 endText、进入加载态显示 loadingLabel。
   ========================================================================== */

export interface UseInfiniteScrollOptions<T> {
  /** 底部哨兵元素 */
  sentinel: Ref<HTMLElement | null>
  /** 当前完整数据源（筛选后可能变化） */
  items: Ref<readonly T[]> | (() => readonly T[])
  /** 每批加载条数 */
  pageSize: number
  /** 模拟网络延迟，默认 400ms */
  delay?: number
  /** 距离视口多少时提前触发，默认 200px */
  rootMargin?: string
  /** 到底文案 */
  endText?: string
  /** 加载中文案 */
  loadingLabel?: string
}

export function useInfiniteScroll<T>(options: UseInfiniteScrollOptions<T>) {
  const {
    sentinel,
    items,
    pageSize,
    delay = 400,
    rootMargin = '200px',
    endText = '—— 已经到底啦 ——',
    loadingLabel = '加载中...'
  } = options

  const readItems = (): readonly T[] => (typeof items === 'function' ? items() : items.value)

  /** 已渲染的条目 */
  const displayedItems = ref<T[]>([]) as Ref<T[]>
  /** 哨兵下方显示的文案 */
  const statusText = ref(loadingLabel)
  /** 是否已加载到底 */
  const done = ref(false)

  let displayedCount = 0
  let isLoading = false
  let timer: number | null = null
  let observer: IntersectionObserver | null = null

  function loadMore(): void {
    const source = readItems()

    if (timer !== null) {
      window.clearTimeout(timer)
      timer = null
    }

    // 数据源为空：清空列表、不显示转圈和文案（与原实现 empty 分支一致）
    if (source.length === 0) {
      isLoading = false
      displayedCount = 0
      displayedItems.value = []
      statusText.value = ''
      done.value = true
      return
    }

    if (isLoading) return

    if (displayedCount >= source.length) {
      statusText.value = endText
      done.value = true
      return
    }

    isLoading = true
    statusText.value = loadingLabel
    done.value = false

    timer = window.setTimeout(() => {
      timer = null
      const current = readItems()
      const batch = current.slice(displayedCount, displayedCount + pageSize)
      displayedCount += batch.length
      displayedItems.value = [...displayedItems.value, ...batch]
      isLoading = false

      if (displayedCount >= current.length) {
        statusText.value = endText
        done.value = true
      }
    }, delay)
  }

  /** 数据源变化时重置进度 */
  function reset(): void {
    if (timer !== null) {
      window.clearTimeout(timer)
      timer = null
    }
    isLoading = false
    displayedCount = 0
    displayedItems.value = []
  }

  /** 重置并立即加载第一批 */
  function reload(): void {
    reset()
    loadMore()
  }

  function getDisplayedCount(): number {
    return displayedCount
  }

  watch(
    sentinel,
    (el, previous) => {
      if (previous && observer) observer.unobserve(previous)
      if (el) {
        if (!observer) {
          observer = new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting && displayedCount < readItems().length) {
                loadMore()
              }
            },
            { rootMargin }
          )
        }
        observer.observe(el)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (timer !== null) window.clearTimeout(timer)
    observer?.disconnect()
    observer = null
  })

  return { displayedItems, statusText, done, loadMore, reset, reload, getDisplayedCount }
}
