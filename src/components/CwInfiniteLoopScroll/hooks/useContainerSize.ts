import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 容器尺寸监听 Hook
 */
export function useContainerSize(container: HTMLElement | null) {
  const [containerHeight, setContainerHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const updateContainerSize = useCallback(() => {
    if (!container) {
      setContainerHeight(0)
      setContainerWidth(0)
      return
    }
    setContainerHeight(container.clientHeight)
    setContainerWidth(container.clientWidth)
  }, [container])

  const containerRef = useRef(container)
  containerRef.current = container

  useEffect(() => {
    updateContainerSize()

    if (!container || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      const el = containerRef.current
      if (!el) return
      setContainerHeight(el.clientHeight)
      setContainerWidth(el.clientWidth)
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [container, updateContainerSize])

  return {
    containerHeight,
    containerWidth,
    updateContainerSize,
  }
}
