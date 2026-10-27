import type { HTMLAttributes, ReactNode } from 'react'
import type { CwSwitchTexts } from '@zengchaowu/ui-shared/components/CwSwitch/types'

export interface CwSwitchProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'onChange'> {
  value?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwSwitchTexts>
  children?: ReactNode | ((scope: { disabled: boolean; readonly: boolean }) => ReactNode)
  className?: string
  onChange?: (value: boolean) => void
}

export interface CwSwitchEmits {
  onChange?: (value: boolean) => void
}
