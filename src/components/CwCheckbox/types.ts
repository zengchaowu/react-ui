import type { HTMLAttributes, ReactNode } from 'react'
import type { CwCheckboxAppearance, CwCheckboxTexts } from '@zengchaowu/ui-shared/components/CwCheckbox/types'

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

export interface CwCheckboxEmits {
  onChange?: (value: boolean | 'indeterminate') => void
}
