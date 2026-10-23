import { fetchBlobFromUrl } from '@zengchaowu/shared/functions/dom/fetchBlobFromUrl'
import { writeImageBlobViaWebClipboard } from '@zengchaowu/shared/functions/dom/writeImageBlobToClipboard'
import type { Blob as SharedBlob } from '@zengchaowu/shared/references/blob'

export type AttachmentPreviewActionSource = {
  src: string | File | Blob
  filename?: string
}

/** 从附件/图片预览项解析可复制、可下载的图片源 */
export function resolveAttachmentPreviewActionSource(item: unknown): AttachmentPreviewActionSource | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Record<string, unknown>

  const src = o.src
  if (typeof src === 'string' || src instanceof File || src instanceof Blob) {
    const alt = typeof o.alt === 'string' ? o.alt.trim() : ''
    return { src, ...(alt ? { filename: alt } : {}) }
  }

  const kind = o.kind
  const objectUrl = typeof o.objectUrl === 'string' ? o.objectUrl.trim() : ''
  const file = o.file instanceof File ? o.file : null
  const isImage =
    kind === 'image' ||
    (typeof kind === 'string' && kind.includes('image')) ||
    Boolean(file?.type.startsWith('image/'))

  if (!isImage) return null
  if (objectUrl) {
    return { src: objectUrl, filename: file?.name || undefined }
  }
  if (file) {
    return { src: file, filename: file.name || undefined }
  }
  return null
}

export function suggestImageDownloadFilename(
  src: string | File | Blob,
  alt?: string,
): string {
  if (src instanceof File && src.name.trim()) return src.name.trim()
  if (typeof src === 'string') {
    const s = src.trim()
    if (s.startsWith('data:image/png')) return 'image.png'
    if (s.startsWith('data:image/jpeg') || s.startsWith('data:image/jpg')) return 'image.jpg'
    if (s.startsWith('data:image/webp')) return 'image.webp'
    if (s.startsWith('data:image/gif')) return 'image.gif'
    try {
      const path = new URL(s, 'http://_').pathname
      const seg = path.split('/').filter(Boolean).pop()
      if (seg) return decodeURIComponent(seg)
    } catch {
      // ignore
    }
  }
  const fromAlt = alt?.trim()
  if (fromAlt) return fromAlt
  return 'image.jpg'
}

export async function fetchImageBlob(src: string | File | Blob): Promise<Blob | null> {
  try {
    if (src instanceof Blob) return src
    if (typeof src === 'string') {
      const s = src.trim()
      if (!s) return null
      const pageHref = typeof location !== 'undefined' ? location.href : undefined
      return (await fetchBlobFromUrl(s, { pageHref })) as Blob | null
    }
  } catch {
    return null
  }
  return null
}

export async function copyImageToClipboard(src: string | File | Blob): Promise<boolean> {
  const blob = await fetchImageBlob(src)
  if (!blob) return false
  return writeImageBlobViaWebClipboard(blob as SharedBlob)
}

/** 将预览项图片源解析为可传给统一下载模块的 URL（File/Blob 会生成 object URL） */
export function resolveAttachmentPreviewDownloadUrl(src: string | File | Blob): string | null {
  if (typeof src === 'string') {
    const s = src.trim()
    return s || null
  }
  if (src instanceof Blob) {
    return URL.createObjectURL(src)
  }
  return null
}
