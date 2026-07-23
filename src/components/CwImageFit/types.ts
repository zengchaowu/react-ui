import type { CwEmbeddedIconStyles } from '../CwIcon/types'

export interface CwImageFitProps {
  /** 图片源：可以是 URL 字符串、File 对象或 Blob 对象 */
  src?: string | File | Blob
  /** 图片 alt 文本 */
  alt?: string
  /** 原生 img loading；Markdown 内联图等列表场景建议 lazy */
  imgLoading?: 'lazy' | 'eager'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /**
   * 行内 bounded 模式：根节点随图片等比缩放到不超过 `boundsMax*`；
   * 与裁剪器「铺满父容器」模式互斥，需同时传入 `boundsMaxWidth` / `boundsMaxHeight`。
   */
  boundsMaxWidth?: number
  boundsMaxHeight?: number
  boundsMinWidth?: number
  boundsMinHeight?: number
  /** 原图像素宽（已知时可在 load 前预算 bounded 占位，避免先大后小） */
  intrinsicWidth?: number
  /** 原图像素高 */
  intrinsicHeight?: number
  /** 自定义 transform 样式（用于图片缩放和位置变换） */
  imageTransform?: {
    scale?: number
    x?: number
    y?: number
    rotation?: number
  }
  /** 自定义样式 */
  styles?: Partial<CwImageFitStyles>
  /** 自定义文本 */
  texts?: Partial<CwImageFitTexts>
}

export interface CwImageFitStyles {
  root: string
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string
  imageWrapper: string
  image: string
  loadingContainer: string
  errorContainer: string
  errorIconStyles?: CwEmbeddedIconStyles
}

export interface CwImageFitTexts {
  alt: string
}

export interface CwImageFitEmits {
  /** 图片加载完成事件 */
  load: [event: Event]
  /** 图片加载失败事件 */
  error: [event: Event]
}

