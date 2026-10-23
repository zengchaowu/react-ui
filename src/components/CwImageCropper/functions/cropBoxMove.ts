import type { ImageBounds } from './imageBounds'
import type { CropBox } from './cropBoxBounds'
import { clampCropBoxToBounds } from './cropBoxBounds'

/**
 * 移动裁剪框
 */
export function moveCropBox(
  startCropBox: CropBox,
  deltaX: number,
  deltaY: number,
  bounds: ImageBounds
): CropBox {
  const newX = startCropBox.x + deltaX
  const newY = startCropBox.y + deltaY

  const maxX = bounds.maxX - startCropBox.width
  const maxY = bounds.maxY - startCropBox.height

  const newCropBox: CropBox = {
    ...startCropBox,
    x: Math.max(bounds.minX, Math.min(maxX, newX)),
    y: Math.max(bounds.minY, Math.min(maxY, newY))
  }

  // 使用统一函数确保裁剪框在图片范围内
  const clampedBox = clampCropBoxToBounds(newCropBox, bounds)

  // 取整以避免小数点导致的白线问题
  return {
    x: Math.round(clampedBox.x),
    y: Math.round(clampedBox.y),
    width: Math.round(clampedBox.width),
    height: Math.round(clampedBox.height)
  }
}
