export interface CwInfiniteLoopScrollItem {
  /** 唯一标识 */
  key: string | number
  /** 数据项 */
  data: any
  /** 高度（像素），如果不提供则使用默认高度 */
  height?: number
  /** 宽度（像素），横向滚动时使用，如果不提供则使用默认宽度 */
  width?: number
}

export interface CwInfiniteLoopScrollProps {
  /** 数据列表 */
  items: CwInfiniteLoopScrollItem[]
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
  /** 是否启用分页模式（一次滑动必须是页的整数倍） */
  snapToPage?: boolean
  /** 分页阈值（超过新页的多少比例时自动滚动到下一页，默认 0.2 即 1/5） */
  snapThreshold?: number
  /** 页高度（像素），如果不提供则使用容器高度。也可以使用相对值，如 '1/3' 表示容器高度的 1/3 */
  pageHeight?: number | string
  /** 页宽度（像素），如果不提供则使用容器宽度。也可以使用相对值，如 '1/3' 表示容器宽度的 1/3 */
  pageWidth?: number | string
  /** 内边距（像素），可以是单个值或对象 { top, right, bottom, left } */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwInfiniteLoopScrollStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwInfiniteLoopScrollTexts>
}

export interface CwInfiniteLoopScrollStyles {
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
}

export interface CwInfiniteLoopScrollTexts {
  empty: string
}

export interface CwInfiniteLoopScrollEmits {
  /** 滚动事件 */
  scroll: [scrollTop: number, scrollLeft: number, centerIndex: number | null]
  /** 可见范围变化事件 */
  'visible-change': [startIndex: number, endIndex: number, visibleItems: CwInfiniteLoopScrollItem[]]
}

export interface CwInfiniteLoopScrollExpose {
  /** 滚动到指定位置 */
  scrollTo: (scrollTop: number, scrollLeft?: number) => void
  /** 直接设置滚动偏移量（不触发中间跳转等逻辑） */
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

