import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * 监听容器尺寸变化的 Hook（对应 vue-ui `useContainerSize`）
 */
export function useContainerSize(containerRef: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const updateSize = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setWidth(el.clientWidth)
    setHeight(el.clientHeight)
  }, [containerRef])

  useEffect(() => {
    updateSize()

    // 使用 ResizeObserver 监听容器尺寸变化
    const el = containerRef.current
    let resizeObserver: ResizeObserver | null = null
    if (el && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize()
      })
      resizeObserver.observe(el)
    }

    // 监听窗口大小变化（作为后备方案）
    window.addEventListener('resize', updateSize)

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      window.removeEventListener('resize', updateSize)
    }
  }, [containerRef, updateSize])

  return {
    width,
    height,
    updateSize,
  }
}
