import type { ImageBounds } from './imageBounds'
import type { CropBox } from './cropBoxBounds'
import { clampCropBoxToBounds } from './cropBoxBounds'

/**
 * 调整裁剪框尺寸
 */
export function adjustCropBoxSize(
  startCropBox: CropBox,
  deltaX: number,
  deltaY: number,
  handlePosition: string,
  bounds: ImageBounds,
  aspectRatio?: [number, number]
): CropBox {
  let newCropBox = { ...startCropBox }

  // 根据手柄位置调整裁剪框
  switch (handlePosition) {
    case 'nw':
      newCropBox.x = startCropBox.x + deltaX
      newCropBox.y = startCropBox.y + deltaY
      newCropBox.width = startCropBox.width - deltaX
      newCropBox.height = startCropBox.height - deltaY
      break
    case 'ne':
      newCropBox.y = startCropBox.y + deltaY
      newCropBox.width = startCropBox.width + deltaX
      newCropBox.height = startCropBox.height - deltaY
      break
    case 'sw':
      newCropBox.x = startCropBox.x + deltaX
      newCropBox.width = startCropBox.width - deltaX
      newCropBox.height = startCropBox.height + deltaY
      break
    case 'se':
      newCropBox.width = startCropBox.width + deltaX
      newCropBox.height = startCropBox.height + deltaY
      break
  }

  // 确保尺寸至少为1px
  newCropBox.width = Math.max(1, newCropBox.width)
  newCropBox.height = Math.max(1, newCropBox.height)

  // 应用宽高比限制（如果有）
  if (aspectRatio) {
    const [ratioW, ratioH] = aspectRatio
    const targetRatio = ratioW / ratioH
    const currentRatio = newCropBox.width / newCropBox.height

    if (currentRatio > targetRatio) {
      newCropBox.height = newCropBox.width / targetRatio
    } else {
      newCropBox.width = newCropBox.height * targetRatio
    }
  }

  // 严格限制尺寸不超过图片显示区域（这是最关键的）
  newCropBox.width = Math.max(1, Math.min(newCropBox.width, bounds.width))
  newCropBox.height = Math.max(1, Math.min(newCropBox.height, bounds.height))

  // 如果有宽高比，需要重新计算以确保宽高比正确
  if (aspectRatio) {
    const [ratioW, ratioH] = aspectRatio
    const targetRatio = ratioW / ratioH

    // 在图片范围内计算最大可能的尺寸（保持宽高比）
    const maxWidthByHeight = Math.min(newCropBox.height * targetRatio, bounds.width)
    const maxHeightByWidth = Math.min(newCropBox.width / targetRatio, bounds.height)

    // 选择较小的尺寸以确保完全在图片内
    if (maxWidthByHeight <= newCropBox.width) {
      newCropBox.width = maxWidthByHeight
      newCropBox.height = newCropBox.width / targetRatio
    } else {
      newCropBox.height = maxHeightByWidth
      newCropBox.width = newCropBox.height * targetRatio
    }

    // 再次确保不超过图片尺寸
    newCropBox.width = Math.max(1, Math.min(newCropBox.width, bounds.width))
    newCropBox.height = Math.max(1, Math.min(newCropBox.height, bounds.height))
  }

  // 限制位置
  const maxX = bounds.maxX - newCropBox.width
  const maxY = bounds.maxY - newCropBox.height

  newCropBox.x = Math.max(bounds.minX, Math.min(maxX, newCropBox.x))
  newCropBox.y = Math.max(bounds.minY, Math.min(maxY, newCropBox.y))

  // 最终验证：确保裁剪框完全在图片内
  if (newCropBox.x + newCropBox.width > bounds.maxX) {
    newCropBox.width = bounds.maxX - newCropBox.x
    newCropBox.width = Math.max(1, newCropBox.width)
    if (aspectRatio) {
      const [ratioW, ratioH] = aspectRatio
      const targetRatio = ratioW / ratioH
      newCropBox.height = newCropBox.width / targetRatio
      if (newCropBox.y + newCropBox.height > bounds.maxY) {
        newCropBox.height = bounds.maxY - newCropBox.y
        newCropBox.height = Math.max(1, newCropBox.height)
        newCropBox.width = newCropBox.height * targetRatio
        newCropBox.width = Math.max(1, Math.min(newCropBox.width, bounds.width))
        newCropBox.x = bounds.maxX - newCropBox.width
      }
    }
  }

  if (newCropBox.y + newCropBox.height > bounds.maxY) {
    newCropBox.height = bounds.maxY - newCropBox.y
    newCropBox.height = Math.max(1, newCropBox.height)
    if (aspectRatio) {
      const [ratioW, ratioH] = aspectRatio
      const targetRatio = ratioW / ratioH
      newCropBox.width = newCropBox.height * targetRatio
      if (newCropBox.x + newCropBox.width > bounds.maxX) {
        newCropBox.width = bounds.maxX - newCropBox.x
        newCropBox.width = Math.max(1, newCropBox.width)
        newCropBox.height = newCropBox.width / targetRatio
        newCropBox.height = Math.max(1, Math.min(newCropBox.height, bounds.height))
        newCropBox.y = bounds.maxY - newCropBox.height
      }
    }
  }

  if (newCropBox.x < bounds.minX) {
    newCropBox.x = bounds.minX
  }

  if (newCropBox.y < bounds.minY) {
    newCropBox.y = bounds.minY
  }

  // 最终确保尺寸不超过图片尺寸
  newCropBox.width = Math.max(1, Math.min(newCropBox.width, bounds.width))
  newCropBox.height = Math.max(1, Math.min(newCropBox.height, bounds.height))

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
