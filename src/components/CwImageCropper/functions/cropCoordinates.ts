/**
 * 裁剪坐标信息
 */
export interface CropCoordinates {
  cropX: number
  cropY: number
  cropWidth: number
  cropHeight: number
}

/**
 * 计算裁剪区域在原始图片中的坐标和尺寸
 */
export function calculateCropCoordinates(
  cropBoxX: number,
  cropBoxY: number,
  cropBoxWidth: number,
  cropBoxHeight: number,
  containerWidth: number,
  containerHeight: number,
  imgWidth: number,
  imgHeight: number
): CropCoordinates {
  // 计算图片在容器中的实际显示尺寸
  const scale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight)
  const displayWidth = imgWidth * scale
  const displayHeight = imgHeight * scale

  // 计算图片在容器中的偏移
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  // 计算裁剪区域在原始图片中的坐标和尺寸
  const cropX = (cropBoxX - offsetX) / scale
  const cropY = (cropBoxY - offsetY) / scale
  const cropWidth = cropBoxWidth / scale
  const cropHeight = cropBoxHeight / scale

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight
  }
}
