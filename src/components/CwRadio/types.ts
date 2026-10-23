import type { HTMLAttributes, ReactNode } from 'react'

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

export interface CwRadioStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  rootBorder: string
  rootBorderNormal: string
  rootBorderDisabled: string
  rootBorderReadonly: string
  rootBorderChecked: string

  radio: string
  radioNormal: string
  radioChecked: string
  radioDisabled: string
  radioReadonlyNormal: string
  radioReadonlyChecked: string
  radioFocused: string

  icon: string
  iconNormal: string
  iconDisabled: string

  label: string
  labelNormal: string
  labelChecked: string
  labelDisabled: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
}

export interface CwRadioTexts {
  // 当前组件无硬编码文本，保留此接口以符合规范
}

export interface CwRadioEmits {
  onChange?: (value: boolean) => void
}
