import { formatFileSize } from '@zengchaowu/shared/functions/file/formatFileSize'
import type { CwAttachmentGalleryItem } from '../types'

export function resolveAttachmentDisplayName(
  item: CwAttachmentGalleryItem,
  unnamedFallback: string,
): string {
  const name = item.file?.name?.trim()
  if (name) return name
  const fromSrc = item.src?.trim() || item.objectUrl?.trim()
  if (fromSrc) {
    try {
      const seg = new URL(fromSrc, 'http://_').pathname.split('/').filter(Boolean).pop()
      if (seg) return decodeURIComponent(seg)
    } catch {
      // ignore
    }
  }
  return unnamedFallback
}

export function resolveAttachmentSizeBytes(
  item: CwAttachmentGalleryItem,
): number | undefined {
  if (
    item.sizeBytes != null &&
    Number.isFinite(item.sizeBytes) &&
    item.sizeBytes >= 0
  ) {
    return item.sizeBytes
  }
  const fileSize = item.file?.size
  if (fileSize != null && Number.isFinite(fileSize) && fileSize > 0) return fileSize
  return undefined
}

export function resolveAttachmentSizeLabel(item: CwAttachmentGalleryItem): string {
  const bytes = resolveAttachmentSizeBytes(item)
  if (bytes == null) return ''
  return formatFileSize(bytes, 1, 'zh')
}
