import type { CwColProps } from '../CwRow/types'

/** Grid 布局列配置 */
export interface CwGridColumnConfig {
  /** 列数（1-24） */
  columns: number
  /** 列配置对象，用于自定义每列的 span、offset 等 */
  colConfig?: Partial<CwColProps>
}

/**
 * Grid 响应式断点配置（相对栅格容器实测宽度，CwGrid 内用 ResizeObserver 解析，非视口）
 */
export interface CwGridBreakpointConfig {
  /** xs：容器宽 ≥0（默认） */
  xs?: CwGridColumnConfig
  /** sm：容器宽 ≥400px（见 CW_GRID_CONTAINER_MIN_WIDTH） */
  sm?: CwGridColumnConfig
  /** md：容器宽 ≥480px */
  md?: CwGridColumnConfig
  /** lg：容器宽 ≥1024px */
  lg?: CwGridColumnConfig
  /** xl：容器宽 ≥1280px */
  xl?: CwGridColumnConfig
}

export interface CwGridProps {
  /** 默认列数（1-24），用于所有断点，除非在 breakpoints 中覆盖 */
  columns?: number
  /** 响应式断点配置，优先级高于 columns */
  breakpoints?: CwGridBreakpointConfig
  /** 栅格间隔（gutter） */
  gutter?: number
  /** 行间距 */
  rowGap?: number
  /** 是否换行 */
  wrap?: boolean
  /** 垂直对齐方式 */
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  /** 水平排列方式 */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  /**
   * 与 CwTabsStrip `tabFlushStart` 类似：每行首列贴容器左缘（实测布局为列内左对齐；padding 布局下去掉首列左 gutter）
   */
  flushStart?: boolean
  /**
   * 与 CwTabsStrip `tabFlushEnd` 类似：每行末列或最后一项贴容器右缘
   */
  flushEnd?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwGridStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwGridTexts>
}

export interface CwGridEmits {
  // CwGrid 组件本身不需要事件
}

export interface CwGridStyles {
  root: string
}

export interface CwGridTexts {
  // CwGrid 组件本身没有硬编码文本
}

