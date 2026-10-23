import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * 容器宽度监听 Hook
 */
export function useContainerWidth(
  containerRef: RefObject<HTMLElement | null>,
  onWidthChange: (width: number) => void,
  onResize?: () => void,
) {
  const callbacksRef = useRef({ onWidthChange, onResize })
  callbacksRef.current = { onWidthChange, onResize }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let lastWidth = el.offsetWidth
    callbacksRef.current.onWidthChange(lastWidth)

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      const newWidth = el.offsetWidth
      if (newWidth !== lastWidth) {
        lastWidth = newWidth
        callbacksRef.current.onWidthChange(newWidth)
        callbacksRef.current.onResize?.()
      }
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [containerRef])
}
