/**
 * 计算图片显示尺寸（保持宽高比，完全显示在容器内）
 */
export interface ImageSize {
  width: number
  height: number
}

export interface ContainerSize {
  width: number
  height: number
}

export function calculateImageSize(
  imageSize: ImageSize | null,
  containerSize: ContainerSize | null
): { width: string; height: string } {
  if (
    !imageSize ||
    !containerSize ||
    !imageSize.width ||
    !imageSize.height ||
    !containerSize.width ||
    !containerSize.height
  ) {
    return { width: 'auto', height: 'auto' }
  }

  const { width: imgW, height: imgH } = imageSize
  const { width: ctW, height: ctH } = containerSize

  // 规则：
  // 1. 如果图片本身宽高都小于等于容器，则不放大，使用原始尺寸，靠 flex 居中显示
  if (imgW <= ctW && imgH <= ctH) {
    return {
      width: `${imgW}px`,
      height: `${imgH}px`
    }
  }

  // 2. 否则使用 contain 逻辑：在不改变比例的前提下尽量铺满容器
  const imageAspectRatio = imgW / imgH
  const containerAspectRatio = ctW / ctH

  let displayWidth: number
  let displayHeight: number

  if (imageAspectRatio > containerAspectRatio) {
    // 图片更宽，以宽度为准
    displayWidth = ctW
    displayHeight = ctW / imageAspectRatio
  } else {
    // 图片更高或相等，以高度为准
    displayHeight = ctH
    displayWidth = ctH * imageAspectRatio
  }

  return {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`
  }
}

export interface BoundedFitOptions {
  maxWidth: number
  maxHeight: number
  minWidth?: number
  minHeight?: number
}

/** 行内展示：按原图比例适配，并限制最大/最小宽高（不放大超过 max） */
export function calculateBoundedFitSize(
  imageSize: ImageSize,
  bounds: BoundedFitOptions,
): { width: number; height: number } {
  const fit = calculateImageSize(imageSize, {
    width: bounds.maxWidth,
    height: bounds.maxHeight,
  })
  let w = parseFloat(fit.width)
  let h = parseFloat(fit.height)
  if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
    return { width: 1, height: 1 }
  }

  const minW = bounds.minWidth ?? 0
  const minH = bounds.minHeight ?? 0
  if (minW > 0 || minH > 0) {
    const scaleUp = Math.max(minW > 0 ? minW / w : 1, minH > 0 ? minH / h : 1, 1)
    if (scaleUp > 1) {
      w = Math.round(w * scaleUp)
      h = Math.round(h * scaleUp)
      const scaleDown = Math.min(
        bounds.maxWidth / w,
        bounds.maxHeight / h,
        1,
      )
      if (scaleDown < 1) {
        w = Math.max(1, Math.round(w * scaleDown))
        h = Math.max(1, Math.round(h * scaleDown))
      }
    }
  }

  return {
    width: Math.max(1, Math.round(w)),
    height: Math.max(1, Math.round(h)),
  }
}
