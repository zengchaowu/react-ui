import type { ImageBounds } from './imageBounds'
import type { CropBox } from './cropBoxBounds'
import { clampCropBoxToBounds } from './cropBoxBounds'

/**
 * 计算初始裁剪框位置和尺寸
 */
export function calculateInitialCropBox(
  bounds: ImageBounds,
  aspectRatio?: [number, number]
): CropBox {
  // 设置初始裁剪框（居中，大小为图片尺寸的80%）
  let cropWidth = bounds.width * 0.8
  let cropHeight = bounds.height * 0.8

  // 如果有宽高比限制，调整尺寸（但保持 80% 的默认大小，不填充满）
  if (aspectRatio) {
    const [ratioW, ratioH] = aspectRatio
    const targetRatio = ratioW / ratioH
    const currentRatio = cropWidth / cropHeight

    // 根据目标宽高比调整，保持 80% 的默认大小范围
    if (currentRatio > targetRatio) {
      // 当前宽度太大，以高度为基准调整宽度
      cropWidth = cropHeight * targetRatio
    } else {
      // 当前高度太大，以宽度为基准调整高度
      cropHeight = cropWidth / targetRatio
    }

    // 如果调整后的尺寸超过了 80% 的范围，需要缩小
    if (cropWidth > bounds.width * 0.8 || cropHeight > bounds.height * 0.8) {
      const scale = Math.min(
        (bounds.width * 0.8) / cropWidth,
        (bounds.height * 0.8) / cropHeight
      )
      cropWidth = cropWidth * scale
      cropHeight = cropHeight * scale
    }
  }

  // 确保裁剪框尺寸不超过图片显示区域，且至少为1px
  cropWidth = Math.max(1, Math.min(cropWidth, bounds.width))
  cropHeight = Math.max(1, Math.min(cropHeight, bounds.height))

  // 居中裁剪框
  const cropX = bounds.x + (bounds.width - cropWidth) / 2
  const cropY = bounds.y + (bounds.height - cropHeight) / 2

  const cropBox: CropBox = {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight
  }

  // 使用统一函数确保裁剪框在图片范围内
  const clampedBox = clampCropBoxToBounds(cropBox, bounds)

  // 取整以避免小数点导致的白线问题
  return {
    x: Math.round(clampedBox.x),
    y: Math.round(clampedBox.y),
    width: Math.round(clampedBox.width),
    height: Math.round(clampedBox.height)
  }
}
