// 栅格属性类型定义
export interface CwColBreakpointProps {
  /** 栅格占位格数，为 0 时相当于 display: none */
  span?: number
  /** 栅格左侧的间隔格数 */
  offset?: number
  /** 栅格向右移动格数 */
  push?: number
  /** 栅格向左移动格数 */
  pull?: number
}

// CwRow 组件类型定义
export interface CwRowProps {
  /** 栅格间隔 */
  gutter?: number
  /** 是否换行 */
  wrap?: boolean
  /** 垂直对齐方式 */
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  /** 水平排列方式 */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  /** 行间距，当 col 换行时的行间距 */
  rowGap?: number
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwRowTexts>
}

/** @internal */
export interface CwRowStyles {
  root: string
  nowrap: string
  alignTop: string
  alignMiddle: string
  alignBottom: string
  alignStretch: string
  justifyStart: string
  justifyCenter: string
  justifyEnd: string
  justifyBetween: string
  justifyAround: string
  justifyEvenly: string
}

export interface CwRowTexts {
  // CwRow组件本身没有硬编码文本
}

// CwCol 组件类型定义
export interface CwColProps {
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象。作为最小断点，必填 */
  xs: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  sm?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  md?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  lg?: number | CwColBreakpointProps
  /** 响应式栅格，可为栅格数（简写）或包含详细属性的对象 */
  xl?: number | CwColBreakpointProps
}

// CwWrapRow 组件类型定义
export interface CwWrapRowProps extends CwRowProps {
  wrap: true
  /** 最大行数 */
  maxRows: number
  /** 所有col的props */
  colPros: CwColProps
}
