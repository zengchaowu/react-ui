import type { CropCoordinates } from './cropCoordinates'

export interface CropImageLimits {
  /** 输出长边上限（像素）。不放大。 */
  maxEdge?: number
  /** 超过则逐步降低 JPEG/WebP 质量 */
  maxBytes?: number
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  outputFormat: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('裁剪失败'))
      },
      outputFormat,
      quality,
    )
  })
}

/**
 * 使用 Canvas 裁剪图片。
 * 长边受限时只缩小输出画布，避免按原图像素编码把头像确认卡住。
 */
export async function cropImageToBlob(
  img: HTMLImageElement,
  cropCoords: CropCoordinates,
  outputFormat: string = 'image/png',
  quality: number = 0.9,
  limits?: CropImageLimits,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建画布上下文')

  const { cropX, cropY, cropWidth, cropHeight } = cropCoords
  let outWidth = Math.max(1, Math.round(cropWidth))
  let outHeight = Math.max(1, Math.round(cropHeight))
  const maxEdge = limits?.maxEdge
  if (maxEdge && maxEdge > 0) {
    const edge = Math.max(outWidth, outHeight)
    if (edge > maxEdge) {
      const scale = maxEdge / edge
      outWidth = Math.max(1, Math.round(outWidth * scale))
      outHeight = Math.max(1, Math.round(outHeight * scale))
    }
  }

  canvas.width = outWidth
  canvas.height = outHeight
  ctx.drawImage(
    img,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, outWidth, outHeight,
  )

  let blob = await canvasToBlob(canvas, outputFormat, quality)
  const maxBytes = limits?.maxBytes
  if (!maxBytes || blob.size <= maxBytes || outputFormat === 'image/png') {
    return blob
  }

  for (const nextQuality of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    if (nextQuality >= quality) continue
    blob = await canvasToBlob(canvas, outputFormat, nextQuality)
    if (blob.size <= maxBytes) break
  }
  return blob
}
