import {
  resolveAttachmentPreviewActionSource,
  resolveAttachmentPreviewDownloadUrl,
  suggestImageDownloadFilename,
} from './attachmentPreviewActions'

export type AttachmentGalleryDownloadSource = {
  url: string
  filename?: string
}

function readAttachmentGalleryItemRecord(item: unknown): Record<string, unknown> | null {
  if (!item || typeof item !== 'object') return null
  return item as Record<string, unknown>
}

/** 附件预览项在来源列表中的原始下标（如消息 attachments、Composer 待传列表） */
export function resolveAttachmentGallerySourceIndex(item: unknown): number | undefined {
  const o = readAttachmentGalleryItemRecord(item)
  if (!o) return undefined
  const direct = o.sourceIndex
  if (typeof direct === 'number' && Number.isFinite(direct) && direct >= 0) {
    return Math.floor(direct)
  }
  const key = String(o.key ?? '')
  const matched = key.match(/::(\d+)$/)
  if (!matched) return undefined
  const n = Number(matched[1])
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined
}

/** 从附件图库项解析可下载 URL 与建议文件名 */
export function resolveAttachmentGalleryDownloadSource(
  item: unknown,
): AttachmentGalleryDownloadSource | null {
  const imageSource = resolveAttachmentPreviewActionSource(item)
  if (imageSource) {
    const url = resolveAttachmentPreviewDownloadUrl(imageSource.src)
    if (!url) return null
    return {
      url,
      filename: suggestImageDownloadFilename(imageSource.src, imageSource.filename),
    }
  }

  const o = readAttachmentGalleryItemRecord(item)
  if (!o) return null

  const file = o.file instanceof File ? o.file : null
  const objectUrl = typeof o.objectUrl === 'string' ? o.objectUrl.trim() : ''
  if (
    objectUrl &&
    (/^https?:\/\//i.test(objectUrl) ||
      objectUrl.startsWith('blob:') ||
      objectUrl.startsWith('data:'))
  ) {
    return {
      url: objectUrl,
      filename: file?.name?.trim() || undefined,
    }
  }

  if (file && file.size > 0) {
    return {
      url: URL.createObjectURL(file),
      filename: file.name?.trim() || undefined,
    }
  }

  return null
}

/** 触发浏览器下载/打开（占位 File + objectUrl 或本地 File 内容） */
export function triggerAttachmentGalleryDownload(item: unknown): boolean {
  const source = resolveAttachmentGalleryDownloadSource(item)
  if (!source?.url) return false
  const anchor = document.createElement('a')
  anchor.href = source.url
  if (source.filename?.trim()) {
    anchor.download = source.filename.trim()
  }
  anchor.rel = 'noopener'
  anchor.target = '_blank'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  return true
}
