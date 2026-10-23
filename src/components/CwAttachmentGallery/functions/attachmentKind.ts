import { isRasterImageFile } from '@zengchaowu/shared/functions/file/isRasterImageFile'
import { isVideoFile } from '@zengchaowu/shared/functions/file/inferMediaType'

export type CwDroppedAttachmentKind = 'image' | 'video' | 'file'

export function inferDroppedAttachmentKind(file: File): CwDroppedAttachmentKind {
  if (isRasterImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'video'
  return 'file'
}

export function droppedAttachmentNeedsObjectUrl(kind: CwDroppedAttachmentKind): boolean {
  return kind === 'image' || kind === 'video'
}
