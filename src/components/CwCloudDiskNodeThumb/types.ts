import type { HTMLAttributes } from 'react'
import type { CloudDiskNode } from '@zengchaowu/shared/types/cloud-disk'

export type CwCloudDiskNodeThumbResolvePreviewUrl = (
  nodeId: string,
) => Promise<string | null | undefined>

export interface CwCloudDiskNodeThumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onError'> {
  node: CloudDiskNode
  /** 无内联预览 URL 时解析下载地址（由各端注入 API） */
  resolvePreviewUrl: CwCloudDiskNodeThumbResolvePreviewUrl
  /** 文件类型图标边长（rem） */
  fileIconSize?: number
  /** 文件夹图标边长（rem） */
  folderIconSize?: number
  /** CwIcon / CwFileIcon class */
  iconClass?: string
  /** 图片预览 class；缺省回退到 iconClass */
  previewClass?: string
  /** 文件夹 iconfont 名；默认 windows 文件夹 */
  folderIcon?: string
}
