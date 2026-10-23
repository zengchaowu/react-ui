import type { CSSProperties, ReactNode } from 'react'
import type { CwInfiniteLoopScrollStyles } from '../CwInfiniteLoopScroll/types'

export interface CwSwiperItem {
  /** 唯一标识 */
  key: string | number
  /** 数据项 */
  data: unknown
  /** 图片 URL */
  image?: string
  /** 宽度（像素），如果不提供则使用默认宽度 */
  width?: number
}

/** 默认作用域插槽参数 */
export interface CwSwiperItemSlotProps {
  item: CwSwiperItem
  index: number
  scale: number
}

export interface CwSwiperProps {
  /** 数据列表 */
  items: CwSwiperItem[]
  /** 默认项目宽度（像素），当项目未提供宽度时使用 */
  itemWidth?: number
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
  /** 分页阈值（超过新页的多少比例时自动滚动到下一页，默认 0.33 即 1/3） */
  snapThreshold?: number
  /** 最小缩放比例（默认 0.9） */
  minScale?: number
  texts?: Partial<CwSwiperTexts>
  /** 默认作用域插槽 */
  children?: (slotProps: CwSwiperItemSlotProps) => ReactNode
  className?: string
  style?: CSSProperties
  /** 滚动事件 */
  onScroll?: (scrollLeft: number, centerIndex?: number | null) => void
  /** 可见范围变化事件 */
  onVisibleChange?: (startIndex: number, endIndex: number) => void
}

export interface CwSwiperStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  item: string
  itemImage: string
  itemContent: string
}

export interface CwSwiperTexts {
  empty: string
}

export type { CwInfiniteLoopScrollStyles }


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwSwiperEmits {
  /** 滚动事件 */
  scroll: [scrollLeft: number]
  /** 可见范围变化事件 */
  'visible-change': [startIndex: number, endIndex: number]
}
