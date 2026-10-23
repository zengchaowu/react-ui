import type { HTMLAttributes } from 'react'

export type CwProgressDirection = 'vertical' | 'horizontal'

export interface CwProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'size'> {
  /** Vue `v-model` */
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** 默认纵向，适合温度等紧凑参数条 */
  direction?: CwProgressDirection
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwProgressTexts>
  /** Vue `update:modelValue` / `change` 事件 */
  onChange?: (value: number) => void
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
  onChange?: (value: number) => void
}
