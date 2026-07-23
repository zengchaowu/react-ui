import type { Breakpoint } from '../CwRow/utils/breakpoint'

// 瀑布流组件类型定义
export interface CwWaterfallProps {
  /** 要展示的数据项数组 */
  items: any[]
  /** 列数，不设置则根据断点自动计算 */
  columnCount?: number
  /** 列间距 */
  columnGap?: number
  /** 行间距 */
  rowGap?: number
  /** 响应式断点配置，用于自动计算列数 */
  breakpoints?: Record<Breakpoint, number>
  /** 数据项的唯一标识字段 */
  itemKey?: string
  /** 是否开启懒加载 */
  lazyLoad?: boolean
  /** 是否开启无限滚动 */
  infiniteScroll?: boolean
  /** 无限滚动触发距离底部的阈值 */
  threshold?: number
  /** 是否正在加载更多数据 */
  loading?: boolean
  /** 是否已加载全部数据 */
  finished?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwWaterfallStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwWaterfallTexts>
}

export interface CwWaterfallStyles {
  root: string
  rootLoading: string
  container: string
  column: string
  item: string
  loading: string
  loadingContent: string
  loadingSpinner: string
  loadingText: string
  empty: string
  emptyContent: string
  emptyIcon: string
  emptyText: string
  finished: string
  finishedContent: string
  finishedText: string
}

export interface CwWaterfallTexts {
  loading: string
  empty: string
  finished: string
}

// 瀑布流组件事件定义
export interface CwWaterfallEmits {
  /** 加载更多事件 */
  'load-more': []
  /** 点击项目事件 */
  'item-click': [item: any, index: number]
}