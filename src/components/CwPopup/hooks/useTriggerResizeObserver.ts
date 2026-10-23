import { useEffect, useRef } from 'react'
import type { VirtualElement } from '../types'
import { isRealElement } from '../utils/getElement'

export interface UseTriggerResizeObserverOptions {
  getTriggerElement: () => HTMLElement | VirtualElement | null
  onResize?: (size: { width: number; height: number }) => void
}

/**
 * Trigger 元素尺寸监听 Hook
 * 监听 trigger 元素的尺寸变化
 */
export function useTriggerResizeObserver(options: UseTriggerResizeObserverOptions): void {
  const { getTriggerElement, onResize } = options
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    if (!onResizeRef.current) return
    if (typeof ResizeObserver === 'undefined') return

    const triggerEl = getTriggerElement()
    if (!triggerEl || !isRealElement(triggerEl)) return
    const element = triggerEl

    const triggerResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) {
          const { width, height } = entry.contentRect
          onResizeRef.current?.({ width, height })
        }
      }
    })

    triggerResizeObserver.observe(element)

    return () => triggerResizeObserver.disconnect()
  }, [getTriggerElement])
}
