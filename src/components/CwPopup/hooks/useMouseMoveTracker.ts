import { useEffect } from 'react'
import type { PopupState } from '../types/state'
import { DEFAULT_CONFIG } from '../constants'

export interface UseMouseMoveTrackerOptions {
  state: PopupState
  onMove: () => void
  throttleDelay?: number
}

/**
 * 鼠标移动追踪 Hook
 * 负责节流处理鼠标移动事件，避免频繁触发位置更新
 */
export function useMouseMoveTracker(options: UseMouseMoveTrackerOptions): void {
  const { state, onMove, throttleDelay = DEFAULT_CONFIG.throttleDelay } = options

  useEffect(() => {
    if (!state.visible) return

    let throttleTimer: number | null = null
    let lastUpdateTime = 0

    const handleMouseMove = () => {
      const now = Date.now()

      // 节流：如果距离上次更新时间太短，延迟执行
      if (now - lastUpdateTime < throttleDelay) {
        if (throttleTimer == null) {
          throttleTimer = window.setTimeout(() => {
            throttleTimer = null
            onMove()
            lastUpdateTime = Date.now()
          }, throttleDelay - (now - lastUpdateTime))
        }
        return
      }

      // 立即执行
      onMove()
      lastUpdateTime = now
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (throttleTimer != null) {
        window.clearTimeout(throttleTimer)
        throttleTimer = null
      }
    }
  }, [state.visible, throttleDelay, onMove])
}
