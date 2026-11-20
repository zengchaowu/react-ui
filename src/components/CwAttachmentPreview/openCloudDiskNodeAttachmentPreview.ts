import { createOpenCloudDiskNodeAttachmentPreview } from '@zengchaowu/ui-shared/components/CwAttachmentPreview/openCloudDiskNodeAttachmentPreview'
import {
  closeCwAttachmentPreview,
  isCwAttachmentPreviewOpen,
  showCwAttachmentPreview,
} from './showCwAttachmentPreview'

export type {
  OpenCloudDiskNodeAttachmentPreviewOptions,
  CwAttachmentPreviewCommands,
} from '@zengchaowu/ui-shared/components/CwAttachmentPreview/openCloudDiskNodeAttachmentPreview'

const openPreview = createOpenCloudDiskNodeAttachmentPreview({
  isOpen: isCwAttachmentPreviewOpen,
  close: closeCwAttachmentPreview,
  show: showCwAttachmentPreview,
})

/** 绑定本库 showCwAttachmentPreview 的薄适配（会话/并发逻辑在 ui-shared） */
export function openCloudDiskNodeAttachmentPreview(
  options: Parameters<typeof openPreview>[0],
): Promise<void> {
  return openPreview(options)
}
