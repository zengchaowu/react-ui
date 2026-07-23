export interface CwSwitchProps {
  modelValue?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwSwitchTexts>
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
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}
