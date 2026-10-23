import { useLayoutEffect, useState } from 'react'

/**
 * React 版容器尺寸监听 Hook。
 * 传入滚动视口元素（由 CwDiv 暴露），随元素变化重新挂 ResizeObserver。
 */
export function useContainerSize(container: HTMLElement | null) {
  const [containerHeight, setContainerHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  useLayoutEffect(() => {
    if (!container) {
      setContainerHeight(0)
      setContainerWidth(0)
      return
    }

    const updateContainerSize = () => {
      setContainerHeight(container.clientHeight)
      setContainerWidth(container.clientWidth)
    }

    updateContainerSize()
    if (typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize()
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [container])

  return {
    containerHeight,
    containerWidth,
    updateContainerSize: () => {
      if (!container) return
      setContainerHeight(container.clientHeight)
      setContainerWidth(container.clientWidth)
    },
  }
}
