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
 *
 * getTriggerElement / onResize 通过 ref 访问，effect 只在挂载时运行一次。
 * 避免 virtual-reference 场景下 getTriggerElement 引用变化导致 ResizeObserver
 * 频繁 disconnect/observe。
 */
export function useTriggerResizeObserver(options: UseTriggerResizeObserverOptions): void {
  const { getTriggerElement, onResize } = options
  const getTriggerElementRef = useRef(getTriggerElement)
  getTriggerElementRef.current = getTriggerElement
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return

    const triggerEl = getTriggerElementRef.current()
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
  }, [])
}
