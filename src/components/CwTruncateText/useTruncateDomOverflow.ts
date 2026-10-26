import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'

/** 检测根节点是否因 CSS 省略产生可视溢出（scrollWidth > clientWidth） */
export function useTruncateDomOverflow(
  rootEl: HTMLElement | null,
  rootRef: RefObject<HTMLElement | null>,
) {
  const [isOverflowing, setIsOverflowing] = useState(false)

  const measure = useCallback(() => {
    // 读 ref 而不是 rootEl 状态：节点切换时状态可能还指向已卸载的旧节点
    const el = rootRef.current
    if (!el) {
      setIsOverflowing(false)
      return
    }
    setIsOverflowing(el.scrollWidth > el.clientWidth + 1)
  }, [rootRef])

  useLayoutEffect(() => {
    measure()
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(el)
    return () => {
      resizeObserver.disconnect()
    }
  }, [measure, rootEl, rootRef])

  return { isOverflowing, remeasureOverflow: measure }
}
