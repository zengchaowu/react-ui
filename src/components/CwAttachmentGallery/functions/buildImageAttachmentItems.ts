import type { CwAttachmentGalleryItem } from '../types'

/** 将 URL 列表转为附件画廊图片项（无 File） */
export function buildImageAttachmentItems(images: string[]): CwAttachmentGalleryItem[] {
  const items: CwAttachmentGalleryItem[] = []
  images.forEach((src, index) => {
    const url = typeof src === 'string' ? src.trim() : ''
    if (!url) return
    items.push({
      key: `image-url-${index}`,
      kind: 'image',
      src: url,
      sourceIndex: index,
    })
  })
  return items
}
