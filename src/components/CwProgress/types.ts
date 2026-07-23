export type CwProgressDirection = 'vertical' | 'horizontal'

export interface CwProgressProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** 默认纵向，适合温度等紧凑参数条 */
  direction?: CwProgressDirection
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwProgressTexts>
}

export interface CwProgressStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  track: string
  trackNormal: string
  trackDisabled: string
  trackReadonly: string
  trackFocused: string
  fill: string
  fillNormal: string
  fillReadonly: string
  fillDisabled: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
}

export interface CwProgressTexts {
  /** 无障碍：滑块标签，由父级通过 aria-label 传入时可为空 */
  sliderLabel: string
}

export interface CwProgressEmits {
  'update:modelValue': [value: number]
  change: [value: number]
}
