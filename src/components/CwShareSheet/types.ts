import type { CwGridBreakpointConfig } from '../CwGrid/types'

export interface CwShareSheetOption {
  text: string
  icon: string
}

export interface CwShareSheetProps {
  /** 标题 */
  title?: string
  /** 选项列表 */
  options?: CwShareSheetOption[]
  /** 列数（每行显示的选项数） */
  columns?: number
  /** 响应式断点配置，优先级高于 columns */
  breakpoints?: CwGridBreakpointConfig
  /** 栅格间隔（gutter） */
  gutter?: number
  /** 行间距 */
  rowGap?: number
  /** 自定义文本 */
  texts?: Partial<CwShareSheetTexts>
  /** 选项选择事件 */
  onChange?: (type: 'option' | 'cancel', option?: CwShareSheetOption) => void
  /** 关闭事件 */
  onClose?: () => void
}

export interface CwShareSheetEmits {
  /** 选项选择事件 */
  change: [type: 'option' | 'cancel', option?: CwShareSheetOption]
  /** 关闭事件 */
  close: []
}

export interface CwShareSheetStyles {
  /** 根容器 */
  root: string
  /** 标题容器 */
  titleContainer?: string
  /** 标题文本 */
  title?: string
  /** 选项容器 */
  option: string
  /** 选项正常状态 */
  optionNormal: string
  /** 选项聚焦状态 */
  optionFocused: string
  /** 选项图标容器 */
  optionIcon: string
  /** 选项文本 */
  optionText: string
}

export interface CwShareSheetTexts {
  /** 标题文本 */
  title: string
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwShareSheetHandle {
  show: () => void
}
