export interface CwInfiniteScrollProps {
  /** 为 false 时不触发下拉（如已无更早数据） */
  pullDownEnabled?: boolean
  /** 为 false 时不触发上拉 */
  pullUpEnabled?: boolean
  /**
   * 触发下拉加载的回调函数，返回Promise以自动管理加载状态
   */
  triggerPullDown?: () => Promise<void>
  /**
   * 触发上拉加载的回调函数，返回Promise以自动管理加载状态
   */
  triggerPullUp?: () => Promise<void>
  /**
   * 触发下拉加载的滚动距离阈值
   * @default 100
   */
  scrollTopTrigger?: number
  /**
   * 触发上拉加载的距离底部阈值
   * @default 100
   */
  clientHeightTrigger?: number
  /**
   * 自定义CSS类名
   */
  class?: string
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwInfiniteScrollStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwInfiniteScrollTexts>
}

export interface CwInfiniteScrollStyles {
  root: string
  content: string
  loading: string
  loadingSpinner: string
  loadingText: string
  error: string
  retryButton: string
}

export interface CwInfiniteScrollTexts {
  loading: string
  error: string
  retry: string
  noMore: string
}

export interface CwInfiniteScrollEmits {
  /**
   * 下拉加载事件
   */
  pullDown: []
  /**
   * 上拉加载事件
   */
  pullUp: []
  /**
   * 滚动事件
   */
  scroll: [scrollTop: number, topOffset: number]
  /**
   * 错误事件
   */
  error: [errorInfo: { type: 'pullDown' | 'pullUp', error: unknown }]
}