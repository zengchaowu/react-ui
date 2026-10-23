/**
 * 图片边界信息
 */
export interface ImageBounds {
  x: number
  y: number
  width: number
  height: number
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * 计算图片在容器中的显示边界
 */
export function calculateImageBounds(
  containerWidth: number,
  containerHeight: number,
  imgWidth: number,
  imgHeight: number
): ImageBounds | null {
  // 检查图片尺寸是否有效
  if (imgWidth === 0 || imgHeight === 0 || containerWidth === 0 || containerHeight === 0) {
    return null
  }

  // 如果图片比容器小，按原始尺寸显示（不放大）
  if (imgWidth <= containerWidth && imgHeight <= containerHeight) {
    const offsetX = (containerWidth - imgWidth) / 2
    const offsetY = (containerHeight - imgHeight) / 2

    return {
      x: offsetX,
      y: offsetY,
      width: imgWidth,
      height: imgHeight,
      minX: offsetX,
      minY: offsetY,
      maxX: offsetX + imgWidth,
      maxY: offsetY + imgHeight
    }
  }

  // 如果图片比容器大，按比例缩放到容器内
  const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight)
  const displayWidth = imgWidth * scale
  const displayHeight = imgHeight * scale

  // 计算居中位置
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  return {
    x: offsetX,
    y: offsetY,
    width: displayWidth,
    height: displayHeight,
    minX: offsetX,
    minY: offsetY,
    maxX: offsetX + displayWidth,
    maxY: offsetY + displayHeight
  }
}
