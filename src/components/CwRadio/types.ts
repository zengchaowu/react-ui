import type { HTMLAttributes, ReactNode } from 'react'
import type { CwRadioTexts } from '@zengchaowu/ui-shared/components/CwRadio/types'

export interface CwRadioProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onChange'> {
  /** 选中状态 */
  value?: boolean
  /** 禁用 */
  disabled?: boolean
  /** 只读 */
  readonly?: boolean
  /** 是否展示外部圆角边框 */
  border?: boolean
  /** 选中时是否高亮外观 */
  highlightSelected?: boolean
  /** 单选框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 自定义文本 */
  texts?: Partial<CwRadioTexts>
  children?: ReactNode | ((scope: { disabled: boolean; readonly: boolean }) => ReactNode)
  className?: string
  onChange?: (value: boolean) => void
}

export interface CwRadioEmits {
  onChange?: (value: boolean) => void
}
