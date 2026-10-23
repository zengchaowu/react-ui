import type { HTMLAttributes } from 'react'

export interface CwSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Vue `v-model` */
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readonly?: boolean
  /** 滑块尺寸 */
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwSliderTexts>
  /** Vue `update:modelValue` / `change` 事件 */
  onChange?: (value: number) => void
}

export interface CwSliderStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly?: string

  track: string
  trackNormal: string
  trackDisabled: string
  trackReadonly?: string
  trackFocused: string

  fill: string
  fillNormal: string
  fillReadonly: string
  fillDisabled: string

  thumb: string
  thumbNormal: string
  thumbDisabled: string
  thumbReadonly?: string

  label: string
  labelNormal: string
  labelDisabled: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
}

export interface CwSliderTexts {
  // 当前组件无硬编码文本，保留此接口以符合规范
}

export interface CwSliderEmits {
  onChange?: (value: number) => void
}
