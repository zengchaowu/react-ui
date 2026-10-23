import type { CwDroppedAttachmentKind } from './functions/attachmentKind'
import type { CwImagePreviewProps } from '../CwImagePreview/types'
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

/** 传给内嵌 CwImagePreview 的配置 */
export type CwAttachmentGalleryImagePreviewConfig = Pick<
  CwImagePreviewProps,
  | 'minScale'
  | 'maxScale'
  | 'initialScale'
  | 'initialRotation'
  | 'enableDoubleClickZoom'
  | 'enableDoubleClickReset'
  | 'enableWheelZoom'
  | 'enableDrag'
  | 'enablePinchZoom'
  | 'enablePinchRotate'
>

export interface CwAttachmentGalleryItem {
  key: string | number
  kind: CwDroppedAttachmentKind
  /** 本地附件；URL 图片/视频可省略 */
  file?: File
  /** 远程或静态资源 URL（图片/视频） */
  src?: string
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
  /**
   * 是否显示底部指示器。
   * 默认：多页时显示；单页或显式 `false` 时隐藏。
   */
  showIndicator?: boolean
  imagePreviewConfig?: CwAttachmentGalleryImagePreviewConfig
  indicatorConfig?: CwAttachmentGalleryIndicatorConfig
  texts?: Partial<CwAttachmentGalleryTexts>
  /** 当前页变化（对应 Vue `@index-change`） */
  onIndexChange?: (index: number) => void
  /** 当前页缩放比例变化（对应 Vue `@active-scale-change`，仅 active 图片项） */
  onActiveScaleChange?: (scale: number) => void
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
