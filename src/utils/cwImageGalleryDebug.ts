/**
 * Markdown 全屏图集链路的调试输出。
 * - 开发 (import.meta.env.DEV) 时默认打印
 * - 或控制台: localStorage.setItem('CW_DEBUG_IMAGE_GALLERY', '1') 后刷新
 * - 关闭: localStorage.removeItem('CW_DEBUG_IMAGE_GALLERY')
 */
function isCwImageGalleryDebugEnabled(): boolean {
  try {
    if (import.meta.env?.DEV) return true
  } catch {
    /* ignore */
  }
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem('CW_DEBUG_IMAGE_GALLERY') === '1'
    )
  } catch {
    return false
  }
}

export function cwImageGalleryDebug(
  label: string,
  extra?: Record<string, unknown> | string | number | boolean | null,
): void {
  if (!isCwImageGalleryDebugEnabled()) return
  if (extra === undefined) {
    console.log(`[cw-image-gallery] ${label}`)
    return
  }
  if (typeof extra === 'object' && extra !== null) {
    console.log(`[cw-image-gallery] ${label}`, { ...extra })
  } else {
    console.log(`[cw-image-gallery] ${label}`, extra)
  }
}
