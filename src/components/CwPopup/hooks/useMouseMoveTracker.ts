import { useEffect, useRef } from 'react'
import type { PopupState } from '@zengchaowu/ui-shared/components/CwPopup/types/state'
import { DEFAULT_CONFIG } from '@zengchaowu/ui-shared/components/CwPopup/constants'

export interface UseMouseMoveTrackerOptions {
  state: PopupState
  onMove: () => void
  throttleDelay?: number
}

/**
 * 鼠标移动追踪 Hook
 * 负责节流处理鼠标移动事件，避免频繁触发位置更新
 *
 * 注意：onMove 通过 ref 访问，effect 只依赖 state.visible / throttleDelay。
 * 否则若 onMove 每次渲染都是新引用（virtual-reference 场景下 virtualReference
 * 随鼠标移动变化 → getTriggerElement 重建 → onMove 链重建），effect 会反复
 * cleanup+re-run，移除/重加 mousemove 监听器并重置节流状态，导致"过一两秒就不跟随"。
 */
export function useMouseMoveTracker(options: UseMouseMoveTrackerOptions): void {
  const { state, onMove, throttleDelay = DEFAULT_CONFIG.throttleDelay } = options

  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove

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
            onMoveRef.current()
            lastUpdateTime = Date.now()
          }, throttleDelay - (now - lastUpdateTime))
        }
        return
      }

      // 立即执行
      onMoveRef.current()
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
  }, [state.visible, throttleDelay])
}
