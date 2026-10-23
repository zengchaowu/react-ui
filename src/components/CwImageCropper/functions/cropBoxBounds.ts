import type { ImageBounds } from './imageBounds'

/**
 * 裁剪框信息
 */
export interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 确保裁剪框完全在图片范围内
 */
export function clampCropBoxToBounds(cropBox: CropBox, bounds: ImageBounds): CropBox {
  const result = { ...cropBox }

  // 先确保尺寸不超过图片尺寸（这是最严格的限制）
  const maxWidth = bounds.width
  const maxHeight = bounds.height

  result.width = Math.max(1, Math.min(result.width, maxWidth))
  result.height = Math.max(1, Math.min(result.height, maxHeight))

  // 确保位置在图片范围内
  const maxX = bounds.maxX - result.width
  const maxY = bounds.maxY - result.height

  result.x = Math.max(bounds.minX, Math.min(result.x, maxX))
  result.y = Math.max(bounds.minY, Math.min(result.y, maxY))

  // 最终验证：如果仍然超出，调整尺寸（确保完全在图片内）
  if (result.x + result.width > bounds.maxX) {
    result.width = bounds.maxX - result.x
    result.width = Math.max(1, result.width)
  }
  if (result.y + result.height > bounds.maxY) {
    result.height = bounds.maxY - result.y
    result.height = Math.max(1, result.height)
  }
  if (result.x < bounds.minX) {
    result.x = bounds.minX
  }
  if (result.y < bounds.minY) {
    result.y = bounds.minY
  }

  // 最终确保尺寸和位置都在范围内
  result.width = Math.max(1, Math.min(result.width, bounds.width))
  result.height = Math.max(1, Math.min(result.height, bounds.height))

  // 再次检查位置，确保裁剪框完全在图片内
  if (result.x + result.width > bounds.maxX) {
    result.width = bounds.maxX - result.x
  }
  if (result.y + result.height > bounds.maxY) {
    result.height = bounds.maxY - result.y
  }

  // 确保尺寸至少为1px
  result.width = Math.max(1, result.width)
  result.height = Math.max(1, result.height)

  return result
}
