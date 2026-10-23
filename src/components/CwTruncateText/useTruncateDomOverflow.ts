import { useCallback, useLayoutEffect, useState } from 'react'

/** 检测根节点是否因 CSS 省略产生可视溢出（scrollWidth > clientWidth） */
export function useTruncateDomOverflow(rootEl: HTMLElement | null) {
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measure = useCallback(() => {
    if (!rootEl) {
      setIsOverflowing(false)
      return
    }
    setIsOverflowing(rootEl.scrollWidth > rootEl.clientWidth + 1)
  }, [rootEl])

  useLayoutEffect(() => {
    measure()
    if (!rootEl || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(rootEl)
    return () => {
      resizeObserver.disconnect()
    }
  }, [measure, rootEl])

  return { isOverflowing, remeasureOverflow: measure }
}
