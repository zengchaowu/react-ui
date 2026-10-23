import { useCallback, useState } from 'react'
import type { RefObject } from 'react'

/**
 * 获取图片原始尺寸的 Hook（对应 vue-ui `useImageSize`）
 */
export function useImageSize(imageRef: RefObject<HTMLImageElement | null>) {
  const [naturalWidth, setNaturalWidth] = useState(0)
  const [naturalHeight, setNaturalHeight] = useState(0)

  const updateSize = useCallback(() => {
    const el = imageRef.current
    if (!el) return { width: 0, height: 0 }
    setNaturalWidth(el.naturalWidth)
    setNaturalHeight(el.naturalHeight)
    return { width: el.naturalWidth, height: el.naturalHeight }
  }, [imageRef])

  return {
    naturalWidth,
    naturalHeight,
    updateSize,
  }
}
