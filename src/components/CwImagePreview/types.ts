export interface CwImagePreviewProps {
  /** 图片源：可以是 URL 字符串、File 对象或 Blob 对象 */
  src?: string | File | Blob
  /** 图片 alt 文本 */
  alt?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean

  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 初始缩放比例 */
  initialScale?: number
  /** 初始旋转角度（度） */
  initialRotation?: number

  /** 是否启用双击缩放 */
  enableDoubleClickZoom?: boolean
  /** 放大或平移后双击是否重置（默认 true；可与 enableDoubleClickZoom 独立） */
  enableDoubleClickReset?: boolean
  /** 是否启用滚轮缩放（PC） */
  enableWheelZoom?: boolean
  /** 是否启用拖拽平移 */
  enableDrag?: boolean
  /** 是否允许在缩放比例不大于1时进行平移 */
  allowDragWhenNotScaled?: boolean
  /** 是否启用双指缩放（移动端） */
  enablePinchZoom?: boolean
  /** 是否启用双指旋转（移动端） */
  enablePinchRotate?: boolean
  /**
   * 嵌入横向画廊时为 true：未放大时把单指滑动交给父级分页滚动，
   * 避免 touch-none 抢占触摸导致需滑半屏才切页。
   */
  delegatesTouchPanToParent?: boolean
  /**
   * 画廊当前页是否为视口中心项；传入时离开/进入该页会重置缩放与平移（对齐 Vant ImagePreview）。
   * 不传则保持原行为（仅声明式单图场景）。
   */
  active?: boolean

  /** 自定义文本 */
  texts?: Partial<CwImagePreviewTexts>

  /** 图片加载完成事件（等价 Vue `@load`） */
  onLoad?: (event: Event) => void
  /** 图片加载失败事件（等价 Vue `@error`） */
  onError?: (event: Event) => void
  /** 缩放变化事件（等价 Vue `@update:scale`） */
  onUpdateScale?: (scale: number) => void
  /** 旋转变化事件（等价 Vue `@update:rotation`，度） */
  onUpdateRotation?: (rotation: number) => void
  /** 平移变化事件（等价 Vue `@update:offset`） */
  onUpdateOffset?: (offset: { x: number; y: number }) => void
}

export interface CwImagePreviewStyles {
  // 根容器：基础 + 状态
  root: string
  /** 嵌入画廊未放大：不抢占 touch-action，便于父级 CwInfiniteLoopScroll 接管滑动 */
  rootPanDelegated?: string
  rootNormal?: string
  rootDisabled?: string
  rootReadonly?: string

  // 交互容器（用于承载 CwImageFit 和交互事件）
  viewport: string
  viewportFocused?: string

  // 控件容器（可选：顶部/底部工具栏）
  controls?: string
}

export interface CwImagePreviewTexts {
  /** 图片 alt 文本 */
  alt: string
}

/** 等价 Vue `CwImagePreviewEmits` 的回调集合 */
export interface CwImagePreviewEmitHandlers {
  onLoad?: (event: Event) => void
  onError?: (event: Event) => void
  onUpdateScale?: (scale: number) => void
  onUpdateRotation?: (rotation: number) => void
  onUpdateOffset?: (offset: { x: number; y: number }) => void
}

export interface ImagePreviewTransform {
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
}

/** 等价 Vue `CwImagePreviewEmits` 的事件签名（React 侧对应 `onXxx` 回调 props） */
export interface CwImagePreviewEmits {
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
  (e: 'update:scale', scale: number): void
  (e: 'update:rotation', rotation: number): void
  (e: 'update:offset', offset: { x: number; y: number }): void
}
