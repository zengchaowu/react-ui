import type { CwDroppedAttachmentKind } from '../CwMessageInput/chips/attachmentKind'
import type { CwImageGalleryProps } from '../CwImageGallery/types'
import type { CwIndicatorProps } from '../CwIndicator/types'

export type CwAttachmentGalleryIndicatorConfig = Pick<
  CwIndicatorProps,
  | 'variant'
  | 'maxWidth'
  | 'scrollable'
  | 'itemSize'
  | 'itemSpacing'
  | 'activeColor'
  | 'inactiveColor'
>

export interface CwAttachmentGalleryItem {
  key: string | number
  file: File
  kind: CwDroppedAttachmentKind
  /** 已知体积（字节）；远程/占位 File 无内容时优先于 file.size */
  sizeBytes?: number
  /** 来源列表中的原始下标，供预览右键菜单等业务使用 */
  sourceIndex?: number
  /** 图片/视频本地预览 URL（外部传入时画廊不再 createObjectURL） */
  objectUrl?: string
}

export interface CwAttachmentGalleryProps {
  items: CwAttachmentGalleryItem[]
  initialIndex?: number
  disabled?: boolean
  readonly?: boolean
  imagePreviewConfig?: CwImageGalleryProps['imagePreviewConfig']
  indicatorConfig?: CwAttachmentGalleryIndicatorConfig
  styles?: Partial<CwAttachmentGalleryStyles>
  texts?: Partial<CwAttachmentGalleryTexts>
}

export interface CwAttachmentGalleryStyles {
  root: string
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string
  container: string
  scrollContainer: string
  slideItem: string
  videoSlide: string
  videoInactive: string
  fileInfoPanel: string
  fileInfoIconWrap: string
  fileInfoMeta: string
  indicator?: string
}

export interface CwAttachmentGalleryTexts {
  imageAlt: string
  empty: string
  unnamedFile: string
  videoPlaceholder: string
}

export interface CwAttachmentGalleryEmits {
  'index-change': [index: number]
  /** 当前页缩放比例变化（仅 active 图片项） */
  'active-scale-change': [scale: number]
}

/** 滚动项 data：画廊内部附加 originalIndex */
export type CwAttachmentGalleryScrollItemData = CwAttachmentGalleryItem & {
  originalIndex: number
}
