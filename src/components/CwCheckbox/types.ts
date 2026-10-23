import type { HTMLAttributes, ReactNode } from 'react'

/**
 * 外观变体：
 * - `default`：行内复选框
 * - `block`：占满一行（Select 全选行等）
 */
export type CwCheckboxAppearance = 'default' | 'block'

export interface CwCheckboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onChange'> {
  value?: boolean | 'indeterminate'
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  appearance?: CwCheckboxAppearance
  texts?: Partial<CwCheckboxTexts>
  children?: ReactNode | ((scope: { disabled: boolean; readonly: boolean }) => ReactNode)
  className?: string
  onChange?: (value: boolean | 'indeterminate') => void
}

export interface CwCheckboxStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly?: string
  checkbox: string
  checkboxNormal: string
  checkboxChecked: string
  checkboxDisabled: string
  checkboxReadonlyNormal?: string
  checkboxReadonlyChecked?: string
  checkboxFocused: string
  icon: string
  iconNormal: string
  iconDisabled: string
  iconIndeterminate: string
  iconIndeterminateNormal: string
  iconIndeterminateDisabled: string
  checkIconStyle: string
  label: string
  labelNormal: string
  labelDisabled: string
  sizeSmall?: string
  sizeMedium?: string
  sizeLarge?: string
  labelSizeSmall?: string
  labelSizeMedium?: string
  labelSizeLarge?: string
}

export interface CwCheckboxTexts {}

export interface CwCheckboxEmits {
  onChange?: (value: boolean | 'indeterminate') => void
}
