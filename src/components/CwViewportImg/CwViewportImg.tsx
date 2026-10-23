import { useEffect, useRef, useState } from 'react'
import type { CwViewportImgProps } from './types'

/**
 * 图片进入视口（或 rootMargin 扩展区）后再设置 src。
 * SSR / 无 IntersectionObserver 时回退为立即加载。
 */
export function CwViewportImg({
  src,
  alt = '',
  loadWhenVisible = true,
  loadWhenVisibleRootMargin = '200px',
  ...rest
}: CwViewportImgProps) {
  const rootRef = useRef<HTMLImageElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el || !loadWhenVisible) return

    setIsInView(false)

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: loadWhenVisibleRootMargin,
        threshold: 0,
      },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [loadWhenVisible, loadWhenVisibleRootMargin])

  const shouldLoad = !loadWhenVisible || isInView
  const trimmedSrc = src?.trim()

  return (
    <img
      ref={rootRef}
      src={trimmedSrc && shouldLoad ? trimmedSrc : undefined}
      alt={alt}
      decoding="async"
      draggable="false"
      {...rest}
    />
  )
}

export default CwViewportImg
