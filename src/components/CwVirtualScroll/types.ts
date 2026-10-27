import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { CwVirtualScrollTexts, CwVirtualScrollExpose } from '@zengchaowu/ui-shared/components/CwVirtualScroll/types'

export interface CwVirtualScrollItem<TData = unknown> {
  /** 唯一标识 */
  key: string | number
  /** 数据项 */
  data: TData
  /** 高度（像素），如果不提供则使用默认高度 */
  height?: number
  /** 宽度（像素），横向滚动时使用，如果不提供则使用默认宽度 */
  width?: number
}

/** 列表项作用域插槽参数 */
export interface CwVirtualScrollItemRenderArgs<TData = unknown> {
  item: TData
  index: number
  disabled: boolean
  readonly: boolean
}

export interface CwVirtualScrollProps<TData = unknown> {
  /** 数据列表 */
  items: CwVirtualScrollItem<TData>[]
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
  /** 是否显示 CwDiv 自定义滚动条（默认 true） */
  showScrollbar?: boolean
  /** 内边距（像素），可以是单个值或对象 { top, right, bottom, left } */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwVirtualScrollTexts>
  /** 默认插槽：列表项渲染函数 */
  children?: (args: CwVirtualScrollItemRenderArgs<TData>) => ReactNode
  /** 具名插槽 empty */
  emptySlot?: ReactNode
  /** 滚动事件 */
  onScroll?: (scrollTop: number, scrollLeft: number) => void
  /** 可见范围变化事件 */
  onVisibleChange?: (
    startIndex: number,
    endIndex: number,
    visibleItems: CwVirtualScrollItem<TData>[],
  ) => void
  className?: string
  style?: CSSProperties
}

export type CwVirtualScrollComponentProps<TData = unknown> = CwVirtualScrollProps<TData> &
  Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'style' | 'onScroll' | 'items'
  >

export interface CwVirtualScrollEmits {
  /** 滚动事件 */
  scroll: [scrollTop: number, scrollLeft: number]
  /** 可见范围变化事件 */
  'visible-change': [startIndex: number, endIndex: number, visibleItems: CwVirtualScrollItem[]]
}

export interface CwVirtualScrollHandle extends CwVirtualScrollExpose {
  /** CwDiv 根节点 */
  el: HTMLElement | null
  /** 滚动视口 */
  viewport: HTMLElement | null
  /** 内容层 */
  content: HTMLElement | null
}
