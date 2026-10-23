/** 离屏预加载，便于 URL 切换时保留上一帧直至新图进缓存 */
export function preloadRasterImageUrl(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const trimmed = url.trim()
    if (!trimmed) {
      reject(new Error('empty url'))
      return
    }
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => reject(new Error('preload failed'))
    img.src = trimmed
  })
}
