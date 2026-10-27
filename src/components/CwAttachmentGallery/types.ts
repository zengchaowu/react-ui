import type { CwDroppedAttachmentKind } from './functions/attachmentKind'
import type { CwImagePreviewProps } from '../CwImagePreview/types'
import type { CwIndicatorProps } from '../CwIndicator/types'
import type { CwAttachmentGalleryItem, CwAttachmentGalleryTexts } from '@zengchaowu/ui-shared/components/CwAttachmentGallery/types'

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

export type {
  CwAttachmentGalleryItem,
} from '@zengchaowu/ui-shared/components/CwAttachmentGallery/types'

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

/** 滚动项 data：画廊内部附加 originalIndex */
export type CwAttachmentGalleryScrollItemData = CwAttachmentGalleryItem & {
  originalIndex: number
}
