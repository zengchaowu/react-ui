import { preloadRasterImageUrl } from '../../CwImageFit/functions/preloadRasterImageUrl'
import { IM_RICH_INLINE_IMAGE_ATTR } from '@zengchaowu/shared/functions/im/imRichContentHtml'

/**
 * 粘贴后补齐缺失的 naturalWidth/Height（跨应用复制或旧 wire HTML 无尺寸时）。
 * Vue 侧接收 Tiptap Editor；React 侧直接操作编辑器 DOM，返回是否有改动。
 */
export async function backfillInlineImageDimensions(
  root: HTMLElement,
): Promise<boolean> {
  const pending: { img: HTMLImageElement; src: string }[] = []
  root.querySelectorAll<HTMLImageElement>(`img[${IM_RICH_INLINE_IMAGE_ATTR}]`).forEach((img) => {
    const wrap = img.closest<HTMLElement>('[data-cw-inline-image-wrap]')
    const w =
      Number(wrap?.getAttribute('data-natural-width')) ||
      Number(img.getAttribute('width')) ||
      0
    const h =
      Number(wrap?.getAttribute('data-natural-height')) ||
      Number(img.getAttribute('height')) ||
      0
    if (w > 0 && h > 0) return
    const src = (wrap?.getAttribute('data-preview-src') || img.getAttribute('src') || '').trim()
    if (!src) return
    pending.push({ img, src })
  })
  if (pending.length === 0) return false

  const sized = await Promise.all(
    pending.map(async (item) => {
      try {
        const dim = await preloadRasterImageUrl(item.src)
        if (dim.width > 0 && dim.height > 0) return { ...item, ...dim }
      } catch {
        /* CwImageFit onLoad 兜底 */
      }
      return null
    }),
  )

  let touched = false
  for (const hit of sized) {
    if (!hit) continue
    hit.img.setAttribute('width', String(hit.width))
    hit.img.setAttribute('height', String(hit.height))
    const wrap = hit.img.closest<HTMLElement>('[data-cw-inline-image-wrap]')
    wrap?.setAttribute('data-natural-width', String(hit.width))
    wrap?.setAttribute('data-natural-height', String(hit.height))
    touched = true
  }
  return touched
}
