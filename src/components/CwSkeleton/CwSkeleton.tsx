import { useMemo, type CSSProperties } from 'react'
import type { CwSkeletonProps } from './types'
import type { CwSkeletonStyles } from '@zengchaowu/ui-shared/components/CwSkeleton/types'
import { skeletonBase } from '@zengchaowu/ui-shared/components/CwSkeleton/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwSkeleton/texts'

export function CwSkeleton({
  shape = 'rect',
  width,
  height,
  animated = true,
  texts,
  className,
  ...rest
}: CwSkeletonProps) {
  const styles: CwSkeletonStyles = skeletonBase

  const resolvedTexts = useMemo(
    () => ({ ...defaultTexts, ...(texts ?? {}) }),
    [texts],
  )

  // 形状样式
  const shapeClass = (() => {
    switch (shape) {
      case 'circle':
        return styles.circle
      case 'rounded':
        return styles.rounded
      default:
        return styles.rect
    }
  })()

  // 动画样式
  const animatedClass = animated ? styles.animated : ''

  // 尺寸样式
  const sizeStyle = useMemo<CSSProperties | undefined>(() => {
    const next: CSSProperties = {}

    if (width !== undefined) {
      next.width = typeof width === 'number' ? `${width}px` : width
    }

    if (height !== undefined) {
      next.height = typeof height === 'number' ? `${height}px` : height
    }

    return Object.keys(next).length > 0 ? next : undefined
  }, [width, height])

  return (
    <div
      {...rest}
      className={[styles.root, shapeClass, animatedClass, className].filter(Boolean).join(' ')}
      style={sizeStyle}
      aria-label={resolvedTexts.label}
      role="status"
      aria-live="polite"
    />
  )
}

export default CwSkeleton
