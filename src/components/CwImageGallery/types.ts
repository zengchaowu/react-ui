export interface CwImageGalleryItem {
  /** 唯一标识 */
  key: string | number
  /** 图片源：可以是 URL 字符串、File 对象或 Blob 对象 */
  src: string | File | Blob
  /** 图片 alt 文本 */
  alt?: string
}

export interface CwImageGalleryProps {
  /** 图片列表 */
  items: CwImageGalleryItem[]
  /** 初始显示的图片索引 */
  initialIndex?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** CwImagePreview 的配置 */
  imagePreviewConfig?: {
    minScale?: number
    maxScale?: number
    initialScale?: number
    initialRotation?: number
    enableDoubleClickZoom?: boolean
    enableDoubleClickReset?: boolean
    enableWheelZoom?: boolean
    enableDrag?: boolean
    enablePinchZoom?: boolean
    enablePinchRotate?: boolean
  }
  /** 自定义样式 */
  styles?: Partial<CwImageGalleryStyles>
  /** 自定义文本 */
  texts?: Partial<CwImageGalleryTexts>
}

export interface CwImageGalleryStyles {
  root: string
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string
  container: string
  scrollContainer: string
  imageItem: string
  indicator?: string
}

export interface CwImageGalleryTexts {
  prev: string
  next: string
  imageAlt: string
  empty: string
}

export interface CwImageGalleryEmits {
  /** 当前图片索引改变事件 */
  'index-change': [index: number]
  /** 当前页缩放比例变化（仅 active 项） */
  'active-scale-change': [scale: number]
  /** 图片加载完成事件 */
  'image-load': [index: number, event: Event]
  /** 图片加载失败事件 */
  'image-error': [index: number, event: Event]
}

