import type {
  CloudDiskNode,
  CloudDiskPrivateFolderGuard,
} from '@zengchaowu/shared/types/cloud-disk'
import {
  buildCloudDiskAttachmentGalleryItemSpec,
  fetchCloudDiskSignedReadUrlMap,
  resolveCloudDiskPreviewSession,
} from '@zengchaowu/shared/functions/cloudDisk/cloudDiskFilePreviewUi'
import { cloudDiskNodeIsFolder } from '@zengchaowu/shared/functions/cloudDisk/cloudDiskNodeUi'
import {
  closeCwAttachmentPreview,
  isCwAttachmentPreviewOpen,
  showCwAttachmentPreview,
} from './showCwAttachmentPreview'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'

function placeholderFile(name: string, mimeType?: string): File {
  const type = mimeType?.trim()
  return new File([], name, type ? { type } : undefined)
}

export interface OpenCloudDiskNodeAttachmentPreviewOptions {
  node: CloudDiskNode
  siblings: readonly CloudDiskNode[]
  getSignedReadUrl: (id: string) => Promise<string | null | undefined>
  privateFolderGuard?: CloudDiskPrivateFolderGuard
  /** 见 ShowCwAttachmentPreviewOptions.publicAssetBaseUrl */
  publicAssetBaseUrl?: string
}

let openGeneration = 0
let openInflight = false

/** Wire cloud-disk preview session + signed URLs into showCwAttachmentPreview. */
export async function openCloudDiskNodeAttachmentPreview(
  options: OpenCloudDiskNodeAttachmentPreviewOptions,
): Promise<void> {
  if (cloudDiskNodeIsFolder(options.node.kind)) return

  // 已打开：空格切换为关闭；拉取中再次触发则取消本次打开
  if (isCwAttachmentPreviewOpen()) {
    closeCwAttachmentPreview()
    return
  }
  if (openInflight) {
    openGeneration += 1
    openInflight = false
    return
  }

  const session = resolveCloudDiskPreviewSession({
    node: options.node,
    siblings: options.siblings,
    privateFolderGuard: options.privateFolderGuard,
  })
  if (!session) return

  const generation = ++openGeneration
  openInflight = true
  try {
    const urlMap = await fetchCloudDiskSignedReadUrlMap(
      session.nodesForPreview,
      options.getSignedReadUrl,
    )
    if (generation !== openGeneration) return

    const items: CwAttachmentGalleryItem[] = session.nodesForPreview.map((item, index) => {
      const spec = buildCloudDiskAttachmentGalleryItemSpec(item, urlMap.get(item.id), index)
      return {
        key: spec.key,
        file: placeholderFile(spec.fileName, spec.mimeType),
        kind: spec.kind,
        sizeBytes: spec.sizeBytes,
        objectUrl: spec.objectUrl,
        sourceIndex: spec.sourceIndex,
      }
    })

    if (!items.length) return
    if (isCwAttachmentPreviewOpen()) {
      closeCwAttachmentPreview()
      return
    }

    showCwAttachmentPreview({
      items,
      initialIndex: session.initialIndex,
      publicAssetBaseUrl: options.publicAssetBaseUrl,
    })
  } finally {
    if (generation === openGeneration) {
      openInflight = false
    }
  }
}
