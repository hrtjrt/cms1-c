import { onBeforeUnmount, onMounted } from 'vue'

/* ==========================================================================
   自动轮播计时器
   hjc 里 home.js 的三套轮播各自实现了 start/stop Timer，
   这里收敛成一个 composable：挂载即启动，卸载自动清理。
   ========================================================================== */

export function useAutoPlay(callback: () => void, interval: number) {
  let timer: number | null = null

  function stop(): void {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  function start(): void {
    stop()
    timer = window.setInterval(callback, interval)
  }

  onMounted(start)
  onBeforeUnmount(stop)

  return { start, stop }
}
