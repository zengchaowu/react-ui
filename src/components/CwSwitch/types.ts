import type { HTMLAttributes, ReactNode } from 'react'

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

export interface CwSwitchStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly?: string

  track: string
  trackNormal: string
  trackChecked: string
  trackDisabled: string
  trackReadonlyNormal?: string
  trackReadonlyChecked?: string
  trackFocused: string

  thumb: string
  thumbOff: string
  thumbOn: string
  thumbNormal: string
  thumbDisabled: string

  label: string
  labelNormal: string
  labelDisabled: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
}

export interface CwSwitchTexts {}

export interface CwSwitchEmits {
  onChange?: (value: boolean) => void
}
