import type { CwButtonGroupButton, CwButtonGroupTexts } from '@zengchaowu/ui-shared/components/CwButtonGroup/types'
﻿

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
