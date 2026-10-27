import { useEffect, useRef } from 'react'
import type { PopupState } from '@zengchaowu/ui-shared/components/CwPopup/types/state'

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
 *
 * targetElement / onResize 通过 ref 访问，effect 只依赖 enabled / state.visible。
 * 避免回调引用变化导致 ResizeObserver 频繁 disconnect/observe。
 */
export function usePopupResizeObserver(options: UsePopupResizeObserverOptions): void {
  const { state, targetElement, onResize, enabled = true } = options

  const targetElementRef = useRef(targetElement)
  targetElementRef.current = targetElement
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    if (!enabled) return
    if (typeof ResizeObserver === 'undefined') return

    const element = targetElementRef.current()
    if (!element) return

    const resizeObserver = new ResizeObserver(() => {
      // 只在 visible 为 true 时才触发更新
      if (state.visible) {
        onResizeRef.current()
      }
    })

    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [enabled, state.visible])
}
