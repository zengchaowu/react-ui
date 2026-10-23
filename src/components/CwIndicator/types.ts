import type { HTMLAttributes } from 'react'

export type CwIndicatorVariant = 'dots' | 'numbered'

export type CwIndicatorScrollable = boolean | 'auto'

export interface CwIndicatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 总点数 */
  total: number
  /** 当前进度值（支持小数，例如 1.5） */
  value: number
  /** 展示形态：圆点 / 带序号圆标 */
  variant?: CwIndicatorVariant
  /** 序号模式下的视口最大宽度（px）；超出后启用横向滑动窗口 */
  maxWidth?: number
  /** 是否启用横向滑动：`auto` 在内容宽度超出 maxWidth 时启用 */
  scrollable?: CwIndicatorScrollable
  /** 序号圆标尺寸（px） */
  itemSize?: number
  /** 序号圆标间距（px） */
  itemSpacing?: number
  /** 自定义文本对象 */
  texts?: Partial<CwIndicatorTexts>
  /** 点的大小（像素） */
  dotSize?: number
  /** 点之间的间距（像素） */
  dotSpacing?: number
  /** 激活点的颜色 */
  activeColor?: string
  /** 未激活点的颜色 */
  inactiveColor?: string
  /** 连接线的颜色 */
  lineColor?: string
}

export interface CwIndicatorStyles {
  root: string
  container: string
  dot: string
  dotActive: string
  line: string
  spacer: string
  highlight: string
  highlightDot: string
  highlightLine: string
  numberedRoot: string
  numberedViewport: string
  numberedViewportScroll: string
  numberedViewportStatic: string
  numberChip: string
  numberChipActive: string
  numberChipInactive: string
}

export interface CwIndicatorTexts {
  // 当前组件不需要文本
}

export interface CwIndicatorEmits {
  // 当前组件不需要事件
}

export interface CwIndicatorExposed {
  // 当前组件不需要暴露方法
}
