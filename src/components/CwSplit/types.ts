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
   * 自定义样式对象
   */
  styles?: Partial<CwSplitStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwSplitTexts>
  /**
   * 分隔条可拖拽热区厚度（px）。视觉仍为 1px 中心线，通过负 margin 使 flex 净占位约 1px。
   * `direction="horizontal"` 时作用于分隔条 **宽度**；`direction="vertical"` 时作用于 **高度**（DevTools 里会看到 width 与 height 互换，属同一套逻辑）。
   * @default 11
   */
  dividerHitPx?: number
}

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
   * @param firstSize - 第一个面板的大小（比例或像素值）
   */
  'update:firstSize': [firstSize: number | string]
  /**
   * 拖拽开始事件
   */
  'drag-start': []
  /**
   * 拖拽结束事件
   */
  'drag-end': []
}

