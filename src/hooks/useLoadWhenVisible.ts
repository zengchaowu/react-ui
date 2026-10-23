import { useEffect, useRef, useState } from 'react'

export interface UseLoadWhenVisibleOptions {
  /** 为 false 时立即视为可见（首屏头像等） */
  enabled?: boolean
  /** IntersectionObserver rootMargin，略提前加载 */
  rootMargin?: string
  root?: Element | Document | null
}

/**
 * 元素进入视口（或 rootMargin 扩展区）后再允许加载资源。
 * SSR / 无 IO 时回退为立即加载。
 */
export function useLoadWhenVisible(options: UseLoadWhenVisibleOptions = {}) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  const enabled = options.enabled ?? true
  const rootMargin = options.rootMargin ?? '200px'
  const observeRoot = options.root ?? null

  useEffect(() => {
    if (!enabled) {
      setIsInView(true)
      return
    }
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }
    const el = rootRef.current
    if (!el) return

    setIsInView(false)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { root: observeRoot, rootMargin, threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, rootMargin, observeRoot])

  const shouldLoad = !enabled || isInView

  return { rootRef, shouldLoad, isInView }
}
