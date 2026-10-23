/**
 * 预设变体，对应设计稿中的按钮样式
 * - default: 白底灰边，深色文字
 * - secondary: 灰色底（写记录样式），无边框
 * - brand: 品牌浅底 + 品牌色文字（微信/电话/详情样式）
 * - brandOutline: 白底 + 品牌色边框 + 品牌色文字（保单列表「一键续保」样式）
 */
export type CwButtonGroupButtonVariant =
  | 'default'
  | 'secondary'
  | 'brand'
  | 'brandOutline'

export interface CwButtonGroupButton {
  id: string | number
  label: string
  onClick: () => void
  /** 预设变体，对应 CwButton 的 type + variant */
  variant?: CwButtonGroupButtonVariant
}

export interface CwButtonGroupStyles {
  /** 根容器 */
  root: string
  /** 单个按钮项 */
  buttonItem: string
}

export interface CwButtonGroupTexts {
  // 按钮组文案由 buttons[].label 提供，此处预留
}

export interface CwButtonGroupProps {
  buttons?: CwButtonGroupButton[]
  /** 是否从右往左渲染，默认 true */
  reverse?: boolean
  /** 按钮间距，默认 8px */
  gap?: string | number
  /** 按钮等宽，文本不同的按钮宽度一致 */
  equalWidth?: boolean
  /**
   * 按钮组填充剩余空间（在 flex 父容器中 flex: 1）
   * 每个按钮按内容宽度 + 等比分配多余空间
   */
  fillRemainingSpace?: boolean
  /** 组内 CwButton 的尺寸，默认 medium */
  buttonSize?: 'small' | 'medium' | 'large'
  /** 组内 CwButton 的形状，默认 rounded */
  buttonShape?: 'square' | 'rounded' | 'circle'
  /** 自定义文本 */
  texts?: Partial<CwButtonGroupTexts>
}
