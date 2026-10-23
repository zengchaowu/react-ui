import { useEffect } from 'react'
import type { PopupState } from '../types/state'

export interface UsePopupResizeObserverOptions {
  state: PopupState
  targetElement: () => HTMLElement | null
  onResize: () => void
  /** 是否启用（浮层需 visible 且容器已挂载） */
  enabled?: boolean
}

/**
 * 弹出层 ResizeObserver Hook
 * 负责监听元素大小变化
 */
export function usePopupResizeObserver(options: UsePopupResizeObserverOptions): void {
  const { state, targetElement, onResize, enabled = true } = options

  useEffect(() => {
    if (!enabled) return
    if (typeof ResizeObserver === 'undefined') return

    const element = targetElement()
    if (!element) return

    const resizeObserver = new ResizeObserver(() => {
      // 只在 visible 为 true 时才触发更新
      if (state.visible) {
        onResize()
      }
    })

    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [enabled, state, state.visible, targetElement, onResize])
}
