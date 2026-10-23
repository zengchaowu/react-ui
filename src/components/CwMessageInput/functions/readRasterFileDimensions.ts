/** 读取本地图片文件的像素尺寸（用于插入前计算行内 clip 占位） */
export async function readRasterFileDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const size = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      if (size.width > 0 && size.height > 0) return size
    } catch {
      /* fall through */
    }
  }

  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('readRasterFileDimensions: URL API unavailable')
  }

  const url = URL.createObjectURL(file)
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight
        if (width > 0 && height > 0) {
          resolve({ width, height })
        } else {
          reject(new Error('invalid natural size'))
        }
      }
      img.onerror = () => reject(new Error('image decode failed'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
