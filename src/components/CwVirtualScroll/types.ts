export interface CwVirtualScrollItem {
  /** 唯一标识 */
  key: string | number
  /** 数据项 */
  data: any
  /** 高度（像素），如果不提供则使用默认高度 */
  height?: number
  /** 宽度（像素），横向滚动时使用，如果不提供则使用默认宽度 */
  width?: number
}

export interface CwVirtualScrollProps {
  /** 数据列表 */
  items: CwVirtualScrollItem[]
  /** 默认项目高度（像素），当项目未提供高度时使用 */
  itemHeight?: number
  /** 默认项目宽度（像素），横向滚动时使用，当项目未提供宽度时使用 */
  itemWidth?: number
  /** 可见区域缓冲数量（上下各缓冲多少个项目） */
  bufferSize?: number
  /** 滚动方向：'vertical' | 'horizontal' | 'both' */
  direction?: 'vertical' | 'horizontal' | 'both'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否启用滚动惯性（触摸/拖拽结束后继续滚动） */
  enableMomentum?: boolean
  /** 惯性减速度（0-1，值越小减速越快，默认 0.95） */
  momentumDeceleration?: number
  /** 是否显示滚动条 */
  showScrollbar?: boolean
  /** 内边距（像素），可以是单个值或对象 { top, right, bottom, left } */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwVirtualScrollStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwVirtualScrollTexts>
}

export interface CwVirtualScrollStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  container: string
  content: string
  item: string
  empty: string
  emptyContent: string
  emptyText: string
  scrollbar: string
  scrollbarTrack: string
  scrollbarThumb: string
  scrollbarThumbNormal: string
  scrollbarThumbHover: string
  scrollbarThumbDragging: string
  scrollbarVisible: string
  scrollbarVertical: string
  scrollbarHorizontal: string
}

export interface CwVirtualScrollTexts {
  empty: string
}

export interface CwVirtualScrollEmits {
  /** 滚动事件 */
  scroll: [scrollTop: number, scrollLeft: number]
  /** 可见范围变化事件 */
  'visible-change': [startIndex: number, endIndex: number, visibleItems: CwVirtualScrollItem[]]
}

export interface CwVirtualScrollExpose {
  /** 滚动到指定位置 */
  scrollTo: (scrollTop: number, scrollLeft?: number) => void
  /** 直接设置滚动偏移量 */
  setScrollOffset: (scrollTop: number, scrollLeft?: number) => void
  /** 滚动到指定索引 */
  scrollToIndex: (index: number) => void
  /** 获取当前滚动位置 */
  getScrollTop: () => number
  /** 获取当前滚动左侧位置 */
  getScrollLeft: () => number
  /** 获取可见范围 */
  getVisibleRange: () => { startIndex: number; endIndex: number }
}

