import { inferDroppedAttachmentKind } from './attachmentKind'
import type { CwAttachmentGalleryItem } from '../types'

export function buildAttachmentGalleryItems(files: File[]): CwAttachmentGalleryItem[] {
  return files.map((file, index) => ({
    key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    kind: inferDroppedAttachmentKind(file),
    sizeBytes: file.size,
    sourceIndex: index,
  }))
}

export { buildImageAttachmentItems } from './buildImageAttachmentItems'
