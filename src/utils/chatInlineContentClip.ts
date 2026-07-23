import type { CwImageGalleryItem } from '../components/CwImageGallery/types'
import type { ImRichContentSegment } from '@zengchaowu/shared/functions/im/imRichContentHtml'
import { pathLastSegment } from '@zengchaowu/shared/functions/path/pathLastSegment'
import { isInlinePreviewableAssetUrl } from '@zengchaowu/shared/functions/url/assetUrlGuards'

/** 行内文件 chip 前导 CwFileIcon：尺寸由 chip 外层 em 承担 */
export const FILE_CHIP_CW_FILE_ICON_SIZE = 0

export const FILE_CHIP_PATH_TOOLTIP_SHOW_DELAY = 300

export function basenameFromFilePath(path: string, fallback = 'file'): string {
  const p = path.trim()
  if (!p) return fallback
  return pathLastSegment(p) || p
}

export function canPreviewInlineImageUrl(url: string): boolean {
  return isInlinePreviewableAssetUrl(url)
}

/** 从正文解析结果收集可画廊预览的内联图片 */
export function buildInlineImageGalleryItems(
  segments: readonly ImRichContentSegment[],
): CwImageGalleryItem[] {
  const items: CwImageGalleryItem[] = []
  let key = 0
  for (const seg of segments) {
    if (seg.type !== 'image' || !seg.url) continue
    if (!canPreviewInlineImageUrl(seg.url)) continue
    items.push({
      key: `inline-${key++}`,
      src: seg.url,
    } as CwImageGalleryItem)
  }
  return items
}
