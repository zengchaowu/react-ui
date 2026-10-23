import type { ReactNode } from 'react'

export type CwSplitDirection = 'horizontal' | 'vertical'

export interface CwSplitProps {
  /**
   * 布局方向：horizontal（左右）或 vertical（上下）
   * @default 'horizontal'
   */
  direction?: CwSplitDirection
  /**
   * 第一个面板的大小比例（0-1），或固定像素值（字符串，如 '200px'）
   * @default 0.5
   */
  firstSize?: number | string
  /**
   * 第一个面板的最小尺寸（像素值或比例，如 '100px' 或 0.1）
   * @default 0
   */
  firstMinSize?: number | string
  /**
   * 第一个面板的最大尺寸（像素值或比例，如 '80%' 或 0.9）
   */
  firstMaxSize?: number | string
  /**
   * 第二个面板的最小尺寸（像素值或比例，如 '100px' 或 0.1）
   * @default 0
   */
  secondMinSize?: number | string
  /**
   * 第二个面板的最大尺寸（像素值或比例，如 '80%' 或 0.9）
   */
  secondMaxSize?: number | string
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwSplitTexts>
  /**
   * 分隔条可拖拽热区厚度（px）。视觉为发丝中心线；负 margin 使 flex 净占位为 0（叠在两栏接缝上，避免透出父级背景）。
   * `direction="horizontal"` 时作用于分隔条 **宽度**；`direction="vertical"` 时作用于 **高度**。
   * @default 11
   */
  dividerHitPx?: number
  /** 第一面板追加 class */
  firstClass?: string
  /** 第二面板追加 class */
  secondClass?: string
  /** 分隔条追加 class */
  dividerClass?: string
  /** `first` 具名插槽 */
  firstSlot?: ReactNode
  /** `second` 具名插槽 */
  secondSlot?: ReactNode
  /** 面板大小变化事件（Vue `update:firstSize` / v-model:firstSize） */
  onFirstSizeChange?: (firstSize: number | string) => void
  /** 拖拽开始事件 */
  onDragStart?: () => void
  /** 拖拽结束事件 */
  onDragEnd?: () => void
}

/** @internal */
export interface CwSplitStyles {
  // 根容器
  root: string

  // 第一个面板
  first: string

  // 分隔条
  divider: string
  dividerDragging: string

  // 分隔条拖拽手柄
  dividerHandle: string
  /** 常态发丝线（horizontal: 左缘 / vertical: 上缘） */
  dividerHandleLine: string
  /** hover / 拖拽：1px 品牌色（须盖过 hairline 的 width !important） */
  dividerHandleLineActive: string

  // 第二个面板
  second: string
}

export interface CwSplitTexts {
  // 分隔条的 aria-label
  dividerLabel: string
}

export interface CwSplitEmits {
  /**
   * 面板大小变化事件
   */
  (e: 'update:firstSize', firstSize: number | string): void
  /**
   * 拖拽开始事件
   */
  (e: 'drag-start'): void
  /**
   * 拖拽结束事件
   */
  (e: 'drag-end'): void
}
