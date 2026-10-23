import type { CSSProperties, ReactNode } from 'react'
import type { Breakpoint } from '../CwRow/utils/breakpoint'

/** 瀑布流数据项：默认按 id / height / content 计算布局 */
export interface CwWaterfallItem {
  id?: string | number
  /** 预估高度，用于分配列 */
  height?: number
  /** 参与预估高度的文本内容 */
  content?: string
  [key: string]: unknown
}

/** 默认作用域插槽参数 */
export interface CwWaterfallItemSlotProps {
  item: CwWaterfallItem
  index: number
}

// 瀑布流组件类型定义
export interface CwWaterfallProps {
  /** 要展示的数据项数组 */
  items: CwWaterfallItem[]
  /** 列数，不设置则根据断点自动计算 */
  columnCount?: number
  /** 列间距 */
  columnGap?: number
  /** 行间距 */
  rowGap?: number
  /** 响应式断点配置，用于自动计算列数 */
  breakpoints?: Partial<Record<Breakpoint, number>>
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
  /** 是否显示 CwDiv 自定义滚动条（默认 false） */
  showScrollbar?: boolean
  texts?: Partial<CwWaterfallTexts>
  /** 根节点 class */
  className?: string
  /** 根节点样式 */
  style?: CSSProperties
  /** 默认作用域插槽 */
  children?: (slotProps: CwWaterfallItemSlotProps) => ReactNode
  /** 加载中插槽 */
  loadingSlot?: ReactNode
  /** 空状态插槽 */
  emptySlot?: ReactNode
  /** 已加载全部插槽 */
  finishedSlot?: ReactNode
  /** 加载更多事件 */
  onLoadMore?: () => void
  /** 点击项目事件 */
  onItemClick?: (item: CwWaterfallItem, index: number) => void
}

export interface CwWaterfallStyles {
  root: string
  rootLoading: string
  inner: string
  container: string
  column: string
  item: string
  loading: string
  loadingContent: string
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
